import { CubeSigner, Key, MfaRequestInfo, SessionStorage, SignerSession, SignerSessionInfo, SignerSessionLifetime, SignerSessionObject } from ".";
import { components } from "./client";
export type RoleInfo = components["schemas"]["RoleInfo"];
/** Restrict transaction receiver.
 * @example { TxReceiver: "0x8c594691c0e592ffa21f153a16ae41db5befcaaa" }
 * */
export type TxReceiver = {
    TxReceiver: string;
};
/** The kind of deposit contracts. */
export declare enum DepositContract {
    /** Canonical deposit contract */
    Canonical = 0,
    /** Wrapper deposit contract */
    Wrapper = 1
}
/** Restrict transactions to calls to deposit contract. */
export type TxDeposit = TxDepositBase | TxDepositPubkey | TxDepositRole;
/** Restrict transactions to calls to deposit contract*/
export type TxDepositBase = {
    TxDeposit: {
        kind: DepositContract;
    };
};
/** Restrict transactions to calls to deposit contract with fixed validator (pubkey):
 *  @example { TxDeposit: { kind: DespositContract.Canonical, validator: { pubkey: "8879...8"} }}
 * */
export type TxDepositPubkey = {
    TxDeposit: {
        kind: DepositContract;
        pubkey: string;
    };
};
/** Restrict transactions to calls to deposit contract with any validator key in a role:
 * @example { TxDeposit: { kind: DespositContract.Canonical, validator: { role_id: "Role#c63...af"} }}
 * */
export type TxDepositRole = {
    TxDeposit: {
        kind: DepositContract;
        role_id: string;
    };
};
/** All different kinds of sensitive operations. */
export declare enum OperationKind {
    BlobSign = "BlobSign",
    Eth1Sign = "Eth1Sign",
    Eth2Sign = "Eth2Sign",
    Eth2Stake = "Eth2Stake",
    Eth2Unstake = "Eth2Unstake",
    SolanaSign = "SolanaSign"
}
/** Require MFA for transactions.
 * @example {
 *     RequireMfa: {
 *       kind: {
 *         RequiredApprovers: {
 *           count: 1
 *         }
 *       },
 *       restricted_operations: [
 *         "Eth1Sign",
 *         "BlobSign"
 *       ]
 *     }
 *   }
 * */
export type RequireMfa = {
    RequireMfa: {
        kind: {
            RequiredApprovers: {
                count?: number;
            };
        };
        restricted_operations?: OperationKind[];
    };
};
/** Allow raw blob signing */
export type AllowRawBlobSigning = "AllowRawBlobSigning";
/** Key policy
 * @example [
 *   {
 *     "TxReceiver": "0x8c594691c0e592ffa21f153a16ae41db5befcaaa"
 *   },
 *   {
 *     "TxDeposit": {
 *       "kind": "Canonical"
 *     }
 *   },
 *   {
 *     "RequireMfa": {
 *       "kind": {
 *         "RequiredApprovers": {
 *           "count": 1
 *         }
 *       },
 *       "restricted_operations": [
 *         "Eth1Sign",
 *         "BlobSign"
 *       ]
 *     }
 *   }
 * ]
 * */
export type KeyPolicy = (TxReceiver | TxDeposit | RequireMfa | AllowRawBlobSigning)[];
/** A key guarded by a policy. */
export interface GuardedKey {
    id: string;
    policy?: KeyPolicy;
}
/** Roles. */
export declare class Role {
    #private;
    /** Human-readable name for the role */
    readonly name?: string;
    /**
     * The ID of the role.
     * @example Role#bfe3eccb-731e-430d-b1e5-ac1363e6b06b
     * */
    readonly id: string;
    /** Delete the role. */
    delete(): Promise<void>;
    /** Is the role enabled? */
    enabled(): Promise<boolean>;
    /** Enable the role. */
    enable(): Promise<void>;
    /** Disable the role. */
    disable(): Promise<void>;
    /** The list of users with access to the role.
     * @example [
     *   "User#c3b9379c-4e8c-4216-bd0a-65ace53cf98f",
     *   "User#5593c25b-52e2-4fb5-b39b-96d41d681d82"
     * ]
     * */
    users(): Promise<string[]>;
    /** Add a user to the role.
     * Adds an existing user to an existing role.
     * @param {string} userId The user-id of the user to add to the role.
     * */
    addUser(userId: string): Promise<void>;
    /** The list of keys in the role.
     * @example [
     *    {
     *     id: "Key#bfe3eccb-731e-430d-b1e5-ac1363e6b06b",
     *     policy: { TxReceiver: "0x8c594691c0e592ffa21f153a16ae41db5befcaaa" }
     *    },
     *  ]
     * */
    keys(): Promise<GuardedKey[]>;
    /** Add keys to the role.
     * Adds a list of existing keys to an existing role.
     * @param {Key[]} keys The list of keys to add to the role.
     * @param {KeyPolicy?} policy The optional policy to apply to each key.
     * */
    addKeys(keys: Key[], policy?: KeyPolicy): Promise<void>;
    /** Add a key to the role.
     * Adds an existing key to an existing role.
     * @param {Key} key The key to add to the role.
     * @param {KeyPolicy?} policy The optional policy to apply to the key.
     * */
    addKey(key: Key, policy?: KeyPolicy): Promise<void>;
    /** Remove key from the role.
     * Removes an existing key from an existing role.
     * @param {Key} key The key to remove from the role.
     * */
    removeKey(key: Key): Promise<void>;
    /**
     * Create a new session for this role.
     * @param {SessionStorage<SignerSessionObject>} storage The session storage to use
     * @param {string} purpose Descriptive purpose.
     * @param {SignerSessionLifetime} ttl Optional session lifetimes.
     * @return {Promise<SignerSession>} New signer session.
     */
    createSession(storage: SessionStorage<SignerSessionObject>, purpose: string, ttl?: SignerSessionLifetime): Promise<SignerSession>;
    /**
     * List all signer sessions for this role. Returned objects can be used to
     * revoke individual sessions, but they cannot be used for authentication.
     * @return {Promise<SignerSessionInfo[]>} Signer sessions for this role.
     */
    sessions(): Promise<SignerSessionInfo[]>;
    /**
     * Get a pending MFA request by its id.
     * @param {string} mfaId The id of the MFA request.
     * @return {Promise<MfaRequestInfo>} The MFA request.
     */
    mfaGet(mfaId: string): Promise<MfaRequestInfo>;
    /**
     * Approve a pending MFA request.
     *
     * @param {string} mfaId The id of the MFA request.
     * @return {Promise<MfaRequestInfo>} The MFA request.
     */
    mfaApprove(mfaId: string): Promise<MfaRequestInfo>;
    /** Create a new role.
     * @param {CubeSigner} cs The CubeSigner instance to use for signing.
     * @param {string} orgId The id of the organization to which the role belongs.
     * @param {RoleInfo} data The JSON response from the API server.
     * @internal
     * */
    constructor(cs: CubeSigner, orgId: string, data: RoleInfo);
    /**
     * Approve a pending MFA request.
     *
     * @param {CubeSigner} cs The CubeSigner instance to use for requests
     * @param {string} orgId The org id of the MFA request
     * @param {string} roleId The role id of the MFA request
     * @param {string} mfaId The id of the MFA request
     * @return {Promise<MfaRequestInfo>} The result of the MFA request
     */
    static mfaApprove(cs: CubeSigner, orgId: string, roleId: string, mfaId: string): Promise<MfaRequestInfo>;
    /** Update the role.
     * @param {UpdateRoleRequest} request The JSON request to send to the API server.
     * */
    private update;
    /** Create new role.
     * @param {CubeSigner} cs The CubeSigner instance to use for signing.
     * @param {string} orgId The id of the organization to which the role belongs.
     * @param {string?} name The optional name of the role.
     * @return {Role} The new role.
     * @internal
     * */
    static createRole(cs: CubeSigner, orgId: string, name?: string): Promise<Role>;
    /** Get a role by id.
     * @param {CubeSigner} cs The CubeSigner instance to use for signing.
     * @param {string} orgId The id of the organization to which the role belongs.
     * @param {string} roleId The id of the role to get.
     * @return {Role} The role.
     * @internal
     * */
    static getRole(cs: CubeSigner, orgId: string, roleId: string): Promise<Role>;
    /** Fetches the role information.
     * @return {RoleInfo} The role information.
     * @internal
     * */
    private fetch;
    /** Delete role.
     * @param {CubeSigner} cs The CubeSigner instance to use for signing.
     * @param {string} orgId The id of the organization to which the role belongs.
     * @param {string} roleId The id of the role to delete.
     * @internal
     * */
    private static deleteRole;
}
