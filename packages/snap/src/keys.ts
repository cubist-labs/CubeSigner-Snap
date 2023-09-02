import { getCurrentSignerSession } from "./session";
import { KeyInfo } from "@cubist-labs/cubesigner-sdk";

/**
 * Get all session key details.
 * @return {KeyInfo[]} the list of keys that this session has access to.
 */
export async function getKeys(): Promise<KeyInfo[]> {
  const session = await getCurrentSignerSession();
  return await session.keys();
}
