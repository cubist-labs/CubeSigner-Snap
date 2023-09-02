/**
 * Detect if the wallet injecting the ethereum object is Flask.
 *
 * @return {boolean} - if the MetaMask version is Flask, returns true.
 */
export const isFlask = async () => {
  const provider = window.ethereum;

  try {
    const clientVersion = await provider?.request({
      method: "web3_clientVersion",
    });

    const isFlaskDetected = (clientVersion as string[])?.includes("flask");

    return Boolean(provider && isFlaskDetected);
  } catch {
    return false;
  }
};