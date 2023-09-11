import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { SiteProvider, SendTransactionRequest } from "../providers";
import { Chain, getKeys, signBlob, SignedTransaction, Wallet } from "../../utils";
import { Buffer } from "buffer";

/** The Solana provider type. */
export type Provider = Connection;

/**
 * Convert Lamports to Sol. This is a lossy conversion so should only be used for display purposes (and only for non-production code).
 * @param {bigint} lamports - The amount of lamports to convert.
 * @return {number} - The amount of SOL.
 */
export function formatLamportsToSol(lamports: bigint): number {
  return Number(lamports) / LAMPORTS_PER_SOL;
}

/** Solana provider. */
export class SolanaProvider extends SiteProvider<Connection> {
  provider: Connection;
  /**
   * Creates a new Solana provider.
   * @param {Chain} chain - The chain to connect to.
   */
  constructor(chain: Chain) {
    super(chain);
    this.provider = new Connection(chain.rpcUrl, "confirmed");
  }

  /**
   * Fetches the balance of an account.
   * @param {Wallet} wallet - The wallet to fetch the balance of.
   * @return {Promise<bigint>} - The balance of the wallet in SOL.
   */
  async fetchBalance(wallet: Wallet): Promise<bigint> {
    if (!this.provider) {
      return BigInt(0);
    }
    const pk = new PublicKey(wallet.materialId);
    const balance = await this.provider.getBalance(pk);
    return BigInt(balance);
  }

  /** Fetches the estimated gas fee for a transaction.
   * @param {string} fromAddr - The address to fetch the gas fee for.
   * @return {Promise<bigint>} - The estimated gas fee in SOL.
   * */
  async fetchGasFee(fromAddr: string): Promise<bigint> {
    const fromPubkey = new PublicKey(fromAddr);
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey: fromPubkey,
        lamports: 10,
      })
    );
    tx.recentBlockhash = (await this.provider.getLatestBlockhash()).blockhash;
    tx.feePayer = fromPubkey;
    const estimate = await tx.getEstimatedFee(this.provider);
    if (estimate !== null) {
      return BigInt(estimate);
    }
    throw new Error("Failed to estimate gas fee");
  }

  /**
   * Sends SOL from one address to another.
   * @param {SendTransactionRequest} req - The transaction request.
   * @return {Promise<SignedTransaction>} - The signed transaction hash.
   */
  async sendTransaction(req: SendTransactionRequest): Promise<SignedTransaction> {
    if (!this.provider) {
      throw new Error("Must provide a provider");
    }

    const fromPubkey = new PublicKey(req.fromAddr.trim());
    const toPubkey = new PublicKey(req.toAddr.trim());
    const lamports = parseFloat(req.txValue.trim()) * LAMPORTS_PER_SOL;

    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports,
      })
    );
    tx.recentBlockhash = (await this.provider.getLatestBlockhash()).blockhash;
    tx.feePayer = fromPubkey;
    const fromCubeSignerKey = (await getKeys()).find((k) => k.materialId === fromPubkey.toBase58());
    if (!fromCubeSignerKey) {
      throw new Error(`Your session does not have access to key ${fromPubkey.toBase58()}`);
    }
    const resp = await signBlob({
      keyId: fromCubeSignerKey.id,
      body: { message_base64: tx.serializeMessage().toString("base64") },
    });
    // conver the hex-encoded signature to bytes
    const sigBytes = Buffer.from(resp.signature.slice(2), "hex");
    // add signature to transaction
    tx.addSignature(fromPubkey, sigBytes);

    const txHash = await this.provider.sendRawTransaction(tx.serialize());
    return {
      chain: this.chain,
      transactionHash: txHash,
    };
  }

  /**
   * Generates a url to the chains respective explorer. Currently only supports Solana devnet.
   * @param {SignedTransaction} signedTransaction - The signed transaction.
   * @return {string} - The url to the explorer.
   * */
  public getExplorerUrl(signedTransaction: SignedTransaction): string {
    const { chain, transactionHash } = signedTransaction;
    // if this.chain.displayName has devnet in it
    if (this.chain.name === "solana-devnet") {
      return `https://explorer.solana.com/tx/${transactionHash}?cluster=devnet`;
    }
    throw new Error(`Explorer URL for ${chain.displayName} not implemented`);
  }
}
