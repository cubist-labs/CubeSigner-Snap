import { SendTransactionRequest, SiteProvider } from "./providers";
import axios from "axios";
import assert from "assert";
import { Buffer } from "buffer";
import { Chain, SignedTransaction, Wallet, signBlob } from "../utils";
import * as bc from "bitcoinjs-lib";

// should be enough for short testnet transactions; we should instead estimate fee from fee rate and tx size
const DEFAULT_FEE = 250;

// Convert a hex string to a byte array buffer
function hexToBytes(hex: string): number[] {
  if (hex.length >= 2 && hex.slice(0, 2) == "0x") {
    hex = hex.substring(2);
  }
  var bytes: number[] = [];
  for (var c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.slice(c, c + 2), 16));
  }
  return bytes;
}

/**
 * Implements `SignerAsync` interface from 'bitcoinjs'
 */
class BtcSigner {
  readonly #wallet: Wallet;
  public readonly publicKey: Buffer;
  public readonly network: bc.networks.Network;

  get address() {
    return this.#wallet.materialId;
  }

  constructor(wallet: Wallet, network: bc.networks.Network) {
    this.#wallet = wallet;
    this.network = network;

    const pk = hexToBytes(wallet.publicKey); // uncompressed
    assert(pk.length == 65);
    assert(pk[0] == 4);

    // compress it because that's what bitcoinjs wants
    this.publicKey = Buffer.from(pk.slice(0, 33));
    this.publicKey[0] = 3;
  }

  public sign(hash: Buffer): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const message_base64 = hash.toString("base64");
      const req = {
        keyId: this.#wallet.id,
        body: { message_base64 },
      };
      signBlob(req)
        .then((val) => {
          console.log("signed blob", message_base64, val.signature);
          const sigBytes = hexToBytes(val.signature);
          assert(sigBytes.length == 65);
          // bitcoinjs wants only the first 64 bytes (i.e., no recovery id byte)
          const buf = Buffer.from(sigBytes.slice(0, 64));
          resolve(buf);
        })
        .catch(reject);
    });
  }

  public getPublicKey(): Buffer {
    return this.publicKey;
  }

  public async signSchnorr(_hash: Buffer): Promise<Buffer> {
    throw new Error("Unsupported: No Schnorr signatures.");
  }
}

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

interface Utxo {
  txid: string;
  vout: number;
  value: number;
}

export class BtcProvider {
  readonly network: bc.networks.Network;
  readonly baseUrl: string;

  private async getUtxos(from: Wallet): Promise<Utxo[]> {
    const result: Utxo[] = [];
    let resp = await axios.get(`${this.baseUrl}/api/address/${from.materialId}/utxo`);
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

  /**
   * Returns the number of unspent satoshis for a given wallet
   * @param {Wallet} from The wallet whose balance to fetch
   * @return The number of unspent satoshis for a given wallet
   */
  async getBalance(from: Wallet): Promise<bigint> {
    let availableSatoshis = 0;
    for (const utxo of await this.getUtxos(from)) {
      availableSatoshis += utxo.value;
    }
    return BigInt(availableSatoshis);
  }

  async transfer(
    from: Wallet,
    toAddr: string,
    satoshisToSend: number,
    fee: number
  ): Promise<string> {
    const toAddrNet = addrNetwork(toAddr);

    // cannot send cross network
    if (toAddrNet != this.network) {
      throw new Error(`Cannot transfer funds cross net (from: ${this.network}, to: ${toAddrNet})`);
    }

    // start building transaction
    const pbst = new bc.Psbt({ network: this.network });
    pbst.setVersion(2);
    pbst.setLocktime(0);

    // find uxtos
    let totalSatoshisAvail = 0;
    const utxoReceiverScript = bc.address.toOutputScript(from.materialId, this.network);
    for (const utxo of await this.getUtxos(from)) {
      // add uxto as input
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
      console.log(`Found unspent ${utxo.value} (${utxo.txid}:${utxo.vout})`);
      if (totalSatoshisAvail >= satoshisToSend + fee) {
        break;
      }
    }

    // bail if not enough funds available
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
    const signer = new BtcSigner(from, this.network);

    // must sign one input at a time (concurrent signing doesn't work with snap)
    for (let i = 0; i < pbst.inputCount; i++) {
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

  /** @inheritdoc */
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
    const satoshisToSend = parseInt(req.txValue.trim());

    try {
      let hash = await this.provider.transfer(req.from, toAddr, satoshisToSend, DEFAULT_FEE);
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

  /** @inheritdoc */
  public async fetchGasFee(_fromAddr: string): Promise<bigint> {
    // TODO: hard coded for now; should be enough for testnet and the demo
    return BigInt(DEFAULT_FEE);
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
