import { ReactNode } from "react";
import { formatEther } from "ethers";
import { BitcoinIcon, PolygonIcon, SolanaIcon, EthereumIcon, AvalancheIcon } from "../assets";
import { formatLamportsToSol } from "../lib/providers/solana";
import { convertSatToBtc } from "../lib/providers/bitcoin";

/**
 * Helper type Asset for managing unit, display, and other helper functions.
 * for the blockchain currencies we are supporting.
 */
export type Asset = {
  /** shorted unit. */
  unit: string;
  /** Name of the coin. */
  displayName: string;
  /** Icon representation of the asset */
  Icon: () => ReactNode;

  /**
   * Formats the display text of a given balance and chain.
   *
   * @param {bigint} balance - value of wallet.
   * @param {string} asset - asset related to the balance.
   *
   * @return {string} formatted balance string
   */
  balanceDisplayText: (amt: bigint) => string;
};

/**
 * Ethereum asset
 */
export const Ethereum: Asset = {
  unit: "ETH",
  displayName: "Ethereum",
  Icon: () => <EthereumIcon />,
  balanceDisplayText: (amt) => {
    return `${formatEther(amt)} ETH`;
  },
};

/**
 * Ethereum asset
 */
export const Solana: Asset = {
  unit: "SOL",
  displayName: "Solana",
  Icon: () => <SolanaIcon />,
  balanceDisplayText: (amt) => {
    return `${formatLamportsToSol(amt)} SOL`;
  },
};

/**
 * BTC asset
 */
export const Bitcoin: Asset = {
  unit: "BTC",
  displayName: "Bitcoin",
  Icon: () => <BitcoinIcon />,
  balanceDisplayText: (amt) => {
    return `${convertSatToBtc(amt)} BTC`;
  },
};

export const Polygon: Asset = {
  unit: "MATIC",
  displayName: "Polygon",
  Icon: () => <PolygonIcon />,
  balanceDisplayText: (amt) => {
    return `${formatEther(amt)} MATIC`;
  },
};

export const Avalanche: Asset = {
  unit: "AVAX",
  displayName: "Avalanche",
  Icon: () => <AvalancheIcon />,
  balanceDisplayText: (amt) => {
    return `${formatEther(amt)} AVAX`;
  },
};
