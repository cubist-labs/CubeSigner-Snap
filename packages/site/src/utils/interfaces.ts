import { Key } from "@cubist-labs/cubesigner-sdk";
import { Asset } from "../types";

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

  /** Type of coin/asset the chain uses (ethereum, bitcoin) */
  asset: Asset;

  /** Text to show when displaying the chain. */
  displayName: string;
}

/**
 * Front end representation of a CubeSigner key.
 */
export interface Wallet extends Pick<Key, "id" | "materialId" | "type" | "publicKey"> {
  /** Asset the key will transact in. */
  asset: Asset;
}

/** Content we return when representing a signed transaction. */
export interface SignedTransaction {
  /** Chain transaction happened on */
  chain: Chain;
  /** Signed transaction hash */
  transactionHash: string;
}
