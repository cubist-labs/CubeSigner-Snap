import { CubeSigner } from ".";
import { components } from "./client";
/** Secp256k1 key type */
export declare enum Secp256k1 {
    Evm = "SecpEthAddr",
    Btc = "SecpBtc",
    BtcTest = "SecpBtcTest"
}
/** BLS key type */
export declare enum BLS {
    Eth2Deposited = "BlsPub",
    Eth2Inactive = "BlsInactive"
}
/** Ed25519 key type */
export declare enum Ed25519 {
    Solana = "Ed25519SolanaAddr",
    Sui = "Ed25519SuiAddr",
    Aptos = "Ed25519AptosAddr"
}
/** Key type */
export type KeyType = Secp256k1 | BLS | Ed25519;
type KeyInfo = components["schemas"]["KeyInfo"];
/** Signing keys. */
export declare class Key {
    #private;
    /** The organization that this key is in */
    readonly orgId: string;
    /**
     * The id of the key: "Key#" followed by a unique identifier specific to
     * the type of key (such as a public key for BLS or an ethereum address for Secp)
     * @example Key#0x8e3484687e66cdd26cf04c3647633ab4f3570148
     * */
    readonly id: string;
    /** The type of key. */
    readonly type: KeyType;
    /**
     * A unique identifier specific to the type of key, such as a public key or an ethereum address
     * @example 0x8e3484687e66cdd26cf04c3647633ab4f3570148
     * */
    readonly materialId: string;
    /**
     * @description Hex-encoded, serialized public key. The format used depends on the key type:
     * - secp256k1 keys use 65-byte uncompressed SECG format
     * - BLS keys use 48-byte compressed BLS12-381 (ZCash) format
     * @example 0x04d2688b6bc2ce7f9879b9e745f3c4dc177908c5cef0c1b64cff19ae7ff27dee623c64fe9d9c325c7fbbc748bbd5f607ce14dd83e28ebbbb7d3e7f2ffb70a79431
     * */
    readonly publicKey: string;
    /** Is the key enabled? */
    enabled(): Promise<boolean>;
    /** Enable the key. */
    enable(): Promise<void>;
    /** Disable the key. */
    disable(): Promise<void>;
    /**
     * @description Owner of the key
     * @example User#c3b9379c-4e8c-4216-bd0a-65ace53cf98f
     * */
    owner(): Promise<string>;
    /** Set the owner of the key. Only the key (or org) owner can change the owner of the key.
     * @param {string} owner The user-id of the new owner of the key.
     * */
    setOwner(owner: string): Promise<void>;
    /** Create a new key.
     * @param {CubeSigner} cs The CubeSigner instance to use for signing.
     * @param {string} orgId The id of the organization to which the key belongs.
     * @param {KeyInfo} data The JSON response from the API server.
     * @internal
     * */
    constructor(cs: CubeSigner, orgId: string, data: KeyInfo);
    /** Update the key.
     * @param {UpdateKeyRequest} request The JSON request to send to the API server.
     * @return {KeyInfo} The JSON response from the API server.
     * */
    private update;
    /** Create new signing keys.
     * @param {CubeSigner} cs The CubeSigner instance to use for signing.
     * @param {string} orgId The id of the organization to which the key belongs.
     * @param {KeyType} keyType The type of key to create.
     * @param {number?} count The number of keys to create. Defaults to 1.
     * @return {Key[]} The new keys.
     * @internal
     * */
    static createKeys(cs: CubeSigner, orgId: string, keyType: KeyType, count?: number): Promise<Key[]>;
    /** Get a key by id.
     * @param {CubeSigner} cs The CubeSigner instance to use for signing.
     * @param {string} orgId The id of the organization to which the key belongs.
     * @param {string} keyId The id of the key to get.
     * @return {Key} The key.
     * @internal
     * */
    static getKey(cs: CubeSigner, orgId: string, keyId: string): Promise<Key>;
    /** Fetches the key information.
     * @return {KeyInfo} The key information.
     * @internal
     * */
    private fetch;
    /** List keys.
     * @param {CubeSigner} cs The CubeSigner instance to use for signing.
     * @param {string} orgId The id of the organization to which the key belongs.
     * @param {KeyType?} keyType Optional key type to filter list for.
     * @return {Key} The key.
     * @internal
     * */
    static listKeys(cs: CubeSigner, orgId: string, keyType?: KeyType): Promise<Key[]>;
}
export {};