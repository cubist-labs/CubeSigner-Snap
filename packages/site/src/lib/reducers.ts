import { Reducer } from "react";
import { SignedTransaction } from "../utils";

interface TransactionState {
  sending: boolean;
  error: boolean;
  tx?: SignedTransaction;
}

export const initialTransactionState: TransactionState = {
  error: false,
  sending: false,
  tx: undefined,
};

/** Signing state */
export enum SignTransactionActions {
  Cleared = "Cleared",
  Sending = "Sending",
  Published = "Published",
  Failed = "Failed",
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SignTransactionDispatch = { type: SignTransactionActions; payload?: any };

export const signTransactionReducer: Reducer<TransactionState, SignTransactionDispatch> = (
  state: TransactionState,
  action: SignTransactionDispatch
): TransactionState => {
  switch (action.type) {
    case SignTransactionActions.Cleared: {
      return initialTransactionState;
    }
    case SignTransactionActions.Sending: {
      return {
        ...state,
        sending: true,
        error: false,
        tx: undefined,
      };
    }
    case SignTransactionActions.Published: {
      return {
        ...state,
        sending: false,
        tx: action.payload,
      };
    }
    case SignTransactionActions.Failed: {
      return {
        ...state,
        sending: false,
        error: true,
        tx: undefined,
      };
    }
  }
};
