import { SessionStorage } from "..";
import { EnvInterface } from "../env";
import { components, Client } from "../client";
export type ClientSessionInfo = components["schemas"]["ClientSessionInfo"];
/** Generic session interface. */
export declare abstract class SessionManager<U> {
    readonly storage: SessionStorage<U>;
    /** Returns a client instance that uses the token. */
    abstract client(): Promise<Client>;
    /** Revokes the session. */
    abstract revoke(): Promise<void>;
    /** Refreshes the session. */
    abstract refresh(): Promise<void>;
    /**
     * Returns whether it's time to refresh this token.
     * @return {boolean} Whether it's time to refresh this token.
     * @internal
     */
    abstract isStale(): Promise<boolean>;
    /**
     * Refreshes the session if it is about to expire.
     * @return {boolean} Whether the session token was refreshed.
     * @internal
     */
    refreshIfNeeded(): Promise<boolean>;
    /**
     * Constructor.
     * @param {SessionStorage<U>} storage The storage back end to use for storing
     *                                    session information
     */
    constructor(storage: SessionStorage<U>);
}
/** JSON representation of our "management session" file format */
export interface ManagementSessionObject {
    /** The email address of the user */
    email: string;
    /** The ID token */
    id_token: string;
    /** The access token */
    access_token: string;
    /** The refresh token */
    refresh_token: string;
    /** The expiration time of the access token */
    expiration: string;
}
/** JSON representation of our "signer session" file format */
export interface SignerSessionObject {
    /** The organization ID */
    org_id: string;
    /** The role ID */
    role_id: string;
    /** The purpose of the session token */
    purpose: string;
    /** The token to include in Authorization header */
    token: string;
    /** Session info */
    session_info: ClientSessionInfo;
}
export interface HasEnv {
    /** The environment */
    env: {
        ["Dev-CubeSignerStack"]: EnvInterface;
    };
}
export interface ManagementSessionFile extends ManagementSessionObject, HasEnv {
}
export interface SignerSessionFile extends SignerSessionObject, HasEnv {
}
