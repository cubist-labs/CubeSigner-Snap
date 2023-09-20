import { defaultSnapId } from "../config";
import { GetSnapsResponse, Snap } from "../types";
import {
  BlobSignResponse,
  BtcSignResponse,
  EvmSignResponse,
  KeyInfo,
} from "@cubist-labs/cubesigner-sdk";

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
    return undefined;
  }
};

export const sendLogin = async () => {
  return await window.ethereum.request<void>({
    method: "wallet_invokeSnap",
    params: { snapId: defaultSnapId, request: { method: "login" } },
  });
};

export const sendLogout = async (): Promise<void> => {
  await window.ethereum.request({
    method: "wallet_invokeSnap",
    params: { snapId: defaultSnapId, request: { method: "logout" } },
  });
};

/**
 * @return {KeyInfo[]} The CubeSigner organization keys.
 */
export const getKeys = async (): Promise<KeyInfo[]> => {
  return (await window.ethereum.request<KeyInfo[]>({
    method: "wallet_invokeSnap",
    params: { snapId: defaultSnapId, request: { method: "get_keys" } },
  })) as KeyInfo[];
};

/**
 * Sends ethereum sign request to snap.
 *
 * TODO acadams - Need to decide if the site package should have a dependency on
 * the snap package. If so, add and reference the interface (instead of an explicit any).
 * @param {any} etherRequest Ethereum sign transaction request parameters.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const signEvm = async (etherRequest: any): Promise<EvmSignResponse> => {
  return (await window.ethereum.request({
    method: "wallet_invokeSnap",
    params: {
      snapId: defaultSnapId,
      request: {
        method: "sign_evm",
        params: etherRequest,
      },
    },
  })) as EvmSignResponse;
};

/**
 * Sends 'sign_blob' request to snap.
 *
 * @param {any} blobSignRequest Blob sign transaction request parameters.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const signBlob = async (blobSignRequest: any): Promise<BlobSignResponse> => {
  return (await window.ethereum.request({
    method: "wallet_invokeSnap",
    params: {
      snapId: defaultSnapId,
      request: {
        method: "sign_blob",
        params: blobSignRequest,
      },
    },
  })) as BlobSignResponse;
};

/**
 * Sends 'sign_btc' request to snap.
 *
 * @param {any} btcSignRequest BTC sign transaction request parameters
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const signBtc = async (btcSignRequest: any): Promise<BtcSignResponse> => {
  return (await window.ethereum.request({
    method: "wallet_invokeSnap",
    params: {
      snapId: defaultSnapId,
      request: {
        method: "sign_btc",
        params: btcSignRequest,
      },
    },
  })) as BtcSignResponse;
};

export const isLocalSnap = (snapId: string) => snapId.startsWith("local:");
