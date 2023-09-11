import { createContext, Dispatch, ReactNode, Reducer, useReducer } from "react";
import { Chain, SignedTransaction, Wallet } from "../utils";
import {
  EvmProvider,
  SiteProvider,
  ProviderType,
  TransactionAction,
  TransactionActionType,
  CubeSignerAction,
  CubeSignerActionType,
  BitcoinProvider,
} from "../lib";
import { Bitcoin, Evm, Solana } from "../types";
import { SolanaProvider } from "../lib/providers/solana";

/**
 * Global cubesigner state.
 */
export type CubeSignerState = {
  /** If true, user has a valid session auth token. */
  authenticated: boolean;

  /** Wallet the user has selected for making transactions. */
  selectedWallet?: Wallet;

  /** Provider needed to make transactions. */
  provider?: SiteProvider<ProviderType>;
  sending: boolean;
  error: boolean;
  tx?: SignedTransaction;
};

const initialState: CubeSignerState = {
  authenticated: false,
  selectedWallet: undefined,
  provider: undefined,
  error: false,
  sending: false,
  tx: undefined,
};

export const CubeSignerContext = createContext<
  [CubeSignerState, Dispatch<CubeSignerAction | TransactionAction>]
>([
  initialState,
  () => {
    /* no op */
  },
]);

/**
 * @param {CubeSignerState} state current state.
 * @param {CubeSignerAction} action action occuring to the state.
 *
 * @returns {CubeSignerAction} Updated state.
 */
const reducer: Reducer<CubeSignerState, CubeSignerAction | TransactionAction> = (state, action) => {
  switch (action.type) {
    case CubeSignerActionType.TokenAuthenticated: {
      return {
        ...state,
        authenticated: action.payload,
      };
    }

    case CubeSignerActionType.TokenRevoked: {
      return {
        ...state,
        authenticated: action.payload,
        selectedWallet: undefined,
        provider: undefined,
      };
    }

    case CubeSignerActionType.WalletSelected: {
      const currentChain = state.provider?.chain;

      // if the new wallet transacts a different asset, we need to deselect the provider.
      if (action.payload.asset !== currentChain?.asset) {
        return {
          ...state,
          selectedWallet: action.payload,
          provider: undefined,
        };
      } else {
        return {
          ...state,
          selectedWallet: action.payload,
        };
      }
    }

    case CubeSignerActionType.ChainSelected: {
      return {
        ...state,
        provider: getProvider(action.payload),
      };
    }

    case CubeSignerActionType.WalletReset: {
      return {
        ...state,
        selectedWallet: undefined,
        provider: undefined,
        error: false,
        sending: false,
        tx: undefined,
      };
    }
    case TransactionActionType.Cleared: {
      return {
        ...state,
        error: false,
        sending: false,
        tx: undefined,
      };
    }
    case TransactionActionType.Sending: {
      return {
        ...state,
        sending: true,
        error: false,
        tx: undefined,
      };
    }
    case TransactionActionType.Published: {
      return {
        ...state,
        sending: false,
        tx: action.payload,
      };
    }
    case TransactionActionType.Failed: {
      return {
        ...state,
        sending: false,
        error: true,
        tx: undefined,
      };
    }
    default:
      return state;
  }
};

/**
 *
 * @param chain For a given chain, creates and returns a provider.
 *
 * @returns {SiteProvider} a provider for interacting with a blockchain.
 */
const getProvider = (chain: Chain): SiteProvider<ProviderType> => {
  switch (chain.asset) {
    case Evm: {
      return new EvmProvider(chain);
    }
    case Solana: {
      return new SolanaProvider(chain);
    }

    case Bitcoin: {
      return new BitcoinProvider(chain);
    }

    default: {
      throw new Error("Invalid chain provided.");
    }
  }
};

/**
 * CubeSigner context provider to handle CubeSigner status and data.
 *
 * @param props - React Props.
 * @param props.children - React component to be wrapped by the Provider.
 * @returns JSX component.
 */
export const CubeSignerProvider = ({ children }: { children: ReactNode }) => {
  if (typeof window === "undefined") {
    return <>{children}</>;
  }

  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <CubeSignerContext.Provider value={[state, dispatch]}>{children}</CubeSignerContext.Provider>
  );
};
