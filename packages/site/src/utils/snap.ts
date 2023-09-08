import { defaultSnapId } from "../config";
import { GetSnapsResponse, Snap } from "../types";
import { KeyInfo, Eth1SignResponse } from "@cubist-labs/cubesigner-sdk";

export const getSnaps = async (): Promise<GetSnapsResponse> => {
  return (await window.ethereum.request({
    method: "wallet_getSnaps",
  })) as unknown as GetSnapsResponse;
};

export const connectSnap = async (
  snapId: string = defaultSnapId,
  params: Record<"version" | string, unknown> = {}
) => {
  await window.ethereum.request({
    method: "wallet_requestSnaps",
    params: {
      [snapId]: params,
    },
  });
};

/**
 * Get the snap from MetaMask.
 *
 * @param {string?} version - The version of the snap to install (optional).
 * @return {Snap | undefined} The snap object returned by the extension.
 */
export const getSnap = async (version?: string): Promise<Snap | undefined> => {
  try {
    const snaps = await getSnaps();

    return Object.values(snaps).find(
      (snap) => snap.id === defaultSnapId && (!version || snap.version === version)
    );
  } catch (e) {
    console.log("Failed to obtain installed snap", e);
    return undefined;
  }
};

export const sendLogin = async () => {
  try {
    return await window.ethereum.request<boolean>({
      method: "wallet_invokeSnap",
      params: { snapId: defaultSnapId, request: { method: "login" } },
    });
  } catch (e) {
    throw new Error(e);
  }
};

export const sendLogout = async (): Promise<boolean> => {
  try {
    await window.ethereum.request({
      method: "wallet_invokeSnap",
      params: { snapId: defaultSnapId, request: { method: "logout" } },
    });

    return true;
  } catch (e) {
    throw new Error(e);
  }
};

/**
 * @return {KeyInfo[]} The CubeSigner organization keys.
 */
export const getKeys = async (): Promise<KeyInfo[]> => {
  try {
    return (await window.ethereum.request<KeyInfo[]>({
      method: "wallet_invokeSnap",
      params: { snapId: defaultSnapId, request: { method: "get_keys" } },
    })) as KeyInfo[];
  } catch (e) {
    throw new Error(e);
  }
};

/**
 * Sends ethereum sign request to snap.
 *
 * TODO acadams - Need to decide if the site package should have a dependency on
 * the snap package. If so, add and reference the interface (instead of an explicit any).
 * @param {any} etherRequest Ethereum sign transaction request parameters.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const signEth1 = async (etherRequest: any): Promise<Eth1SignResponse> => {
  try {
    return (await window.ethereum.request({
      method: "wallet_invokeSnap",
      params: {
        snapId: defaultSnapId,
        request: {
          method: "sign_evm",
          params: etherRequest,
        },
      },
    })) as Eth1SignResponse;
  } catch (e) {
    console.error("snap failed to sign ethereum transaction", e);
    throw new Error(e);
  }
};

export const isLocalSnap = (snapId: string) => snapId.startsWith("local:");
