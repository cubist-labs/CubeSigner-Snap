import { KeyInfo } from "@cubist-labs/cubesigner-sdk";
/**
 * Get all session key details.
 * @return {KeyInfo[]} the list of keys that this session has access to.
 */
export declare function getKeys(): Promise<KeyInfo[]>;
