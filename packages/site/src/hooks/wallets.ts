import { useEffect, useState } from "react";
import { keyTypeToCurrency, getKeys, Wallet } from "../utils";

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
        setWallets(
          keys.map((key) => {
            return { ...key, currency: keyTypeToCurrency(key.key_type) };
          })
        );
      })
      .catch(() => setLoadingWalletsError(true))
      .finally(() => setLoadingWallets(false));
  }, []);

  return { wallets, loadingWallets, loadingWalletsError };
};
