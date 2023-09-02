import { createContext, Dispatch, ReactNode, Reducer, useReducer } from "react";
import { Chain, Wallet } from "../utils";
import { EvmProvider, SiteProvider, ProviderType } from "../lib";

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
};

const initialState: CubeSignerState = {
  authenticated: false,
  selectedWallet: undefined,
  provider: undefined,
};

/** Set of actions supported in the cubesigner context. */
export enum CubeSignerActionType {
  TokenAuthenticated = "TokenAuthenticated",
  TokenRevoked = "TokenRevoked",
  WalletSelected = "WalletSelected",
  ChainSelected = "ChainSelected",
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

type CubeSignerAction =
  | TokenAuthenticatedAction
  | TokenRevokedAction
  | WalletSelectedAction
  | ChainSelectedAction;

export const CubeSignerContext = createContext<[CubeSignerState, Dispatch<CubeSignerAction>]>([
  initialState,
  () => {
    /* no op */
  },
]);

const reducer: Reducer<CubeSignerState, CubeSignerAction> = (state, action) => {
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

      // if the new wallet has a different currency, we need to deselect the provider.
      if (action.payload.currency !== currentChain?.currency) {
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
        provider: providerByBlockchainCurrency(action.payload),
      };
    }

    default:
      return state;
  }
};

const providerByBlockchainCurrency = (chain: Chain): SiteProvider<ProviderType> => {
  switch (chain.currency) {
    case "ETH": {
      return new EvmProvider(chain);
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
