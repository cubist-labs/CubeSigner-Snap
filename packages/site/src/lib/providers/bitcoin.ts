import { SendTransactionRequest, SiteProvider } from "../providers";
import axios from "axios";
import assert from "assert";
import { Buffer } from "buffer";
import { Chain, SignedTransaction, Wallet, signBtc } from "../../utils";
import * as bc from "bitcoinjs-lib";

const SATOSHI_PER_BTC = 100000000;

/**
 * Convert Satoshis to BTC. This is a lossy conversion so should only be
 * used for display purposes (and only for non-production code).
 *
 * @param {bigint} satoshis - The amount of satoshis to convert.
 * @return {number} - The amount of BTC.
 */
export function convertSatToBtc(satoshis: bigint): number {
  return Number(satoshis) / SATOSHI_PER_BTC;
}

/**
 * Convert a hex string to a byte array buffer.
 *
 * @param {string} hex Input hex-encoded string, with or without the leading "0x"
 * @return {Buffer} Byte array.
 */
function hexToBytes(hex: string): Buffer {
  if (hex.length >= 2 && hex.slice(0, 2) == "0x") {
    hex = hex.substring(2);
  }
  return Buffer.from(hex, "hex");
}

/**
 * https://bitcoinops.org/en/tools/calc-size/
 *
 * @param {number} nInputs The number of transaction inputs.
 * @return {number} Transaction size in vbytes.
 */
function estimateTxVbytes(nInputs: number): number {
  const nOutputs = 2;
  const inputRate = 68;
  const outputRate = 31;
  const overhead = 10.5;
  return Math.ceil(overhead + nInputs * inputRate + nOutputs * outputRate);
}

/**
 * Implements `SignerAsync` interface from 'bitcoinjs' for a given wallet.
 */
class BtcSigner implements bc.SignerAsync {
  readonly #wallet: Wallet;
  /** Transaction that will be posted. */
  readonly #psbt: bc.Psbt;
  /** Index of the transaction input (in `this.psbt`) to sign */
  readonly #inputIndex: number;
  /** Unspent output corresponding to that input */
  readonly #utxo: Utxo;
  /** Compressed pubkey of the wallet (`this.#wallet`) to sign with */
  public readonly publicKey: Buffer;
  /** Bitcoin network to sign for */
  public readonly network: bc.networks.Network;

  /** Public wallet. */
  get address() {
    return this.#wallet.materialId;
  }

  /**
   * Constructor.
   * @param {Wallet} wallet Wallet on whose behalf to sign
   * @param {bc.Psbt} psbt Partially signed bitcoin transaction
   * @param {number} inputIndex Index of the transaction input to sign
   * @param {Utxo} utxo Unspent output corresponding to that input
   * @param {bc.networks.Network} network Bitcoin network
   */
  constructor(
    wallet: Wallet,
    psbt: bc.Psbt,
    inputIndex: number,
    utxo: Utxo,
    network: bc.networks.Network
  ) {
    this.#wallet = wallet;
    this.#psbt = psbt;
    this.#inputIndex = inputIndex;
    this.#utxo = utxo;
    this.network = network;

    const pk = hexToBytes(wallet.publicKey); // uncompressed
    assert(pk.length == 65);
    assert(pk[0] == 4);

    // compress it because that's what bitcoinjs wants
    const parity = pk[64] & 1;
    this.publicKey = pk.subarray(0, 33);
    this.publicKey[0] = 2 | parity;
  }

  /** @inheritdoc */
  public sign(_hash: Buffer): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      // translate psbt to the transaction needed for the RPC call
      const txInput = this.#psbt.txInputs[this.#inputIndex];
      const tx = {
        version: this.#psbt.version,
        lock_time: this.#psbt.locktime,
        input: [
          {
            script_sig: "", // always empty
            witness: [], // always empty
            // don't use `txInput.hash` for `txid` because even though those two started
            // out being the same, by now bitcoinjs has reversed `txInput.hash` (know knows why)
            previous_output: `${this.#utxo.txid}:${this.#utxo.vout}`,
            sequence: txInput.sequence,
          },
        ],
        output: this.#psbt.txOutputs.map((txO) => {
          return {
            value: txO.value,
            script_pubkey: txO.script.toString("hex"),
          };
        }),
      };

      // construct RPC request
      const paymentScript = bc.payments.p2pkh({
        pubkey: this.publicKey,
        network: this.network,
      }).output!;
      const requestBody = {
        pubkey: this.#wallet.materialId,
        body: {
          sig_kind: {
            Segwit: {
              input_index: this.#inputIndex,
              script_code: `0x${paymentScript.toString("hex")}`,
              value: this.#utxo.value,
              sighash_type: "All",
            },
          },
          tx: tx,
        },
      };

      // RPC call to sign BTC transaction
      signBtc(requestBody)
        .then((val) => {
          // signBtc returns the signature in compact format plus a recovery byte
          const sigBytes = hexToBytes(val.signature);
          assert(sigBytes.length === 65, `Unexpected signature length: ${sigBytes.length}`);
          // bitcoinjs insists on getting just the first 64 bytes (without the recovery byte)
          resolve(sigBytes.subarray(0, 64));
        })
        .catch(reject);
    });
  }

  /** @inheritdoc */
  public getPublicKey(): Buffer {
    return this.publicKey;
  }

  /** @inheritdoc */
  public async signSchnorr(_hash: Buffer): Promise<Buffer> {
    throw new Error("Unsupported: No Schnorr signatures.");
  }
}

/**
 * Returns the bitcoin network associated with a given bech32-encoded address.
 * @param {string} addr Bech32-encoded address.
 * @return {bc.networks.Network} Corresponding bitcoin network.
 */
function addrNetwork(addr: string): bc.networks.Network {
  const net = addr.startsWith("bc1")
    ? bc.networks.bitcoin
    : addr.startsWith("tb1")
    ? bc.networks.testnet
    : undefined;
  if (!net) {
    throw new Error(
      `Invalid bech32 addr: '${addr}'; address must start with 'bc1' for mainnet or 'tb1' for testnet`
    );
  }
  return net;
}

/**
 * Unspent transaction output.
 */
interface Utxo {
  /** Transaction id */
  txid: string;
  /** Transaction output index. */
  vout: number;
  /** Output value in satoshis */
  value: number;
}

/**
 * Bitcoin provider.
 */
export class BtcProvider {
  readonly network: bc.networks.Network;
  readonly baseUrl: string;

  /**
   * Fetches and returns unspent transaction outputs for a given wallet,
   * sorted by their amounts in the descending order.
   *
   * @param {Wallet} from The wallet whose unspent outputs to return.
   *
   * @return {Promise<Utxo[]>} The unspent transaction outputs for the wallet.
   */
  private async getUtxos(from: Wallet): Promise<Utxo[]> {
    const result: Utxo[] = [];
    const resp = await axios.get(`${this.baseUrl}/api/address/${from.materialId}/utxo`);
    for (const utxo of resp.data) {
      console.log("utxo", utxo);
      if (utxo.status?.confirmed) {
        result.push({
          txid: utxo.txid,
          vout: utxo.vout,
          value: utxo.value,
        });
      }
    }
    return result.sort((a, b) => b.value - a.value);
  }

  /** Returns the fee rate in SAT per transaction size in bytes targeting confirmation in 6 blocks */
  async getFeeRate(): Promise<number> {
    const resp = await axios.get(`${this.baseUrl}/api/fee-estimates`);
    return parseFloat(resp.data["6"] ?? "1");
  }

  /**
   * Returns estimated fee in SAT for a transaction with `nInputs` inputs.
   * @param {number} nInputs The number of transaction inputs.
   * @param {number} feeRate Current fee rate per transaction vbyte.
   * @return {number} Estimated fee in SAT.
   */
  async estimateFee(nInputs: number, feeRate?: number): Promise<number> {
    feeRate ??= await this.getFeeRate();
    const txVbytes = estimateTxVbytes(nInputs);
    return Math.ceil(txVbytes * feeRate);
  }

  /**
   * Returns the number of unspent satoshis for a given wallet
   * @param {Wallet} from The wallet whose balance to fetch
   * @return {Promise<bigint>} The number of unspent satoshis for a given wallet
   */
  async getBalance(from: Wallet): Promise<bigint> {
    let availableSatoshis = 0;
    for (const utxo of await this.getUtxos(from)) {
      availableSatoshis += utxo.value;
    }

    return BigInt(availableSatoshis);
  }

  /** @inheritdoc */
  async transfer(from: Wallet, toAddr: string, satoshisToSend: number): Promise<string> {
    const toAddrNet = addrNetwork(toAddr);

    // cannot send cross network
    if (toAddrNet != this.network) {
      throw new Error(`Cannot transfer funds cross net (from: ${this.network}, to: ${toAddrNet})`);
    }

    // start building transaction
    const pbst = new bc.Psbt({ network: this.network });
    pbst.setVersion(2);
    pbst.setLocktime(0);

    const feeRate = await this.getFeeRate();

    // find uxtos
    let totalSatoshisAvail = 0;
    const witnesses: Utxo[] = [];
    const utxoReceiverScript = bc.address.toOutputScript(from.materialId, this.network);
    for (const utxo of await this.getUtxos(from)) {
      // add uxto as input
      witnesses.push(utxo);
      pbst.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
          value: utxo.value,
          script: utxoReceiverScript,
        },
      });
      // break if we have enough for the transfer
      totalSatoshisAvail += utxo.value;
      const currentFee = await this.estimateFee(pbst.inputCount, feeRate);
      console.log(`Found unspent ${utxo.value} (${utxo.txid}:${utxo.vout})`);
      if (totalSatoshisAvail >= satoshisToSend + currentFee) {
        break;
      }
    }

    // bail if not enough funds available
    const fee = await this.estimateFee(pbst.inputCount, feeRate);
    if (totalSatoshisAvail < satoshisToSend + fee) {
      throw new Error(
        `Insufficient funds! Available: ${totalSatoshisAvail}, needed: ${satoshisToSend} + ${fee}`
      );
    }

    // add output for the target recipient
    console.log(`Adding output ${toAddr} -> ${satoshisToSend}`);
    pbst.addOutput({
      address: toAddr,
      value: satoshisToSend,
    });

    // the remainder goes back to the sender
    const satoshisToReturn = totalSatoshisAvail - satoshisToSend - fee;
    console.log(`Adding output ${from.materialId} -> ${satoshisToReturn}`);
    pbst.addOutput({
      address: from.materialId,
      value: satoshisToReturn,
    });

    // sign all inputs
    console.log(
      `Signing transfer to ${toAddr}: send ${satoshisToSend}, fee ${fee}, returning ${satoshisToReturn}`
    );

    // must sign one input at a time (concurrent signing doesn't work with snap)
    for (let i = 0; i < pbst.inputCount; i++) {
      const signer = new BtcSigner(from, pbst, i, witnesses[i], this.network);
      console.log(`Signing input ${i + 1} of ${pbst.inputCount}`);
      await pbst.signInputAsync(i, signer);
    }

    console.log("Calling finalizeAllInputs");
    pbst.finalizeAllInputs();

    // serialize transaction to hex
    const tx = pbst.extractTransaction().toHex();

    // post the transaction
    console.log(`Posting: ${tx}`);
    const resp = await axios.post(`${this.baseUrl}/api/tx`, tx);

    // done
    const conf = resp.data.toString();
    console.log(`Confirmation: ${conf}`);
    return conf;
  }

  /**
   * Constructor.
   * @param {bc.networks.Network} network Bitcoin network.
   */
  constructor(network: bc.networks.Network) {
    this.network = network;
    this.baseUrl =
      network === bc.networks.bitcoin
        ? "https://blockstream.info"
        : "https://blockstream.info/testnet";
  }
}

/**
 * Provider for interacting with bitcoin blockchains.
 */
export class BitcoinProvider extends SiteProvider<BtcProvider> {
  /** @inheritdoc */
  provider: BtcProvider;

  /**
   * Return the current balance in SAT.
   * @inheritdoc
   */
  async fetchBalance(wallet: Wallet): Promise<bigint> {
    if (!this.provider) {
      return BigInt(0);
    }
    return await this.provider.getBalance(wallet);
  }

  /** @inheritdoc */
  async sendTransaction(req: SendTransactionRequest): Promise<SignedTransaction> {
    if (!this.provider) {
      throw new Error("Must provide a provider");
    }

    const toAddr = req.toAddr.trim();
    const satoshisToSend = Math.round(parseFloat(req.txValue.trim()) * SATOSHI_PER_BTC);
    try {
      const hash = await this.provider.transfer(req.from, toAddr, satoshisToSend);
      return {
        chain: this.chain,
        transactionHash: hash,
      };
    } catch (e) {
      console.error("Failed to transfer BTC", e);
      throw new Error(`Failed to complete transaction. ${e.message}`);
    }
  }

  /** @inheritdoc */
  public getExplorerUrl(signedTransaction: SignedTransaction): string {
    const { transactionHash } = signedTransaction;
    return `${this.provider.baseUrl}/tx/${transactionHash}`;
  }

  /**
   * Returns the estimated fee in SAT for a transaction with 2 inputs.
   * @inheritdoc
   */
  public async fetchGasFee(_fromAddr: string): Promise<bigint> {
    const feeRate = await this.provider.getFeeRate();
    const presumedNumInputs = 2;
    const estimatedFee = Math.ceil(feeRate * estimateTxVbytes(presumedNumInputs));
    return BigInt(estimatedFee);
  }

  /**
   * Creates a new Bitcoin provider.
   *
   * @param {Chain} chain - details of the blockchain we are connecting to.
   */
  constructor(chain: Chain) {
    super(chain);
    // TODO: check 'chain' to make sure we're indeed on btc testnet
    this.provider = new BtcProvider(bc.networks.testnet);
  }
}
