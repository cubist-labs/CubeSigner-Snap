import { CubeSigner, Key, SessionStorage } from ".";
import { SessionManager, SignerSessionObject } from "./session/session_manager";
import { components, paths, Client } from "./client";
export type CreateSignerSessionRequest = paths["/v0/org/{org_id}/roles/{role_id}/tokens"]["post"]["requestBody"]["content"]["application/json"];
export type RefreshSignerSessionRequest = paths["/v1/org/{org_id}/token/refresh"]["patch"]["requestBody"]["content"]["application/json"];
export type KeyInfo = components["schemas"]["KeyInfo"];
export type Eth1SignRequest = paths["/v1/org/{org_id}/eth1/sign/{pubkey}"]["post"]["requestBody"]["content"]["application/json"];
export type Eth2SignRequest = paths["/v1/org/{org_id}/eth2/sign/{pubkey}"]["post"]["requestBody"]["content"]["application/json"];
export type Eth2StakeRequest = paths["/v1/org/{org_id}/eth2/stake"]["post"]["requestBody"]["content"]["application/json"];
export type Eth2UnstakeRequest = paths["/v1/org/{org_id}/eth2/unstake/{pubkey}"]["post"]["requestBody"]["content"]["application/json"];
export type BlobSignRequest = paths["/v1/org/{org_id}/blob/sign/{key_id}"]["post"]["requestBody"]["content"]["application/json"];
export type BtcSignRequest = paths["/v0/org/{org_id}/btc/sign/{pubkey}"]["post"]["requestBody"]["content"]["application/json"];
export type SolanaSignRequest = paths["/v1/org/{org_id}/solana/sign/{pubkey}"]["post"]["requestBody"]["content"]["application/json"];
export type Eth1SignResponse = components["responses"]["Eth1SignResponse"]["content"]["application/json"];
export type Eth2SignResponse = components["responses"]["Eth2SignResponse"]["content"]["application/json"];
export type Eth2StakeResponse = components["responses"]["StakeResponse"]["content"]["application/json"];
export type Eth2UnstakeResponse = components["responses"]["UnstakeResponse"]["content"]["application/json"];
export type BlobSignResponse = components["responses"]["BlobSignResponse"]["content"]["application/json"];
export type BtcSignResponse = components["responses"]["BtcSignResponse"]["content"]["application/json"];
export type SolanaSignResponse = components["responses"]["SolanaSignResponse"]["content"]["application/json"];
export type MfaRequestInfo = components["responses"]["MfaRequestInfo"]["content"]["application/json"];
export type AcceptedResponse = components["schemas"]["AcceptedResponse"];
export type ErrorResponse = components["schemas"]["ErrorResponse"];
export type BtcSignatureKind = components["schemas"]["BtcSignatureKind"];
type SignFn<U> = (headers?: HeadersInit) => Promise<U | AcceptedResponse>;
export interface SignerSessionLifetime {
    /** Session lifetime (in seconds). Defaults to one week (604800). */
    session?: number;
    /** Auth token lifetime (in seconds). Defaults to five minutes (300). */
    auth: number;
    /** Refresh token lifetime (in seconds). Defaults to one day (86400). */
    refresh?: number;
}
/**
 * A response of a signing request.
 */
export declare class SignResponse<U> {
    #private;
    /** @return {boolean} True if this signing request requires an MFA approval */
    requiresMfa(): boolean;
    /** @return {U} The signed data */
    data(): U;
    /**
     * Approves the MFA request.
     *
     * Note: This only works for MFA requests that require a single approval.
     *
     * @return {SignResponse<U>} The result of signing with the approval
     */
    approve(): Promise<SignResponse<U>>;
    /**
     * Constructor.
     *
     * @param {CubeSigner} cs The CubeSigner instance to use for requests
     * @param {string} orgId The org id of the corresponding signing request
     * @param {string} roleId The role id of the corresponding signing request
     * @param {SignFn} signFn The signing function that this response is from.
     *                        This argument is used to resend requests with
     *                        different headers if needed.
     * @param {U | AcceptedResponse} resp The response as returned by the OpenAPI
     *                                    client.
     */
    constructor(cs: CubeSigner, orgId: string, roleId: string, signFn: SignFn<U>, resp: U | AcceptedResponse);
}
/** Signer session info. Can only be used to revoke a token, but not for authentication. */
export declare class SignerSessionInfo {
    #private;
    readonly purpose: string;
    /** Revoke this token */
    revoke(): Promise<void>;
    /**
     * Internal constructor.
     * @param {CubeSigner} cs CubeSigner instance to use when calling `revoke`
     * @param {string} orgId Organization ID
     * @param {string} roleId Role ID
     * @param {string} hash The hash of the token; can be used for revocation but not for auth
     * @param {string} purpose Session purpose
     * @internal
     */
    constructor(cs: CubeSigner, orgId: string, roleId: string, hash: string, purpose: string);
}
/** Signer session. */
export declare class SignerSession extends SessionManager<SignerSessionObject> {
    #private;
    readonly cs: CubeSigner;
    readonly roleId: string;
    /**
     * Returns a client with the current session and refreshes the current
     * session. May **UPDATE/MUTATE** self.
     */
    client(): Promise<Client>;
    /** Revokes the session. */
    revoke(): Promise<void>;
    /**
     * Returns whether it's time to refresh this token.
     * @return {boolean} Whether it's time to refresh this token.
     * @internal
     */
    isStale(): Promise<boolean>;
    /**
     * Refreshes the session and **UPDATES/MUTATES** self.
     */
    refresh(): Promise<void>;
    /**
     * @return {Promise<string>} The session id
     */
    sessionId(): Promise<string>;
    /**
     * Returns the list of keys that this token grants access to.
     * @return {KeyInfo[]} The list of keys.
     */
    keys(): Promise<KeyInfo[]>;
    /**
     * Submit an 'eth1' sign request.
     * @param {Key | string} key The key to sign with (either {@link Key} or its material ID).
     * @param {Eth1SignRequest} req What to sign.
     * @return {Promise<Eth1SignResponse | AcceptedResponse>} Signature
     */
    signEth1(key: Key | string, req: Eth1SignRequest): Promise<SignResponse<Eth1SignResponse>>;
    /**
     * Submit an 'eth2' sign request.
     * @param {Key | string} key The key to sign with (either {@link Key} or its material ID).
     * @param {Eth2SignRequest} req What to sign.
     * @return {Promise<Eth2SignResponse | AcceptedResponse>} Signature
     */
    signEth2(key: Key | string, req: Eth2SignRequest): Promise<SignResponse<Eth2SignResponse>>;
    /**
     * Sign a stake request.
     * @param {Eth2StakeRequest} req The request to sign.
     * @return {Promise<Eth2StakeResponse | AcceptedResponse>} The response.
     */
    stake(req: Eth2StakeRequest): Promise<SignResponse<Eth2StakeResponse>>;
    /**
     * Sign an unstake request.
     * @param {Key | string} key The key to sign with (either {@link Key} or its material ID).
     * @param {Eth2UnstakeRequest} req The request to sign.
     * @return {Promise<Eth2UnstakeResponse | AcceptedResponse>} The response.
     */
    unstake(key: Key | string, req: Eth2UnstakeRequest): Promise<SignResponse<Eth2UnstakeResponse>>;
    /**
     * Sign a raw blob.
     * @param {Key | string} key The key to sign with (either {@link Key} or its ID).
     * @param {BlobSignRequest} req What to sign
     * @return {Promise<BlobSignResponse | AcceptedResponse>} The response.
     */
    signBlob(key: Key | string, req: BlobSignRequest): Promise<SignResponse<BlobSignResponse>>;
    /**
     * Sign a bitcoin message.
     * @param {Key | string} key The key to sign with (either {@link Key} or its material ID).
     * @param {BtcSignRequest} req What to sign
     * @return {Promise<BtcSignResponse | AcceptedResponse>} The response.
     */
    signBtc(key: Key | string, req: BtcSignRequest): Promise<SignResponse<BtcSignResponse>>;
    /**
     * Sign a solana message.
     * @param {Key | string} key The key to sign with (either {@link Key} or its material ID).
     * @param {SolanaSignRequest} req What to sign
     * @return {Promise<SolanaSignResponse | AcceptedResponse>} The response.
     */
    signSolana(key: Key | string, req: SolanaSignRequest): Promise<SignResponse<SolanaSignResponse>>;
    /**
     * Create a new signer session.
     * @param {CubeSigner} cs CubeSigner
     * @param {SessionStorage<SignerSessionObject>} storage The session storage to use
     * @param {string} orgId Org ID
     * @param {string} roleId Role ID
     * @param {string} purpose The purpose of the session
     * @param {SignerSessionLifetime} ttl Lifetime settings
     * @return {Promise<SingerSession>} New signer session
     */
    static create(cs: CubeSigner, storage: SessionStorage<SignerSessionObject>, orgId: string, roleId: string, purpose: string, ttl?: SignerSessionLifetime): Promise<SignerSession>;
    /**
     * Loads an existing signer session from a session storage
     * @param {CubeSigner} cs CubeSigner
     * @param {SessionStorage<SignerSessionInfo>} storage The session storage holding the credentials
     * @return {Promise<SingerSession>} New signer session
     */
    static loadFromStorage(cs: CubeSigner, storage: SessionStorage<SignerSessionObject>): Promise<SignerSession>;
    /**
     * Constructor.
     * @param {CubeSigner} cs CubeSigner
     * @param {SessionStorage<SignerSessionObject>} storage The session storage to use
     * @param {string} orgId Organization ID
     * @param {string} roleId The id of the role that this session assumes
     * @param {string} token The authorization token to use
     * @internal
     */
    private constructor();
    /**
     * Static method for revoking a token (used both from {SignerSession} and {SignerSessionInfo}).
     * @param {CubeSigner} cs CubeSigner instance
     * @param {string} orgId Organization ID
     * @param {string} roleId Role ID
     * @param {string} sessionId Signer session ID
     * @internal
     */
    static revoke(cs: CubeSigner, orgId: string, roleId: string, sessionId: string): Promise<void>;
}
export {};
