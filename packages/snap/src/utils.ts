import { rpcErrors } from "@metamask/rpc-errors";

/**
 * Checks whether a given object is set; throws 'invalidParams' otherwise.
 * @param {object} obj Object to check
 * @param {string} paramNames Names of the parameter (to include in the error message)
 */
// eslint-disable-next-line
export function assertParams<T>(obj: T, ...paramNames: (keyof T)[]) {
  paramNames.forEach((paramName) => {
    if (!Reflect.has(obj as object, paramName)) {
      throw rpcErrors.invalidParams({
        message: `Invalid RPC Params: Parameter ${String(paramName)} is not defined`,
      });
    }
  });
}
