import { EnvInterface } from "./env";
import { components, Client } from "./client";
import { Org } from "./org";
import { SessionStorage } from "./session/session_storage";
import { SignerSessionObject } from "./session/session_manager";
import { SignerSession } from "./signer_session";
/** CubeSigner constructor options */
export interface CubeSignerOptions {
    /** The management authorization token */
    managementToken?: string;
    /** The environment to use */
    env?: EnvInterface;
}
type UserInfo = components["schemas"]["UserInfo"];
/** CubeSigner client */
export declare class CubeSigner {
    #private;
    /** @return {EnvInterface} The CubeSigner environment of this client */
    get env(): EnvInterface;
    /**
     * Create a new CubeSigner instance.
     * @param {CubeSignerOptions} options The options for the CubeSigner instance.
     */
    constructor(options: CubeSignerOptions);
    /**
     * Loads a signer session from a session storage (e.g., session file).
     * @param {SessionStorage<SignerSessionObject>} storage The signer session storage
     * @return {Promise<SignerSession>} New signer session
     */
    loadSignerSessionFromStorage(storage: SessionStorage<SignerSessionObject>): Promise<SignerSession>;
    /** Retrieves information about the current user. */
    aboutMe(): Promise<UserInfo>;
    /** Retrieves information about an organization.
     * @param {string} org The ID or name of the organization.
     * @return {Org} The organization.
     * */
    getOrg(org: string): Promise<Org>;
    /** Get the management client.
     * @return {Client} The client.
     * @internal
     * */
    management(): Client;
}
/** Organizations */
export * from "./org";
/** Keys */
export * from "./key";
/** Roles */
export * from "./role";
/** Env */
export * from "./env";
/** Sessions */
export * from "./signer_session";
/** Session storage */
export * from "./session/session_storage";
/** Session manager */
export * from "./session/session_manager";
