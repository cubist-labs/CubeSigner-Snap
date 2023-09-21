import { Chain } from ".";
import { Avalanche, Ethereum, Solana, Polygon, Bitcoin } from "../types";

/**
 * Fetches the set of chains available for transactions.
 * acadams - This location will feel inconsistent with getGeys's location,
 * That is because getKeys is calling our snap app and this is not.
 *
 * @param {string} keyType - the type of key of our wallet.
 *
 * @return {Chain[]} Chains we make available to make transactions on.
 */
export const getChainsByKeyType = (keyType: string): Chain[] => {
  switch (keyType) {
    case "SecpEthAddr": {
      return [
        {
          name: "Goerli",
          id: 5,
          rpcUrl: "https://rpc.ankr.com/eth_goerli",
          asset: Ethereum,
          displayName: "Ethereum Goerli Testnet",
          explorerUrl(tx) {
            return `https://goerli.etherscan.io/tx/${tx}`;
          },
        },
        {
          displayName: "Polygon Mumbai Testnet",
          asset: Polygon,
          rpcUrl: "https://rpc.ankr.com/polygon_mumbai",
          name: "Mumbai",
          id: 80001,
          explorerUrl: (tx) => {
            return `https://mumbai.polygonscan.com/tx/${tx}`;
          },
        },
        {
          displayName: "Avalanche Fuji Testnet",
          asset: Avalanche,
          rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
          id: 43113,
          name: "Fuji",
          explorerUrl: (tx) => {
            return `https://testnet.snowtrace.io/tx/${tx}`;
          },
        },
      ];
    }

    case "Ed25519SolanaAddr": {
      return [
        {
          displayName: "Solana Devnet",
          rpcUrl: "https://api.devnet.solana.com",
          asset: Solana,
          name: "solana-devnet",
          explorerUrl: (tx) => {
            return `https://explorer.solana.com/tx/${tx}?cluster=devnet`;
          },
        },
      ];
    }

    // bitcoin chains are not using the explore/rpc url.
    // those values will be ignored by the related provider.
    case "SecpBtc":
    case "SecpBtcTest": {
      return [
        {
          displayName: "Bitcoin Testnet",
          rpcUrl: "",
          asset: Bitcoin,
          name: "bitcoin-testnet",
          explorerUrl: () => {
            return "";
          },
        },
      ];
    }
    default:
      return [];
  }
};
