import { AbstractProvider, Provider, getDefaultProvider, parseEther, toBeHex } from "ethers";
import { Chain, SignedTransaction, Wallet, signEvm } from "../utils";
import { BtcProvider } from "./bitcoin";
import * as solana from "./providers/solana";

/** Set of providers we're supporting */
export type ProviderType = Provider | BtcProvider | solana.Provider;

/**
 * CubeSigner's abstraction layer for providers.
 * This implementation allows components using providers
 * to abstract away which blockchain a wallet is interacting with.
 */
export abstract class SiteProvider<T> {
  /** Provider used to interact with a blockchain. */
  abstract provider: T;
  /** Blockchain we are interacting with. */
  readonly chain: Chain;
  /** For a given wallet, fetches its current balance. */
  abstract fetchBalance(wallet: Wallet): Promise<bigint>;
  /** Fetches the estimated gas fee for a transaction. */
  abstract fetchGasFee(fromAddr: string): Promise<bigint>;

  /**
   * Broadcasts an ethereum transaction using the given provider.
   *
   * @param {SendTransactionRequest} req - transaction request.
   *
   * @return {SignedTransaction} evm transaction response
   */
  abstract sendTransaction(req: SendTransactionRequest): Promise<SignedTransaction>;

  /**
   * Generates a url to the chains respective explorer.
   * We are not using the class's chain because it isn't guaranteed
   * to be the same as the completed transaction's.
   *
   * @param {Chain} chain - chain the given transaction was signed on.
   * @param {string} transactionHash - signed transaction.
   *
   * @returns {string} url to a blockchain explorer.
   */
  abstract getExplorerUrl(signedTransaction: SignedTransaction): string;

  /**
   * Creates a new providor class.
   *
   * @param {Chain} chain - blockchain network the provider is connecting to.
   */
  constructor(chain: Chain) {
    this.chain = chain;
  }
}

/**
 * Properties needed to make a transaction request.
 */
export interface SendTransactionRequest {
  /**  wallet sending the crypto */
  from: Wallet;
  /**  address receiving the crypto */
  toAddr: string;
  /**  amount of crypto to send */
  txValue: string;
}

/**
 * Provider for interacting with an ethereum blockchain.
 */
export class EvmProvider extends SiteProvider<AbstractProvider> {
  /** @inheritdoc */
  provider: AbstractProvider;

  /** @inheritdoc */
  async fetchBalance(wallet: Wallet): Promise<bigint> {
    if (!this.provider) {
      return BigInt(0);
    }

    return await this.provider.getBalance(wallet.materialId);
  }

  /** @inheritdoc */
  async sendTransaction(req: SendTransactionRequest): Promise<SignedTransaction> {
    if (!this.provider) {
      throw new Error("Must provide a provider");
    }

    const fromAddr = req.from.materialId.trim();
    const toAddr = req.toAddr.trim();
    const txValue = req.txValue.trim();

    const nonce = await this.provider.getTransactionCount(fromAddr!);
    const feeData = await this.provider.getFeeData();

    // need a populated unsigned transaction to estimate gas.
    // so creating prematurely to make said request.
    const tx = {
      from: fromAddr,
      to: toAddr,
      value: toBeHex(parseEther(txValue)),
      maxFeePerGas: toBeHex(feeData?.maxFeePerGas as bigint),
      maxPriorityFeePerGas: toBeHex(feeData?.maxPriorityFeePerGas as bigint),
      nonce: nonce || 0,
    };

    const gas = await this.provider.estimateGas(tx);

    const signTransactionRequest = {
      pubkey: fromAddr,
      body: {
        chain_id: this.chain.id,
        tx: {
          ...tx,
          type: "0x02",
          gas: toBeHex(gas!),
          // our signer expects at hex string, this reassignment is intentional
          nonce: toBeHex(nonce || 0),
        },
      },
    };

    try {
      const signResponse = await signEvm(signTransactionRequest);
      const broadcastResponse = await this.provider?.broadcastTransaction(
        signResponse.rlp_signed_tx
      );

      return {
        chain: this.chain,
        transactionHash: broadcastResponse?.hash,
      };
    } catch (e) {
      throw new Error(`Failed to complete transaction. - ${e.message}`);
    }
  }

  /** @inheritdoc */
  public getExplorerUrl(signedTransaction: SignedTransaction): string {
    const { chain, transactionHash } = signedTransaction;
    return `https://${chain.name}.etherscan.io/tx/${transactionHash}`;
  }

  /** @inheritdoc */
  public async fetchGasFee(fromAddr: string): Promise<bigint> {
    const tx = { from: fromAddr };

    return this.provider.estimateGas(tx);
  }

  /**
   * Creates a new Evm provider.
   *
   * @param {Chain} chain - details of the ethereum blockchain we are connecting to.
   */
  constructor(chain: Chain) {
    super(chain);
    this.provider = getDefaultProvider(chain.rpcUrl);
  }
}
