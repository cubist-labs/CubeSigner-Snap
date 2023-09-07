import { KeyInfo } from "@cubist-labs/cubesigner-sdk";
import { Currency } from "../types";

/**
 * Structure of a network / chain.
 */
export interface Chain {
  /** Chain id. Only EVM chains have this indicator. */
  id?: number;

  /** Display name. */
  name: string;

  /** RPC url. Used to establish a connection to a provider/signer for transactions. */
  rpcUrl: string;

  /** Type of coin the chain uses */
  currency: Currency;
}

/**
 * Front end representation of a CubeSigner key.
 */
export interface Wallet extends KeyInfo {
  /** Currency the key will transact in. */
  currency: Currency;
}

/** Content we return when representing a signed transaction. */
export interface SignedTransaction {
  /** Chain transaction happened on */
  chain: Chain;
  /** Signed transaction hash */
  transactionHash: string;
}
