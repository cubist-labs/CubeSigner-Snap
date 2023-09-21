import { Chain, SignedTransaction, Wallet } from "../utils";

/** Signing state */
export enum TransactionActionType {
  Cleared = "Cleared",
  Sending = "Sending",
  Published = "Published",
  Failed = "Failed",
}

/** Transaction cleared */
interface ClearedAction {
  type: TransactionActionType.Cleared;
}

/** Wallet was selected. */
interface SendingAction {
  type: TransactionActionType.Sending;
}

/** Chain was selected */
interface PublishedAction {
  type: TransactionActionType.Published;
  payload: SignedTransaction;
}

/** Transaction failed. */
interface FailedAction {
  type: TransactionActionType.Failed;
  error?: string;
}

/** Set of actions supported in the cubesigner context. */
export enum CubeSignerActionType {
  TokenAuthenticated = "TokenAuthenticated",
  TokenRevoked = "TokenRevoked",
  WalletSelected = "WalletSelected",
  ChainSelected = "ChainSelected",
  WalletReset = "WalletReset",
}

/** token was authenticated in app */
interface TokenAuthenticatedAction {
  type: CubeSignerActionType.TokenAuthenticated;
  payload: true;
}

/** Token was revoked in app */
interface TokenRevokedAction {
  type: CubeSignerActionType.TokenRevoked;
  payload: false;
}

/** Wallet was selected. */
interface WalletSelectedAction {
  type: CubeSignerActionType.WalletSelected;
  payload: Wallet;
}

/** Chain was selected */
interface ChainSelectedAction {
  type: CubeSignerActionType.ChainSelected;
  payload: Chain;
}

/** Wallet was reset. */
interface WalletResetAction {
  type: CubeSignerActionType.WalletReset;
}

export type CubeSignerAction =
  | TokenAuthenticatedAction
  | TokenRevokedAction
  | WalletSelectedAction
  | ChainSelectedAction
  | WalletResetAction;
export type TransactionAction = ClearedAction | SendingAction | PublishedAction | FailedAction;
