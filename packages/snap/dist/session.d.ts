import { SignerSession, SignerSessionFile } from "@cubist-labs/cubesigner-sdk";
import { RpcRequest } from "./types";
/**
 * Log into CubeSigner (if not already logged in) and save the session info in Snap managed state.
 * @param {RpcRequest} rpc RPC request
 * */
export declare function login(rpc: RpcRequest): Promise<void>;
/**
 * Log out of CubeSigner (if logged in) and revoke the token.
 * @param {RpcRequest} rpc RPC request
 * */
export declare function logout(rpc: RpcRequest): Promise<void>;
/**
 * RPC parameters for the {@link login} method.
 */
export interface LoginParams {
    /** The base64 encoded session token*/
    token_base64: string;
}
/**
 * Get the current session.
 * @return {SignerSession} The current session.
 */
export declare function getCurrentSignerSession(): Promise<SignerSession>;
/** Persistent signer state. */
export type CubeSignerState = SignerSessionFile;
