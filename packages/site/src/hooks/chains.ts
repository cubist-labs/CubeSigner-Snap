import { useEffect, useState } from "react";
import { Chain } from "../utils";
import { Bitcoin, Evm, Solana } from "../types";

/**
 * Fetches the set of chains available for transactions.
 * acadams - This location will feel inconsistent with getGeys's location,
 * That is because getKeys is calling our snap app and this is not.
 *
 * @return {Chain[]} Chains we make available to make transactions on.
 */
export const getChains = async (): Promise<Chain[]> => {
  return await [
    {
      name: "goerli",
      id: 5,
      rpcUrl: "https://rpc.ankr.com/eth_goerli",
      asset: Evm,
      displayName: "Goerli",
    },
    {
      name: "sepolia",
      id: 11155111,
      rpcUrl: "https://rpc.ankr.com/eth_sepolia/",
      asset: Evm,
      displayName: "Sepolia",
    },
    {
      displayName: "Solana devnet",
      rpcUrl: "https://api.devnet.solana.com",
      asset: Solana,
      name: "solana-devnet",
    },
    {
      displayName: "Bitcoin Testnet",
      rpcUrl: "",
      asset: Bitcoin,
      name: "bitcoin-testnet",
    },
  ];
};

/**
 * Hook for fetching networks/chains.
 * @return {object} representing the fetching, error, and data state of blockchain networks.
 */
export const useChains = () => {
  const [chains, setChains] = useState<Chain[]>();
  const [loadingChains, setLoadingChains] = useState(false);
  const [loadingChainsError, setLoadingChainsError] = useState(false);

  useEffect(() => {
    setLoadingChains(true);
    getChains()
      .then((chains) => {
        setChains(chains);
      })
      .catch(() => setLoadingChainsError(true))
      .finally(() => setLoadingChains(false));
  }, []);

  return { chains, loadingChains, loadingChainsError };
};
