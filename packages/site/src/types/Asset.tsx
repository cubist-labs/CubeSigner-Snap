/** Blockchain currencies we are supporting. */
import { ReactComponent as EthIcon } from "../assets/eth_icon.svg";
import { ReactComponent as SolIcon } from "../assets/sol_icon.svg";
import { ReactComponent as BtcIcon } from "../assets/btc_icon.svg";
import { WalletIcon } from "../assets/WalletIcon";
import { ReactNode } from "react";
import { formatEther } from "ethers";
import { formatLamportsToSol } from "../lib/providers/solana";

/**
 * Helper type Asset for managing unit, display, and other helper functions.
 * for the blockchain currencies we are supporting.
 */
export type Asset = {
  /** shorted unit. */
  unit: string;
  /** Name of the coin. */
  displayName: string;
  /** Small icon representation of the coin */
  Icon: () => ReactNode;
  /** Cubist image icon for asset. */
  WalletIcon: () => ReactNode;

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
export const Evm: Asset = {
  unit: "ETH",
  displayName: "Ethereum",
  WalletIcon: () => (
    <WalletIcon
      background={"#E8DDD1"}
      topLeft={"#000C49"}
      bottomLeft={"#000C49"}
      bottomRight={"#ED643D"}
    />
  ),
  Icon: () => <EthIcon />,
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
  WalletIcon: () => (
    <WalletIcon
      background={"#ED643D"}
      topLeft={"#000C49"}
      bottomLeft={"#E8DDD1"}
      bottomRight={"#000C49"}
    />
  ),
  Icon: () => <SolIcon />,
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
  WalletIcon: () => (
    <WalletIcon
      background={"#E9B878"}
      topLeft={"#000C49"}
      bottomLeft={"#E8DDD1"}
      bottomRight={"#000C49"}
    />
  ),
  Icon: () => <BtcIcon />,
  balanceDisplayText: (amt) => {
    return `${amt} SATS`;
  },
};
