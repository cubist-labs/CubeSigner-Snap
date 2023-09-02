import { BlobSignRequest, Eth1SignRequest, SolanaSignRequest, Eth1SignResponse, BlobSignResponse, SolanaSignResponse, BtcSignRequest, BtcSignResponse } from "@cubist-labs/cubesigner-sdk";
import { RpcRequest } from "./types";
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
export declare function signBlob(rpc: RpcRequest): Promise<BlobSignResponse>;
/**
 * RPC parameters for the {@link signEvm} method.
 */
export interface Eth1SignParams {
    /** Material ID of the Secp key to use for signing */
    pubkey: string;
    /** Eth1 sign request, as expected by the CubeSigner REST endpoint */
    body: Eth1SignRequest;
}
/**
 * Sign an EVM transaction.
 * @param {RpcRequest} rpc RPC request
 * @return {Eth1SignResponse} Response received from the corresponding CubeSigner REST endpoint
 */
export declare function signEvm(rpc: RpcRequest): Promise<Eth1SignResponse>;
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
export declare function signSolana(rpc: RpcRequest): Promise<SolanaSignResponse>;
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
export declare function signBtc(rpc: RpcRequest): Promise<BtcSignResponse>;
