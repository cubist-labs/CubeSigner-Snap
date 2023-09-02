import { Json, JsonRpcRequest } from "@metamask/types";
/** RPC request, as defined by Snap */
export type RpcRequest = {
    origin: string;
    request: JsonRpcRequest<Json[] | Record<string, Json>>;
};
/** Shape of objects. */
export interface Shape {
    [key: string]: "string" | "number" | Shape;
}
/**
 * Sanitize an object against a shape.
 *
 * @param {any} untrustedObj The value (which should be an object) to validate against the shape.
 * @param {Shape} shape The object shape corresponding to type `T`.
 * @return {T} The validated object.
 */
export declare function sanitize<T>(untrustedObj: any, shape: Shape): T;
/** Shape errors. */
export declare class ShapeError extends Error {
    /** Constructor.
     * @param {string} message Error message.
     */
    constructor(message: string);
}
