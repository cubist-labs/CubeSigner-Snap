import { formatEther } from "ethers";
import { Currency } from "../types";

/**
 * Function for mapping a CubeSigner KeyType to its respective currency value.
 * TODO acadams - figure out where typing of key type should reside.
 * TODO acadams - reference typed variable instead of hard coding strings.
 *
 * @param {string} keyType Type of CubeSigner key.
 *
 * @return {Currency}
 */
export const keyTypeToCurrency = (keyType: string): Currency => {
  switch (keyType) {
    case "SecpEthAddr":
    case "BlsInactive":
    case "BlsPub": {
      return "ETH";
    }

    case "Ed25519SolanaAddr": {
      return "SOL";
    }

    case "SecpBct":
    case "SecpBtcTest": {
      return "BTC";
    }

    case "Ed25519SuiAddr": {
      return "SUI";
    }
    case "Ed25519AptosAddr": {
      return "APTOS";
    }

    default:
      throw new Error(`unsupport key type of ${keyType}`);
  }
};

/**
 * Formats the display text of a given balance and chain.
 *
 * TODO acadams - need to come up with a better class structure so formatters like
 * this live their instead of needing an if/else block.
 *
 * @param {bigint} balance - bigint value of wallet.
 * @param {string} currency - currency unit of balance.
 *
 * @return {string} formatted balance string
 */
export const balanceDisplayText = (balance: bigint, currency: Currency): string => {
  if (currency === "ETH") {
    return `${formatEther(balance!)} ETH`;
  } else {
    return balance.toString();
  }
};
