export type Environment = 
/** Production environment */
"prod"
/** Gamma, staging environment */
 | "gamma"
/** Beta, development environment */
 | "beta";
export interface EnvInterface {
    ClientId: string;
    LongLivedClientId: string;
    Region: string;
    UserPoolId: string;
    SignerApiRoot: string;
}
export declare const env: Record<Environment, EnvInterface>;
type ResponseType<D, T> = {
    data?: D;
    error?: T;
    response?: Response;
};
/**
 * Error response type, thrown on non-successful responses.
 */
export declare class ErrResponse extends Error {
    /** Description */
    readonly description?: string;
    /** HTTP status code text (derived from `this.status`) */
    readonly statusText?: string;
    /** HTTP status code */
    readonly status?: number;
    /**
     * Constructor
     * @param {Partial<ErrResponse>} init Initializer
     */
    constructor(init: Partial<ErrResponse>);
}
/**
 * Throw if on error response. Otherwise, return the response data.
 * @param {ResponseType} resp The response to check
 * @param {string} description Description to include in the thrown error
 * @return {D} The response data.
 * @internal
 */
export declare function assertOk<D, T>(resp: ResponseType<D, T>, description?: string): D;
export {};
