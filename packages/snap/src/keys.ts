import { getCurrentSignerSession } from "./session";
import { Key } from "@cubist-labs/cubesigner-sdk";

/**
 * Get all session key details.
 * @return {Key[]} the list of keys that this session has access to.
 */
export async function getKeys(): Promise<Key[]> {
  const session = await getCurrentSignerSession();
  return await session.keys();
}
