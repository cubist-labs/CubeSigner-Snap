import { useEffect, useState } from "react";
import { getKeys, Wallet } from "../utils";

/**
 * Hook for fetching wallets.
 * @return {object} representing the fetching, error, and data state of cubesigner wallets.
 */
export const useWallets = () => {
  const [wallets, setWallets] = useState<Wallet[]>();
  const [loadingWallets, setLoadingWallets] = useState(false);
  const [loadingWalletsError, setLoadingWalletsError] = useState(false);

  useEffect(() => {
    setLoadingWallets(true);
    getKeys()
      .then((keys) => {
        setWallets(keys);
      })
      .catch(() => setLoadingWalletsError(true))
      .finally(() => setLoadingWallets(false));
  }, []);

  return { wallets, loadingWallets, loadingWalletsError };
};
