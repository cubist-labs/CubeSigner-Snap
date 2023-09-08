import {
  BlobSignRequest,
  EvmSignRequest,
  SolanaSignRequest,
  EvmSignResponse,
  BlobSignResponse,
  SolanaSignResponse,
  BtcSignRequest,
  BtcSignResponse,
} from "@cubist-labs/cubesigner-sdk";
import { RpcRequest, sanitize, Shape } from "./types";
import { assertParams } from "./utils";
import { providerErrors } from "@metamask/rpc-errors";
import { heading, text, panel, copyable } from "@metamask/snaps-ui";
import { getCurrentSignerSession } from "./session";

/**
 * Ask the user for confirmation
 */
// eslint-disable-next-line require-jsdoc
async function confirm(kind: string, key: string, request: string) {
  const approved = await snap.request({
    method: "snap_dialog",
    params: {
      type: "confirmation",
      content: panel([
        heading("Signature request"),
        text(`Do you want to sign the following "${kind}" request`),
        copyable(request),
        text(`with the following public key?`),
        copyable(key),
      ]),
    },
  });

  if (!approved) {
    throw providerErrors.userRejectedRequest();
  }
}

/**
 * RPC parameters for the {@link signBlob} method.
 */
export interface BlobSignParams {
  /** The ID of the key to use for signing */
  keyId: string;
  /** Blob sign request, as expected by the CubeSigner REST endpoint */
  body: BlobSignRequest;
}

/**
 * Sign an arbitrary blob.
 * @param {RpcRequest} rpc RPC request
 * @return {BlobSignResponse} Response received from the corresponding CubeSigner REST endpoint
 */
export async function signBlob(rpc: RpcRequest): Promise<BlobSignResponse> {
  const shape = <Shape>{
    keyId: "string",
    body: { message_base64: "string" },
  };
  const params = sanitize<BlobSignParams>(rpc.request.params, shape);
  await confirm("blob", params.keyId, JSON.stringify(params.body));
  const session = await getCurrentSignerSession();
  return (await session.signBlob(params.keyId, params.body)).data();
}

/**
 * RPC parameters for the {@link signEvm} method.
 */
export interface EvmSignParams {
  /** Material ID of the Secp key to use for signing */
  pubkey: string;
  /** EVM sign request, as expected by the CubeSigner REST endpoint */
  body: EvmSignRequest;
}

/**
 * Sign an EVM transaction.
 * @param {RpcRequest} rpc RPC request
 * @return {EvmSignResponse} Response received from the corresponding CubeSigner REST endpoint
 */
export async function signEvm(rpc: RpcRequest): Promise<EvmSignResponse> {
  const params = rpc.request.params as unknown as EvmSignParams;
  assertParams(params, "pubkey", "body");
  await confirm("evm", params.pubkey, JSON.stringify(params.body));
  const session = await getCurrentSignerSession();
  return (await session.signEvm(params.pubkey, params.body)).data();
}

/**
 * RPC parameters for the {@link signSolana} method.
 */
export interface SolanaSignParams {
  /** The material ID of the key to use for signing */
  pubkey: string;
  /** Solana sign request, as expected by the CubeSigner REST endpoint */
  body: SolanaSignRequest;
}

/**
 * Sign a Solana request.
 * @param {RpcRequest} rpc RPC request
 * @return {SolanaSignResponse} Response received from the corresponding CubeSigner REST endpoint
 */
export async function signSolana(rpc: RpcRequest): Promise<SolanaSignResponse> {
  const params = rpc.request.params as unknown as SolanaSignParams;
  assertParams(params, "pubkey", "body");
  await confirm("Solana", params.pubkey, JSON.stringify(params.body));
  const session = await getCurrentSignerSession();
  return (await session.signSolana(params.pubkey, params.body)).data();
}

/**
 * RPC parameters for the {@link signBtc} method.
 */
export interface BtcSignParams {
  /** The material ID of the key to use for signing */
  pubkey: string;
  /** BTC sign request, as expected by the CubeSigner REST endpoint */
  body: BtcSignRequest;
}

/**
 * Sign a BTC request.
 * @param {RpcRequest} rpc RPC request
 * @return {BTCSignResponse} Response received from the corresponding CubeSigner REST endpoint
 */
export async function signBtc(rpc: RpcRequest): Promise<BtcSignResponse> {
  const params = rpc.request.params as unknown as BtcSignParams;
  assertParams(params, "pubkey", "body");
  await confirm("BTC", params.pubkey, JSON.stringify(params.body));
  const session = await getCurrentSignerSession();
  return (await session.signBtc(params.pubkey, params.body)).data();
}
