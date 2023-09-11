import { useEffect, useState } from "react";
import { getKeys, Wallet } from "../utils";
import { Bitcoin, Asset, Evm, Solana } from "../types";

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
            return { ...key, asset: getAssetByKeyType(key.type) };
          })
        );
      })
      .catch(() => setLoadingWalletsError(true))
      .finally(() => setLoadingWallets(false));
  }, []);

  return { wallets, loadingWallets, loadingWalletsError };
};

/**
 * Helper function for mapping a CubeSigner KeyType to its respective asset.
 *
 * TODO acadams - figure out where typing of key type should reside.
 * TODO acadams - reference typed variable instead of hard coding strings.
 *
 * @param {string} keyType Type of CubeSigner key.
 *
 * @return {Asset}
 */
export const getAssetByKeyType = (keyType: string): Asset => {
  switch (keyType) {
    case "SecpEthAddr":
    case "BlsInactive":
    case "BlsPub": {
      return Evm;
    }

    case "Ed25519SolanaAddr": {
      return Solana;
    }

    case "SecpBct":
    case "SecpBtcTest": {
      return Bitcoin;
    }

    default:
      throw new Error(`unsupport key type of ${keyType}`);
  }
};
