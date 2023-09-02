/**
 * Checks whether a given object is set; throws 'invalidParams' otherwise.
 * @param {object} obj Object to check
 * @param {string} paramNames Names of the parameter (to include in the error message)
 */
export declare function assertParams<T>(obj: T, ...paramNames: (keyof T)[]): void;
