"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _SignResponse_cs, _SignResponse_orgId, _SignResponse_roleId, _SignResponse_signFn, _SignResponse_resp, _SignerSessionInfo_cs, _SignerSessionInfo_orgId, _SignerSessionInfo_roleId, _SignerSessionInfo_sessionId, _SignerSession_instances, _SignerSession_orgId, _SignerSession_client, _SignerSession_makeClient;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignerSession = exports.SignerSessionInfo = exports.SignResponse = void 0;
const assert_1 = __importDefault(require("assert"));
const _1 = require(".");
const session_manager_1 = require("./session/session_manager");
const env_1 = require("./env");
const openapi_fetch_1 = __importDefault(require("openapi-fetch"));
const EXPIRATION_BUFFER_SECS = 30;
const defaultSignerSessionLifetime = {
    session: 604800,
    auth: 300,
    refresh: 86400,
};
/**
 * A response of a signing request.
 */
class SignResponse {
    /** @return {boolean} True if this signing request requires an MFA approval */
    requiresMfa() {
        return __classPrivateFieldGet(this, _SignResponse_resp, "f").accepted?.MfaRequired !== undefined;
    }
    /** @return {U} The signed data */
    data() {
        return __classPrivateFieldGet(this, _SignResponse_resp, "f");
    }
    /**
     * Approves the MFA request.
     *
     * Note: This only works for MFA requests that require a single approval.
     *
     * @return {SignResponse<U>} The result of signing with the approval
     */
    async approve() {
        const mfaRequired = __classPrivateFieldGet(this, _SignResponse_resp, "f").accepted?.MfaRequired;
        if (!mfaRequired) {
            throw new Error("Request does not require MFA approval");
        }
        const mfaId = mfaRequired.id;
        const mfaApproval = await _1.Role.mfaApprove(__classPrivateFieldGet(this, _SignResponse_cs, "f"), __classPrivateFieldGet(this, _SignResponse_orgId, "f"), __classPrivateFieldGet(this, _SignResponse_roleId, "f"), mfaId);
        (0, assert_1.default)(mfaApproval.id === mfaId);
        const mfaConf = mfaApproval.receipt?.confirmation;
        if (!mfaConf) {
            throw new Error("MfaRequest has not been approved yet");
        }
        const headers = {
            "x-cubist-mfa-id": mfaId,
            "x-cubist-mfa-confirmation": mfaConf,
        };
        return new SignResponse(__classPrivateFieldGet(this, _SignResponse_cs, "f"), __classPrivateFieldGet(this, _SignResponse_orgId, "f"), __classPrivateFieldGet(this, _SignResponse_roleId, "f"), __classPrivateFieldGet(this, _SignResponse_signFn, "f"), await __classPrivateFieldGet(this, _SignResponse_signFn, "f").call(this, headers));
    }
    // --------------------------------------------------------------------------
    // -- INTERNAL --------------------------------------------------------------
    // --------------------------------------------------------------------------
    /**
     * Constructor.
     *
     * @param {CubeSigner} cs The CubeSigner instance to use for requests
     * @param {string} orgId The org id of the corresponding signing request
     * @param {string} roleId The role id of the corresponding signing request
     * @param {SignFn} signFn The signing function that this response is from.
     *                        This argument is used to resend requests with
     *                        different headers if needed.
     * @param {U | AcceptedResponse} resp The response as returned by the OpenAPI
     *                                    client.
     */
    constructor(cs, orgId, roleId, signFn, resp) {
        _SignResponse_cs.set(this, void 0);
        _SignResponse_orgId.set(this, void 0);
        _SignResponse_roleId.set(this, void 0);
        _SignResponse_signFn.set(this, void 0);
        _SignResponse_resp.set(this, void 0);
        __classPrivateFieldSet(this, _SignResponse_cs, cs, "f");
        __classPrivateFieldSet(this, _SignResponse_orgId, orgId, "f");
        __classPrivateFieldSet(this, _SignResponse_roleId, roleId, "f");
        __classPrivateFieldSet(this, _SignResponse_signFn, signFn, "f");
        __classPrivateFieldSet(this, _SignResponse_resp, resp, "f");
    }
}
exports.SignResponse = SignResponse;
_SignResponse_cs = new WeakMap(), _SignResponse_orgId = new WeakMap(), _SignResponse_roleId = new WeakMap(), _SignResponse_signFn = new WeakMap(), _SignResponse_resp = new WeakMap();
/** Signer session info. Can only be used to revoke a token, but not for authentication. */
class SignerSessionInfo {
    /** Revoke this token */
    async revoke() {
        await SignerSession.revoke(__classPrivateFieldGet(this, _SignerSessionInfo_cs, "f"), __classPrivateFieldGet(this, _SignerSessionInfo_orgId, "f"), __classPrivateFieldGet(this, _SignerSessionInfo_roleId, "f"), __classPrivateFieldGet(this, _SignerSessionInfo_sessionId, "f"));
    }
    // --------------------------------------------------------------------------
    // -- INTERNAL --------------------------------------------------------------
    // --------------------------------------------------------------------------
    /**
     * Internal constructor.
     * @param {CubeSigner} cs CubeSigner instance to use when calling `revoke`
     * @param {string} orgId Organization ID
     * @param {string} roleId Role ID
     * @param {string} hash The hash of the token; can be used for revocation but not for auth
     * @param {string} purpose Session purpose
     * @internal
     */
    constructor(cs, orgId, roleId, hash, purpose) {
        _SignerSessionInfo_cs.set(this, void 0);
        _SignerSessionInfo_orgId.set(this, void 0);
        _SignerSessionInfo_roleId.set(this, void 0);
        _SignerSessionInfo_sessionId.set(this, void 0);
        __classPrivateFieldSet(this, _SignerSessionInfo_cs, cs, "f");
        __classPrivateFieldSet(this, _SignerSessionInfo_orgId, orgId, "f");
        __classPrivateFieldSet(this, _SignerSessionInfo_roleId, roleId, "f");
        __classPrivateFieldSet(this, _SignerSessionInfo_sessionId, hash, "f");
        this.purpose = purpose;
    }
}
exports.SignerSessionInfo = SignerSessionInfo;
_SignerSessionInfo_cs = new WeakMap(), _SignerSessionInfo_orgId = new WeakMap(), _SignerSessionInfo_roleId = new WeakMap(), _SignerSessionInfo_sessionId = new WeakMap();
/** Signer session. */
class SignerSession extends session_manager_1.SessionManager {
    /**
     * Returns a client with the current session and refreshes the current
     * session. May **UPDATE/MUTATE** self.
     */
    async client() {
        await this.refreshIfNeeded();
        return __classPrivateFieldGet(this, _SignerSession_client, "f");
    }
    /** Revokes the session. */
    async revoke() {
        const session = await this.storage.retrieve();
        const resp = await this.cs
            .management()
            .del("/v0/org/{org_id}/roles/{role_id}/tokens/{session_id}", {
            params: {
                path: {
                    org_id: session.org_id,
                    role_id: session.role_id,
                    session_id: session.session_info.session_id,
                },
            },
            parseAs: "json",
        });
        (0, env_1.assertOk)(resp);
    }
    /**
     * Returns whether it's time to refresh this token.
     * @return {boolean} Whether it's time to refresh this token.
     * @internal
     */
    async isStale() {
        const session = await this.storage.retrieve();
        const csi = session.session_info;
        const now_epoch_seconds = new Date().getTime() / 1000;
        return csi.auth_token_exp < now_epoch_seconds + EXPIRATION_BUFFER_SECS;
    }
    /**
     * Refreshes the session and **UPDATES/MUTATES** self.
     */
    async refresh() {
        const session = await this.storage.retrieve();
        const csi = session.session_info;
        const resp = await __classPrivateFieldGet(this, _SignerSession_client, "f").patch("/v1/org/{org_id}/token/refresh", {
            params: { path: { org_id: session.org_id } },
            body: {
                epoch_num: csi.epoch,
                epoch_token: csi.epoch_token,
                other_token: csi.refresh_token,
            },
            parseAs: "json",
        });
        const data = (0, env_1.assertOk)(resp);
        await this.storage.save({
            ...session,
            session_info: data.session_info,
            token: data.token,
        });
        __classPrivateFieldSet(this, _SignerSession_client, __classPrivateFieldGet(this, _SignerSession_instances, "m", _SignerSession_makeClient).call(this, data.token), "f");
    }
    /**
     * @return {Promise<string>} The session id
     */
    async sessionId() {
        const session = await this.storage.retrieve();
        return session.session_info.session_id;
    }
    /**
     * Returns the list of keys that this token grants access to.
     * @return {KeyInfo[]} The list of keys.
     */
    async keys() {
        const resp = await (await this.client()).get("/v0/org/{org_id}/token/keys", {
            params: { path: { org_id: __classPrivateFieldGet(this, _SignerSession_orgId, "f") } },
            parseAs: "json",
        });
        const data = (0, env_1.assertOk)(resp);
        return data.keys;
    }
    /**
     * Submit an 'eth1' sign request.
     * @param {Key | string} key The key to sign with (either {@link Key} or its material ID).
     * @param {Eth1SignRequest} req What to sign.
     * @return {Promise<Eth1SignResponse | AcceptedResponse>} Signature
     */
    async signEth1(key, req) {
        const pubkey = typeof key === "string" ? key : key.materialId;
        const sign = async (headers) => {
            const resp = await (await this.client()).post("/v1/org/{org_id}/eth1/sign/{pubkey}", {
                params: { path: { org_id: __classPrivateFieldGet(this, _SignerSession_orgId, "f"), pubkey } },
                body: req,
                headers,
                parseAs: "json",
            });
            return (0, env_1.assertOk)(resp);
        };
        return new SignResponse(this.cs, __classPrivateFieldGet(this, _SignerSession_orgId, "f"), this.roleId, sign, await sign());
    }
    /**
     * Submit an 'eth2' sign request.
     * @param {Key | string} key The key to sign with (either {@link Key} or its material ID).
     * @param {Eth2SignRequest} req What to sign.
     * @return {Promise<Eth2SignResponse | AcceptedResponse>} Signature
     */
    async signEth2(key, req) {
        const pubkey = typeof key === "string" ? key : key.materialId;
        const sign = async (headers) => {
            const resp = await (await this.client()).post("/v1/org/{org_id}/eth2/sign/{pubkey}", {
                params: { path: { org_id: __classPrivateFieldGet(this, _SignerSession_orgId, "f"), pubkey } },
                body: req,
                headers,
                parseAs: "json",
            });
            return (0, env_1.assertOk)(resp);
        };
        return new SignResponse(this.cs, __classPrivateFieldGet(this, _SignerSession_orgId, "f"), this.roleId, sign, await sign());
    }
    /**
     * Sign a stake request.
     * @param {Eth2StakeRequest} req The request to sign.
     * @return {Promise<Eth2StakeResponse | AcceptedResponse>} The response.
     */
    async stake(req) {
        const sign = async (headers) => {
            const resp = await (await this.client()).post("/v1/org/{org_id}/eth2/stake", {
                params: { path: { org_id: __classPrivateFieldGet(this, _SignerSession_orgId, "f") } },
                body: req,
                headers,
                parseAs: "json",
            });
            return (0, env_1.assertOk)(resp);
        };
        return new SignResponse(this.cs, __classPrivateFieldGet(this, _SignerSession_orgId, "f"), this.roleId, sign, await sign());
    }
    /**
     * Sign an unstake request.
     * @param {Key | string} key The key to sign with (either {@link Key} or its material ID).
     * @param {Eth2UnstakeRequest} req The request to sign.
     * @return {Promise<Eth2UnstakeResponse | AcceptedResponse>} The response.
     */
    async unstake(key, req) {
        const pubkey = typeof key === "string" ? key : key.materialId;
        const sign = async (headers) => {
            const resp = await (await this.client()).post("/v1/org/{org_id}/eth2/unstake/{pubkey}", {
                params: { path: { org_id: __classPrivateFieldGet(this, _SignerSession_orgId, "f"), pubkey } },
                body: req,
                headers,
                parseAs: "json",
            });
            return (0, env_1.assertOk)(resp);
        };
        return new SignResponse(this.cs, __classPrivateFieldGet(this, _SignerSession_orgId, "f"), this.roleId, sign, await sign());
    }
    /**
     * Sign a raw blob.
     * @param {Key | string} key The key to sign with (either {@link Key} or its ID).
     * @param {BlobSignRequest} req What to sign
     * @return {Promise<BlobSignResponse | AcceptedResponse>} The response.
     */
    async signBlob(key, req) {
        const key_id = typeof key === "string" ? key : key.id;
        const sign = async (headers) => {
            const resp = await (await this.client()).post("/v1/org/{org_id}/blob/sign/{key_id}", {
                params: {
                    path: { org_id: __classPrivateFieldGet(this, _SignerSession_orgId, "f"), key_id },
                },
                body: req,
                headers,
                parseAs: "json",
            });
            return (0, env_1.assertOk)(resp);
        };
        return new SignResponse(this.cs, __classPrivateFieldGet(this, _SignerSession_orgId, "f"), this.roleId, sign, await sign());
    }
    /**
     * Sign a bitcoin message.
     * @param {Key | string} key The key to sign with (either {@link Key} or its material ID).
     * @param {BtcSignRequest} req What to sign
     * @return {Promise<BtcSignResponse | AcceptedResponse>} The response.
     */
    async signBtc(key, req) {
        const pubkey = typeof key === "string" ? key : key.materialId;
        const sign = async (headers) => {
            const resp = await (await this.client()).post("/v0/org/{org_id}/btc/sign/{pubkey}", {
                params: {
                    path: { org_id: __classPrivateFieldGet(this, _SignerSession_orgId, "f"), pubkey },
                },
                body: req,
                headers: headers,
                parseAs: "json",
            });
            return (0, env_1.assertOk)(resp);
        };
        return new SignResponse(this.cs, __classPrivateFieldGet(this, _SignerSession_orgId, "f"), this.roleId, sign, await sign());
    }
    /**
     * Sign a solana message.
     * @param {Key | string} key The key to sign with (either {@link Key} or its material ID).
     * @param {SolanaSignRequest} req What to sign
     * @return {Promise<SolanaSignResponse | AcceptedResponse>} The response.
     */
    async signSolana(key, req) {
        const pubkey = typeof key === "string" ? key : key.materialId;
        const sign = async (headers) => {
            const resp = await (await this.client()).post("/v1/org/{org_id}/solana/sign/{pubkey}", {
                params: { path: { org_id: __classPrivateFieldGet(this, _SignerSession_orgId, "f"), pubkey } },
                body: req,
                headers,
                parseAs: "json",
            });
            return (0, env_1.assertOk)(resp);
        };
        return new SignResponse(this.cs, __classPrivateFieldGet(this, _SignerSession_orgId, "f"), this.roleId, sign, await sign());
    }
    /**
     * Create a new signer session.
     * @param {CubeSigner} cs CubeSigner
     * @param {SessionStorage<SignerSessionObject>} storage The session storage to use
     * @param {string} orgId Org ID
     * @param {string} roleId Role ID
     * @param {string} purpose The purpose of the session
     * @param {SignerSessionLifetime} ttl Lifetime settings
     * @return {Promise<SingerSession>} New signer session
     */
    static async create(cs, storage, orgId, roleId, purpose, ttl) {
        const resp = await cs.management().post("/v0/org/{org_id}/roles/{role_id}/tokens", {
            params: { path: { org_id: orgId, role_id: roleId } },
            body: {
                purpose,
                auth_lifetime: ttl?.auth || defaultSignerSessionLifetime.auth,
                refresh_lifetime: ttl?.refresh || defaultSignerSessionLifetime.refresh,
                session_lifetime: ttl?.session || defaultSignerSessionLifetime.session,
            },
            parseAs: "json",
        });
        const data = (0, env_1.assertOk)(resp);
        const session_info = data.session_info;
        if (!session_info) {
            throw new Error("Signer session info missing");
        }
        await storage.save({
            org_id: orgId,
            role_id: roleId,
            purpose,
            token: data.token,
            session_info,
        });
        return new SignerSession(cs, storage, orgId, roleId, data.token);
    }
    /**
     * Loads an existing signer session from a session storage
     * @param {CubeSigner} cs CubeSigner
     * @param {SessionStorage<SignerSessionInfo>} storage The session storage holding the credentials
     * @return {Promise<SingerSession>} New signer session
     */
    static async loadFromStorage(cs, storage) {
        const session = await storage.retrieve();
        return new SignerSession(cs, storage, session.org_id, session.role_id, session.token);
    }
    // --------------------------------------------------------------------------
    // -- INTERNAL --------------------------------------------------------------
    // --------------------------------------------------------------------------
    /**
     * Constructor.
     * @param {CubeSigner} cs CubeSigner
     * @param {SessionStorage<SignerSessionObject>} storage The session storage to use
     * @param {string} orgId Organization ID
     * @param {string} roleId The id of the role that this session assumes
     * @param {string} token The authorization token to use
     * @internal
     */
    constructor(cs, storage, orgId, roleId, token) {
        super(storage);
        _SignerSession_instances.add(this);
        _SignerSession_orgId.set(this, void 0);
        _SignerSession_client.set(this, void 0);
        this.cs = cs;
        __classPrivateFieldSet(this, _SignerSession_orgId, orgId, "f");
        this.roleId = roleId;
        __classPrivateFieldSet(this, _SignerSession_client, __classPrivateFieldGet(this, _SignerSession_instances, "m", _SignerSession_makeClient).call(this, token), "f");
    }
    /* eslint-disable require-jsdoc */
    /**
     * Static method for revoking a token (used both from {SignerSession} and {SignerSessionInfo}).
     * @param {CubeSigner} cs CubeSigner instance
     * @param {string} orgId Organization ID
     * @param {string} roleId Role ID
     * @param {string} sessionId Signer session ID
     * @internal
     */
    static async revoke(cs, orgId, roleId, sessionId) {
        const resp = await cs.management().del("/v0/org/{org_id}/roles/{role_id}/tokens/{session_id}", {
            params: {
                path: { org_id: orgId, role_id: roleId, session_id: sessionId },
            },
            parseAs: "json",
        });
        (0, env_1.assertOk)(resp);
    }
}
exports.SignerSession = SignerSession;
_SignerSession_orgId = new WeakMap(), _SignerSession_client = new WeakMap(), _SignerSession_instances = new WeakSet(), _SignerSession_makeClient = function _SignerSession_makeClient(token) {
    return (0, openapi_fetch_1.default)({
        baseUrl: this.cs.env.SignerApiRoot,
        headers: {
            Authorization: token,
        },
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lnbmVyX3Nlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2lnbmVyX3Nlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsb0RBQTRCO0FBQzVCLHdCQUEwRDtBQUMxRCwrREFBZ0Y7QUFFaEYsK0JBQWlDO0FBQ2pDLGtFQUF5QztBQUV6QyxNQUFNLHNCQUFzQixHQUFHLEVBQUUsQ0FBQztBQXlEbEMsTUFBTSw0QkFBNEIsR0FBMEI7SUFDMUQsT0FBTyxFQUFFLE1BQU07SUFDZixJQUFJLEVBQUUsR0FBRztJQUNULE9BQU8sRUFBRSxLQUFLO0NBQ2YsQ0FBQztBQUVGOztHQUVHO0FBQ0gsTUFBYSxZQUFZO0lBT3ZCLDhFQUE4RTtJQUM5RSxXQUFXO1FBQ1QsT0FBUSx1QkFBQSxJQUFJLDBCQUEyQixDQUFDLFFBQVEsRUFBRSxXQUFXLEtBQUssU0FBUyxDQUFDO0lBQzlFLENBQUM7SUFFRCxrQ0FBa0M7SUFDbEMsSUFBSTtRQUNGLE9BQU8sdUJBQUEsSUFBSSwwQkFBVyxDQUFDO0lBQ3pCLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxLQUFLLENBQUMsT0FBTztRQUNYLE1BQU0sV0FBVyxHQUFJLHVCQUFBLElBQUksMEJBQTJCLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQztRQUMzRSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQUMsdUNBQXVDLENBQUMsQ0FBQztTQUMxRDtRQUVELE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxFQUFFLENBQUM7UUFDN0IsTUFBTSxXQUFXLEdBQUcsTUFBTSxPQUFJLENBQUMsVUFBVSxDQUFDLHVCQUFBLElBQUksd0JBQUksRUFBRSx1QkFBQSxJQUFJLDJCQUFPLEVBQUUsdUJBQUEsSUFBSSw0QkFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3RGLElBQUEsZ0JBQU0sRUFBQyxXQUFXLENBQUMsRUFBRSxL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dUNBQWU7UUFFeEIsd0NBQWdCO1FBd1VkLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2IsdUJBQUEsSUFBSSx3QkFBVSxLQUFLLE1BQUEsQ0FBQztRQUNwQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQix1QkFBQSxJQUFJLHlCQUFXLHVCQUFBLElBQUksMkRBQVksTUFBaEIsSUFBSSxFQUFhLEtBQUssQ0FBQyxNQUFBLENBQUM7SUFDekMsQ0FBQztJQUVELGtDQUFrQztJQUVsQzs7Ozs7OztPQU9HO0lBQ0gsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBYyxFQUFFLEtBQWEsRUFBRSxNQUFjLEVBQUUsU0FBaUI7UUFDbEYsTUFBTSxJQUFJLEdBQUcsTUFBTSxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDLHNEQUFzRCxFQUFFO1lBQzdGLE1BQU0sRUFBRTtnQkFDTixJQUFJLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRTthQUNoRTtZQUNELE9BQU8sRUFBRSxNQUFNO1NBQ2hCLENBQUMsQ0FBQztRQUNILElBQUEsY0FBUSxFQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2pCLENBQUM7Q0FlRjtBQW5YRCxzQ0FtWEM7c0xBUmEsS0FBYTtJQUN2QixPQUFPLElBQUEsdUJBQVksRUFBUTtRQUN6QixPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsYUFBYTtRQUNsQyxPQUFPLEVBQUU7WUFDUCxhQUFhLEVBQUUsS0FBSztTQUNyQjtLQUNGLENBQUMsQ0FBQztBQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYXNzZXJ0IGZyb20gXCJhc3NlcnRcIjtcbmltcG9ydCB7IEN1YmVTaWduZXIsIEtleSwgUm9sZSwgU2Vzc2lvblN0b3JhZ2UgfSBmcm9tIFwiLlwiO1xuaW1wb3J0IHsgU2Vzc2lvbk1hbmFnZXIsIFNpZ25lclNlc3Npb25PYmplY3QgfSBmcm9tIFwiLi9zZXNzaW9uL3Nlc3Npb25fbWFuYWdlclwiO1xuaW1wb3J0IHsgY29tcG9uZW50cywgcGF0aHMsIENsaWVudCB9IGZyb20gXCIuL2NsaWVudFwiO1xuaW1wb3J0IHsgYXNzZXJ0T2sgfSBmcm9tIFwiLi9lbnZcIjtcbmltcG9ydCBjcmVhdGVDbGllbnQgZnJvbSBcIm9wZW5hcGktZmV0Y2hcIjtcblxuY29uc3QgRVhQSVJBVElPTl9CVUZGRVJfU0VDUyA9IDMwO1xuXG5leHBvcnQgdHlwZSBDcmVhdGVTaWduZXJTZXNzaW9uUmVxdWVzdCA9XG4gIHBhdGhzW1wiL3YwL29yZy97b3JnX2lkfS9yb2xlcy97cm9sZV9pZH0vdG9rZW5zXCJdW1wicG9zdFwiXVtcInJlcXVlc3RCb2R5XCJdW1wiY29udGVudFwiXVtcImFwcGxpY2F0aW9uL2pzb25cIl07XG5leHBvcnQgdHlwZSBSZWZyZXNoU2lnbmVyU2Vzc2lvblJlcXVlc3QgPVxuICBwYXRoc1tcIi92MS9vcmcve29yZ19pZH0vdG9rZW4vcmVmcmVzaFwiXVtcInBhdGNoXCJdW1wicmVxdWVzdEJvZHlcIl1bXCJjb250ZW50XCJdW1wiYXBwbGljYXRpb24vanNvblwiXTtcbmV4cG9ydCB0eXBlIEtleUluZm8gPSBjb21wb25lbnRzW1wic2NoZW1hc1wiXVtcIktleUluZm9cIl07XG5cbi8qIGVzbGludC1kaXNhYmxlICovXG5leHBvcnQgdHlwZSBFdGgxU2lnblJlcXVlc3QgPVxuICBwYXRoc1tcIi92MS9vcmcve29yZ19pZH0vZXRoMS9zaWduL3twdWJrZXl9XCJdW1wicG9zdFwiXVtcInJlcXVlc3RCb2R5XCJdW1wiY29udGVudFwiXVtcImFwcGxpY2F0aW9uL2pzb25cIl07XG5leHBvcnQgdHlwZSBFdGgyU2lnblJlcXVlc3QgPVxuICBwYXRoc1tcIi92MS9vcmcve29yZ19pZH0vZXRoMi9zaWduL3twdWJrZXl9XCJdW1wicG9zdFwiXVtcInJlcXVlc3RCb2R5XCJdW1wiY29udGVudFwiXVtcImFwcGxpY2F0aW9uL2pzb25cIl07XG5leHBvcnQgdHlwZSBFdGgyU3Rha2VSZXF1ZXN0ID1cbiAgcGF0aHNbXCIvdjEvb3JnL3tvcmdfaWR9L2V0aDIvc3Rha2VcIl1bXCJwb3N0XCJdW1wicmVxdWVzdEJvZHlcIl1bXCJjb250ZW50XCJdW1wiYXBwbGljYXRpb24vanNvblwiXTtcbmV4cG9ydCB0eXBlIEV0aDJVbnN0YWtlUmVxdWVzdCA9XG4gIHBhdGhzW1wiL3YxL29yZy97b3JnX2lkfS9ldGgyL3Vuc3Rha2Uve3B1YmtleX1cIl1bXCJwb3N0XCJdW1wicmVxdWVzdEJvZHlcIl1bXCJjb250ZW50XCJdW1wiYXBwbGljYXRpb24vanNvblwiXTtcbmV4cG9ydCB0eXBlIEJsb2JTaWduUmVxdWVzdCA9XG4gIHBhdGhzW1wiL3YxL29yZy97b3JnX2lkfS9ibG9iL3NpZ24ve2tleV9pZH1cIl1bXCJwb3N0XCJdW1wicmVxdWVzdEJvZHlcIl1bXCJjb250ZW50XCJdW1wiYXBwbGljYXRpb24vanNvblwiXTtcbmV4cG9ydCB0eXBlIEJ0Y1NpZ25SZXF1ZXN0ID1cbiAgcGF0aHNbXCIvdjAvb3JnL3tvcmdfaWR9L2J0Yy9zaWduL3twdWJrZXl9XCJdW1wicG9zdFwiXVtcInJlcXVlc3RCb2R5XCJdW1wiY29udGVudFwiXVtcImFwcGxpY2F0aW9uL2pzb25cIl07XG5leHBvcnQgdHlwZSBTb2xhbmFTaWduUmVxdWVzdCA9XG4gIHBhdGhzW1wiL3YxL29yZy97b3JnX2lkfS9zb2xhbmEvc2lnbi97cHVia2V5fVwiXVtcInBvc3RcIl1bXCJyZXF1ZXN0Qm9keVwiXVtcImNvbnRlbnRcIl1bXCJhcHBsaWNhdGlvbi9qc29uXCJdO1xuXG5leHBvcnQgdHlwZSBFdGgxU2lnblJlc3BvbnNlID1cbiAgY29tcG9uZW50c1tcInJlc3BvbnNlc1wiXVtcIkV0aDFTaWduUmVzcG9uc2VcIl1bXCJjb250ZW50XCJdW1wiYXBwbGljYXRpb24vanNvblwiXTtcbmV4cG9ydCB0eXBlIEV0aDJTaWduUmVzcG9uc2UgPVxuICBjb21wb25lbnRzW1wicmVzcG9uc2VzXCJdW1wiRXRoMlNpZ25SZXNwb25zZVwiXVtcImNvbnRlbnRcIl1bXCJhcHBsaWNhdGlvbi9qc29uXCJdO1xuZXhwb3J0IHR5cGUgRXRoMlN0YWtlUmVzcG9uc2UgPVxuICBjb21wb25lbnRzW1wicmVzcG9uc2VzXCJdW1wiU3Rha2VSZXNwb25zZVwiXVtcImNvbnRlbnRcIl1bXCJhcHBsaWNhdGlvbi9qc29uXCJdO1xuZXhwb3J0IHR5cGUgRXRoMlVuc3Rha2VSZXNwb25zZSA9XG4gIGNvbXBvbmVudHNbXCJyZXNwb25zZXNcIl1bXCJVbnN0YWtlUmVzcG9uc2VcIl1bXCJjb250ZW50XCJdW1wiYXBwbGljYXRpb24vanNvblwiXTtcbmV4cG9ydCB0eXBlIEJsb2JTaWduUmVzcG9uc2UgPVxuICBjb21wb25lbnRzW1wicmVzcG9uc2VzXCJdW1wiQmxvYlNpZ25SZXNwb25zZVwiXVtcImNvbnRlbnRcIl1bXCJhcHBsaWNhdGlvbi9qc29uXCJdO1xuZXhwb3J0IHR5cGUgQnRjU2lnblJlc3BvbnNlID1cbiAgY29tcG9uZW50c1tcInJlc3BvbnNlc1wiXVtcIkJ0Y1NpZ25SZXNwb25zZVwiXVtcImNvbnRlbnRcIl1bXCJhcHBsaWNhdGlvbi9qc29uXCJdO1xuZXhwb3J0IHR5cGUgU29sYW5hU2lnblJlc3BvbnNlID1cbiAgY29tcG9uZW50c1tcInJlc3BvbnNlc1wiXVtcIlNvbGFuYVNpZ25SZXNwb25zZVwiXVtcImNvbnRlbnRcIl1bXCJhcHBsaWNhdGlvbi9qc29uXCJdO1xuZXhwb3J0IHR5cGUgTWZhUmVxdWVzdEluZm8gPVxuICBjb21wb25lbnRzW1wicmVzcG9uc2VzXCJdW1wiTWZhUmVxdWVzdEluZm9cIl1bXCJjb250ZW50XCJdW1wiYXBwbGljYXRpb24vanNvblwiXTtcblxuZXhwb3J0IHR5cGUgQWNjZXB0ZWRSZXNwb25zZSA9IGNvbXBvbmVudHNbXCJzY2hlbWFzXCJdW1wiQWNjZXB0ZWRSZXNwb25zZVwiXTtcbmV4cG9ydCB0eXBlIEVycm9yUmVzcG9uc2UgPSBjb21wb25lbnRzW1wic2NoZW1hc1wiXVtcIkVycm9yUmVzcG9uc2VcIl07XG5leHBvcnQgdHlwZSBCdGNTaWduYXR1cmVLaW5kID0gY29tcG9uZW50c1tcInNjaGVtYXNcIl1bXCJCdGNTaWduYXR1cmVLaW5kXCJdO1xuLyogZXNsaW50LWVuYWJsZSAqL1xuXG50eXBlIFNpZ25GbjxVPiA9IChoZWFkZXJzPzogSGVhZGVyc0luaXQpID0+IFByb21pc2U8VSB8IEFjY2VwdGVkUmVzcG9uc2U+O1xuXG5leHBvcnQgaW50ZXJmYWNlIFNpZ25lclNlc3Npb25MaWZldGltZSB7XG4gIC8qKiBTZXNzaW9uIGxpZmV0aW1lIChpbiBzZWNvbmRzKS4gRGVmYXVsdHMgdG8gb25lIHdlZWsgKDYwNDgwMCkuICovXG4gIHNlc3Npb24/OiBudW1iZXI7XG4gIC8qKiBBdXRoIHRva2VuIGxpZmV0aW1lIChpbiBzZWNvbmRzKS4gRGVmYXVsdHMgdG8gZml2ZSBtaW51dGVzICgzMDApLiAqL1xuICBhdXRoOiBudW1iZXI7XG4gIC8qKiBSZWZyZXNoIHRva2VuIGxpZmV0aW1lIChpbiBzZWNvbmRzKS4gRGVmYXVsdHMgdG8gb25lIGRheSAoODY0MDApLiAqL1xuICByZWZyZXNoPzogbnVtYmVyO1xufVxuXG5jb25zdCBkZWZhdWx0U2lnbmVyU2Vzc2lvbkxpZmV0aW1lOiBTaWduZXJTZXNzaW9uTGlmZXRpbWUgPSB7XG4gIHNlc3Npb246IDYwNDgwMCxcbiAgYXV0aDogMzAwLFxuICByZWZyZXNoOiA4NjQwMCxcbn07XG5cbi8qKlxuICogQSByZXNwb25zZSBvZiBhIHNpZ25pbmcgcmVxdWVzdC5cbiAqL1xuZXhwb3J0IGNsYXNzIFNpZ25SZXNwb25zZTxVPiB7XG4gIHJlYWRvbmx5ICNjczogQ3ViZVNpZ25lcjtcbiAgcmVhZG9ubHkgI29yZ0lkOiBzdHJpbmc7XG4gIHJlYWRvbmx5ICNyb2xlSWQ6IHN0cmluZztcbiAgcmVhZG9ubHkgI3NpZ25GbjogU2lnbkZuPFU+O1xuICByZWFkb25seSAjcmVzcDogVSB8IEFjY2VwdGVkUmVzcG9uc2U7XG5cbiAgLyoqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdGhpcyBzaWduaW5nIHJlcXVlc3QgcmVxdWlyZXMgYW4gTUZBIGFwcHJvdmFsICovXG4gIHJlcXVpcmVzTWZhKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAodGhpcy4jcmVzcCBhcyBBY2NlcHRlZFJlc3BvbnNlKS5hY2NlcHRlZD8uTWZhUmVxdWlyZWQgIT09IHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qKiBAcmV0dXJuIHtVfSBUaGUgc2lnbmVkIGRhdGEgKi9cbiAgZGF0YSgpOiBVIHtcbiAgICByZXR1cm4gdGhpcy4jcmVzcCBhcyBVO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcHJvdmVzIHRoZSBNRkEgcmVxdWVzdC5cbiAgICpcbiAgICogTm90ZTogVGhpcyBvbmx5IHdvcmtzIGZvciBNRkEgcmVxdWVzdHMgdGhhdCByZXF1aXJlIGEgc2luZ2xlIGFwcHJvdmFsLlxuICAgKlxuICAgKiBAcmV0dXJuIHtTaWduUmVzcG9uc2U8VT59IFRoZSByZXN1bHQgb2Ygc2lnbmluZyB3aXRoIHRoZSBhcHByb3ZhbFxuICAgKi9cbiAgYXN5bmMgYXBwcm92ZSgpOiBQcm9taXNlPFNpZ25SZXNwb25zZTxVPj4ge1xuICAgIGNvbnN0IG1mYVJlcXVpcmVkID0gKHRoaXMuI3Jlc3AgYXMgQWNjZXB0ZWRSZXNwb25zZSkuYWNjZXB0ZWQ/Lk1mYVJlcXVpcmVkO1xuICAgIGlmICghbWZhUmVxdWlyZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlJlcXVlc3QgZG9lcyBub3QgcmVxdWlyZSBNRkEgYXBwcm92YWxcIik7XG4gICAgfVxuXG4gICAgY29uc3QgbWZhSWQgPSBtZmFSZXF1aXJlZC5pZDtcbiAgICBjb25zdCBtZmFBcHByb3ZhbCA9IGF3YWl0IFJvbGUubWZhQXBwcm92ZSh0aGlzLiNjcywgdGhpcy4jb3JnSWQsIHRoaXMuI3JvbGVJZCwgbWZhSWQpO1xuICAgIGFzc2VydChtZmFBcHByb3ZhbC5pZCA9PT0gbWZhSWQpO1xuXG4gICAgY29uc3QgbWZhQ29uZiA9IG1mYUFwcHJvdmFsLnJlY2VpcHQ/LmNvbmZpcm1hdGlvbjtcbiAgICBpZiAoIW1mYUNvbmYpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIk1mYVJlcXVlc3QgaGFzIG5vdCBiZWVuIGFwcHJvdmVkIHlldFwiKTtcbiAgICB9XG5cbiAgICBjb25zdCBoZWFkZXJzID0ge1xuICAgICAgXCJ4LWN1YmlzdC1tZmEtaWRcIjogbWZhSWQsXG4gICAgICBcIngtY3ViaXN0LW1mYS1jb25maXJtYXRpb25cIjogbWZhQ29uZixcbiAgICB9O1xuICAgIHJldHVybiBuZXcgU2lnblJlc3BvbnNlKFxuICAgICAgdGhpcy4jY3MsXG4gICAgICB0aGlzLiNvcmdJZCxcbiAgICAgIHRoaXMuI3JvbGVJZCxcbiAgICAgIHRoaXMuI3NpZ25GbixcbiAgICAgIGF3YWl0IHRoaXMuI3NpZ25GbihoZWFkZXJzKVxuICAgICk7XG4gIH1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAtLSBJTlRFUk5BTCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3Rvci5cbiAgICpcbiAgICogQHBhcmFtIHtDdWJlU2lnbmVyfSBjcyBUaGUgQ3ViZVNpZ25lciBpbnN0YW5jZSB0byB1c2UgZm9yIHJlcXVlc3RzXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvcmdJZCBUaGUgb3JnIGlkIG9mIHRoZSBjb3JyZXNwb25kaW5nIHNpZ25pbmcgcmVxdWVzdFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcm9sZUlkIFRoZSByb2xlIGlkIG9mIHRoZSBjb3JyZXNwb25kaW5nIHNpZ25pbmcgcmVxdWVzdFxuICAgKiBAcGFyYW0ge1NpZ25Gbn0gc2lnbkZuIFRoZSBzaWduaW5nIGZ1bmN0aW9uIHRoYXQgdGhpcyByZXNwb25zZSBpcyBmcm9tLlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgIFRoaXMgYXJndW1lbnQgaXMgdXNlZCB0byByZXNlbmQgcmVxdWVzdHMgd2l0aFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgIGRpZmZlcmVudCBoZWFkZXJzIGlmIG5lZWRlZC5cbiAgICogQHBhcmFtIHtVIHwgQWNjZXB0ZWRSZXNwb25zZX0gcmVzcCBUaGUgcmVzcG9uc2UgYXMgcmV0dXJuZWQgYnkgdGhlIE9wZW5BUElcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGllbnQuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBjczogQ3ViZVNpZ25lcixcbiAgICBvcmdJZDogc3RyaW5nLFxuICAgIHJvbGVJZDogc3RyaW5nLFxuICAgIHNpZ25GbjogU2lnbkZuPFU+LFxuICAgIHJlc3A6IFUgfCBBY2NlcHRlZFJlc3BvbnNlXG4gICkge1xuICAgIHRoaXMuI2NzID0gY3M7XG4gICAgdGhpcy4jb3JnSWQgPSBvcmdJZDtcbiAgICB0aGlzLiNyb2xlSWQgPSByb2xlSWQ7XG4gICAgdGhpcy4jc2lnbkZuID0gc2lnbkZuO1xuICAgIHRoaXMuI3Jlc3AgPSByZXNwO1xuICB9XG59XG5cbi8qKiBTaWduZXIgc2Vzc2lvbiBpbmZvLiBDYW4gb25seSBiZSB1c2VkIHRvIHJldm9rZSBhIHRva2VuLCBidXQgbm90IGZvciBhdXRoZW50aWNhdGlvbi4gKi9cbmV4cG9ydCBjbGFzcyBTaWduZXJTZXNzaW9uSW5mbyB7XG4gIHJlYWRvbmx5ICNjczogQ3ViZVNpZ25lcjtcbiAgcmVhZG9ubHkgI29yZ0lkOiBzdHJpbmc7XG4gIHJlYWRvbmx5ICNyb2xlSWQ6IHN0cmluZztcbiAgcmVhZG9ubHkgI3Nlc3Npb25JZDogc3RyaW5nO1xuICBwdWJsaWMgcmVhZG9ubHkgcHVycG9zZTogc3RyaW5nO1xuXG4gIC8qKiBSZXZva2UgdGhpcyB0b2tlbiAqL1xuICBhc3luYyByZXZva2UoKSB7XG4gICAgYXdhaXQgU2lnbmVyU2Vzc2lvbi5yZXZva2UodGhpcy4jY3MsIHRoaXMuI29yZ0lkLCB0aGlzLiNyb2xlSWQsIHRoaXMuI3Nlc3Npb25JZCk7XG4gIH1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAtLSBJTlRFUk5BTCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8qKlxuICAgKiBJbnRlcm5hbCBjb25zdHJ1Y3Rvci5cbiAgICogQHBhcmFtIHtDdWJlU2lnbmVyfSBjcyBDdWJlU2lnbmVyIGluc3RhbmNlIHRvIHVzZSB3aGVuIGNhbGxpbmcgYHJldm9rZWBcbiAgICogQHBhcmFtIHtzdHJpbmd9IG9yZ0lkIE9yZ2FuaXphdGlvbiBJRFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcm9sZUlkIFJvbGUgSURcbiAgICogQHBhcmFtIHtzdHJpbmd9IGhhc2ggVGhlIGhhc2ggb2YgdGhlIHRva2VuOyBjYW4gYmUgdXNlZCBmb3IgcmV2b2NhdGlvbiBidXQgbm90IGZvciBhdXRoXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwdXJwb3NlIFNlc3Npb24gcHVycG9zZVxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIGNvbnN0cnVjdG9yKGNzOiBDdWJlU2lnbmVyLCBvcmdJZDogc3RyaW5nLCByb2xlSWQ6IHN0cmluZywgaGFzaDogc3RyaW5nLCBwdXJwb3NlOiBzdHJpbmcpIHtcbiAgICB0aGlzLiNjcyA9IGNzO1xuICAgIHRoaXMuI29yZ0lkID0gb3JnSWQ7XG4gICAgdGhpcy4jcm9sZUlkID0gcm9sZUlkO1xuICAgIHRoaXMuI3Nlc3Npb25JZCA9IGhhc2g7XG4gICAgdGhpcy5wdXJwb3NlID0gcHVycG9zZTtcbiAgfVxufVxuXG4vKiogU2lnbmVyIHNlc3Npb24uICovXG5leHBvcnQgY2xhc3MgU2lnbmVyU2Vzc2lvbiBleHRlbmRzIFNlc3Npb25NYW5hZ2VyPFNpZ25lclNlc3Npb25PYmplY3Q+IHtcbiAgcmVhZG9ubHkgY3M6IEN1YmVTaWduZXI7XG4gIHJlYWRvbmx5ICNvcmdJZDogc3RyaW5nO1xuICByZWFkb25seSByb2xlSWQ6IHN0cmluZztcbiAgI2NsaWVudDogQ2xpZW50O1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgY2xpZW50IHdpdGggdGhlIGN1cnJlbnQgc2Vzc2lvbiBhbmQgcmVmcmVzaGVzIHRoZSBjdXJyZW50XG4gICAqIHNlc3Npb24uIE1heSAqKlVQREFURS9NVVRBVEUqKiBzZWxmLlxuICAgKi9cbiAgYXN5bmMgY2xpZW50KCk6IFByb21pc2U8Q2xpZW50PiB7XG4gICAgYXdhaXQgdGhpcy5yZWZyZXNoSWZOZWVkZWQoKTtcbiAgICByZXR1cm4gdGhpcy4jY2xpZW50O1xuICB9XG5cbiAgLyoqIFJldm9rZXMgdGhlIHNlc3Npb24uICovXG4gIGFzeW5jIHJldm9rZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzZXNzaW9uID0gYXdhaXQgdGhpcy5zdG9yYWdlLnJldHJpZXZlKCk7XG4gICAgY29uc3QgcmVzcCA9IGF3YWl0IHRoaXMuY3NcbiAgICAgIC5tYW5hZ2VtZW50KClcbiAgICAgIC5kZWwoXCIvdjAvb3JnL3tvcmdfaWR9L3JvbGVzL3tyb2xlX2lkfS90b2tlbnMve3Nlc3Npb25faWR9XCIsIHtcbiAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgcGF0aDoge1xuICAgICAgICAgICAgb3JnX2lkOiBzZXNzaW9uLm9yZ19pZCxcbiAgICAgICAgICAgIHJvbGVfaWQ6IHNlc3Npb24ucm9sZV9pZCxcbiAgICAgICAgICAgIHNlc3Npb25faWQ6IHNlc3Npb24uc2Vzc2lvbl9pbmZvLnNlc3Npb25faWQsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgcGFyc2VBczogXCJqc29uXCIsXG4gICAgICB9KTtcbiAgICBhc3NlcnRPayhyZXNwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgaXQncyB0aW1lIHRvIHJlZnJlc2ggdGhpcyB0b2tlbi5cbiAgICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciBpdCdzIHRpbWUgdG8gcmVmcmVzaCB0aGlzIHRva2VuLlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIGFzeW5jIGlzU3RhbGUoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IHRoaXMuc3RvcmFnZS5yZXRyaWV2ZSgpO1xuICAgIGNvbnN0IGNzaSA9IHNlc3Npb24uc2Vzc2lvbl9pbmZvO1xuICAgIGNvbnN0IG5vd19lcG9jaF9zZWNvbmRzID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLyAxMDAwO1xuICAgIHJldHVybiBjc2kuYXV0aF90b2tlbl9leHAgPCBub3dfZXBvY2hfc2Vjb25kcyArIEVYUElSQVRJT05fQlVGRkVSX1NFQ1M7XG4gIH1cblxuICAvKipcbiAgICogUmVmcmVzaGVzIHRoZSBzZXNzaW9uIGFuZCAqKlVQREFURVMvTVVUQVRFUyoqIHNlbGYuXG4gICAqL1xuICBhc3luYyByZWZyZXNoKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHNlc3Npb24gPSBhd2FpdCB0aGlzLnN0b3JhZ2UucmV0cmlldmUoKTtcbiAgICBjb25zdCBjc2kgPSBzZXNzaW9uLnNlc3Npb25faW5mbztcbiAgICBjb25zdCByZXNwID0gYXdhaXQgdGhpcy4jY2xpZW50LnBhdGNoKFwiL3YxL29yZy97b3JnX2lkfS90b2tlbi9yZWZyZXNoXCIsIHtcbiAgICAgIHBhcmFtczogeyBwYXRoOiB7IG9yZ19pZDogc2Vzc2lvbi5vcmdfaWQgfSB9LFxuICAgICAgYm9keTogPFJlZnJlc2hTaWduZXJTZXNzaW9uUmVxdWVzdD57XG4gICAgICAgIGVwb2NoX251bTogY3NpLmVwb2NoLFxuICAgICAgICBlcG9jaF90b2tlbjogY3NpLmVwb2NoX3Rva2VuLFxuICAgICAgICBvdGhlcl90b2tlbjogY3NpLnJlZnJlc2hfdG9rZW4sXG4gICAgICB9LFxuICAgICAgcGFyc2VBczogXCJqc29uXCIsXG4gICAgfSk7XG4gICAgY29uc3QgZGF0YSA9IGFzc2VydE9rKHJlc3ApO1xuICAgIGF3YWl0IHRoaXMuc3RvcmFnZS5zYXZlKDxTaWduZXJTZXNzaW9uT2JqZWN0PntcbiAgICAgIC4uLnNlc3Npb24sXG4gICAgICBzZXNzaW9uX2luZm86IGRhdGEuc2Vzc2lvbl9pbmZvLFxuICAgICAgdG9rZW46IGRhdGEudG9rZW4sXG4gICAgfSk7XG4gICAgdGhpcy4jY2xpZW50ID0gdGhpcy4jbWFrZUNsaWVudChkYXRhLnRva2VuKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHtQcm9taXNlPHN0cmluZz59IFRoZSBzZXNzaW9uIGlkXG4gICAqL1xuICBhc3luYyBzZXNzaW9uSWQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBzZXNzaW9uID0gYXdhaXQgdGhpcy5zdG9yYWdlLnJldHJpZXZlKCk7XG4gICAgcmV0dXJuIHNlc3Npb24uc2Vzc2lvbl9pbmZvLnNlc3Npb25faWQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbGlzdCBvZiBrZXlzIHRoYXQgdGhpcyB0b2tlbiBncmFudHMgYWNjZXNzIHRvLlxuICAgKiBAcmV0dXJuIHtLZXlJbmZvW119IFRoZSBsaXN0IG9mIGtleXMuXG4gICAqL1xuICBhc3luYyBrZXlzKCk6IFByb21pc2U8S2V5SW5mb1tdPiB7XG4gICAgY29uc3QgcmVzcCA9IGF3YWl0IChcbiAgICAgIGF3YWl0IHRoaXMuY2xpZW50KClcbiAgICApLmdldChcIi92MC9vcmcve29yZ19pZH0vdG9rZW4va2V5c1wiLCB7XG4gICAgICBwYXJhbXM6IHsgcGF0aDogeyBvcmdfaWQ6IHRoaXMuI29yZ0lkIH0gfSxcbiAgICAgIHBhcnNlQXM6IFwianNvblwiLFxuICAgIH0pO1xuICAgIGNvbnN0IGRhdGEgPSBhc3NlcnRPayhyZXNwKTtcbiAgICByZXR1cm4gZGF0YS5rZXlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1Ym1pdCBhbiAnZXRoMScgc2lnbiByZXF1ZXN0LlxuICAgKiBAcGFyYW0ge0tleSB8IHN0cmluZ30ga2V5IFRoZSBrZXkgdG8gc2lnbiB3aXRoIChlaXRoZXIge0BsaW5rIEtleX0gb3IgaXRzIG1hdGVyaWFsIElEKS5cbiAgICogQHBhcmFtIHtFdGgxU2lnblJlcXVlc3R9IHJlcSBXaGF0IHRvIHNpZ24uXG4gICAqIEByZXR1cm4ge1Byb21pc2U8RXRoMVNpZ25SZXNwb25zZSB8IEFjY2VwdGVkUmVzcG9uc2U+fSBTaWduYXR1cmVcbiAgICovXG4gIGFzeW5jIHNpZ25FdGgxKGtleTogS2V5IHwgc3RyaW5nLCByZXE6IEV0aDFTaWduUmVxdWVzdCk6IFByb21pc2U8U2lnblJlc3BvbnNlPEV0aDFTaWduUmVzcG9uc2U+PiB7XG4gICAgY29uc3QgcHVia2V5ID0gdHlwZW9mIGtleSA9PT0gXCJzdHJpbmdcIiA/IChrZXkgYXMgc3RyaW5nKSA6IGtleS5tYXRlcmlhbElkO1xuICAgIGNvbnN0IHNpZ24gPSBhc3luYyAoaGVhZGVycz86IEhlYWRlcnNJbml0KSA9PiB7XG4gICAgICBjb25zdCByZXNwID0gYXdhaXQgKFxuICAgICAgICBhd2FpdCB0aGlzLmNsaWVudCgpXG4gICAgICApLnBvc3QoXCIvdjEvb3JnL3tvcmdfaWR9L2V0aDEvc2lnbi97cHVia2V5fVwiLCB7XG4gICAgICAgIHBhcmFtczogeyBwYXRoOiB7IG9yZ19pZDogdGhpcy4jb3JnSWQsIHB1YmtleSB9IH0sXG4gICAgICAgIGJvZHk6IHJlcSxcbiAgICAgICAgaGVhZGVycyxcbiAgICAgICAgcGFyc2VBczogXCJqc29uXCIsXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBhc3NlcnRPayhyZXNwKTtcbiAgICB9O1xuICAgIHJldHVybiBuZXcgU2lnblJlc3BvbnNlKHRoaXMuY3MsIHRoaXMuI29yZ0lkLCB0aGlzLnJvbGVJZCwgc2lnbiwgYXdhaXQgc2lnbigpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJtaXQgYW4gJ2V0aDInIHNpZ24gcmVxdWVzdC5cbiAgICogQHBhcmFtIHtLZXkgfCBzdHJpbmd9IGtleSBUaGUga2V5IHRvIHNpZ24gd2l0aCAoZWl0aGVyIHtAbGluayBLZXl9IG9yIGl0cyBtYXRlcmlhbCBJRCkuXG4gICAqIEBwYXJhbSB7RXRoMlNpZ25SZXF1ZXN0fSByZXEgV2hhdCB0byBzaWduLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlPEV0aDJTaWduUmVzcG9uc2UgfCBBY2NlcHRlZFJlc3BvbnNlPn0gU2lnbmF0dXJlXG4gICAqL1xuICBhc3luYyBzaWduRXRoMihrZXk6IEtleSB8IHN0cmluZywgcmVxOiBFdGgyU2lnblJlcXVlc3QpOiBQcm9taXNlPFNpZ25SZXNwb25zZTxFdGgyU2lnblJlc3BvbnNlPj4ge1xuICAgIGNvbnN0IHB1YmtleSA9IHR5cGVvZiBrZXkgPT09IFwic3RyaW5nXCIgPyAoa2V5IGFzIHN0cmluZykgOiBrZXkubWF0ZXJpYWxJZDtcbiAgICBjb25zdCBzaWduID0gYXN5bmMgKGhlYWRlcnM/OiBIZWFkZXJzSW5pdCkgPT4ge1xuICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IChcbiAgICAgICAgYXdhaXQgdGhpcy5jbGllbnQoKVxuICAgICAgKS5wb3N0KFwiL3YxL29yZy97b3JnX2lkfS9ldGgyL3NpZ24ve3B1YmtleX1cIiwge1xuICAgICAgICBwYXJhbXM6IHsgcGF0aDogeyBvcmdfaWQ6IHRoaXMuI29yZ0lkLCBwdWJrZXkgfSB9LFxuICAgICAgICBib2R5OiByZXEsXG4gICAgICAgIGhlYWRlcnMsXG4gICAgICAgIHBhcnNlQXM6IFwianNvblwiLFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gYXNzZXJ0T2socmVzcCk7XG4gICAgfTtcbiAgICByZXR1cm4gbmV3IFNpZ25SZXNwb25zZSh0aGlzLmNzLCB0aGlzLiNvcmdJZCwgdGhpcy5yb2xlSWQsIHNpZ24sIGF3YWl0IHNpZ24oKSk7XG4gIH1cblxuICAvKipcbiAgICogU2lnbiBhIHN0YWtlIHJlcXVlc3QuXG4gICAqIEBwYXJhbSB7RXRoMlN0YWtlUmVxdWVzdH0gcmVxIFRoZSByZXF1ZXN0IHRvIHNpZ24uXG4gICAqIEByZXR1cm4ge1Byb21pc2U8RXRoMlN0YWtlUmVzcG9uc2UgfCBBY2NlcHRlZFJlc3BvbnNlPn0gVGhlIHJlc3BvbnNlLlxuICAgKi9cbiAgYXN5bmMgc3Rha2UocmVxOiBFdGgyU3Rha2VSZXF1ZXN0KTogUHJvbWlzZTxTaWduUmVzcG9uc2U8RXRoMlN0YWtlUmVzcG9uc2U+PiB7XG4gICAgY29uc3Qgc2lnbiA9IGFzeW5jIChoZWFkZXJzPzogSGVhZGVyc0luaXQpID0+IHtcbiAgICAgIGNvbnN0IHJlc3AgPSBhd2FpdCAoXG4gICAgICAgIGF3YWl0IHRoaXMuY2xpZW50KClcbiAgICAgICkucG9zdChcIi92MS9vcmcve29yZ19pZH0vZXRoMi9zdGFrZVwiLCB7XG4gICAgICAgIHBhcmFtczogeyBwYXRoOiB7IG9yZ19pZDogdGhpcy4jb3JnSWQgfSB9LFxuICAgICAgICBib2R5OiByZXEsXG4gICAgICAgIGhlYWRlcnMsXG4gICAgICAgIHBhcnNlQXM6IFwianNvblwiLFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gYXNzZXJ0T2socmVzcCk7XG4gICAgfTtcbiAgICByZXR1cm4gbmV3IFNpZ25SZXNwb25zZSh0aGlzLmNzLCB0aGlzLiNvcmdJZCwgdGhpcy5yb2xlSWQsIHNpZ24sIGF3YWl0IHNpZ24oKSk7XG4gIH1cblxuICAvKipcbiAgICogU2lnbiBhbiB1bnN0YWtlIHJlcXVlc3QuXG4gICAqIEBwYXJhbSB7S2V5IHwgc3RyaW5nfSBrZXkgVGhlIGtleSB0byBzaWduIHdpdGggKGVpdGhlciB7QGxpbmsgS2V5fSBvciBpdHMgbWF0ZXJpYWwgSUQpLlxuICAgKiBAcGFyYW0ge0V0aDJVbnN0YWtlUmVxdWVzdH0gcmVxIFRoZSByZXF1ZXN0IHRvIHNpZ24uXG4gICAqIEByZXR1cm4ge1Byb21pc2U8RXRoMlVuc3Rha2VSZXNwb25zZSB8IEFjY2VwdGVkUmVzcG9uc2U+fSBUaGUgcmVzcG9uc2UuXG4gICAqL1xuICBhc3luYyB1bnN0YWtlKFxuICAgIGtleTogS2V5IHwgc3RyaW5nLFxuICAgIHJlcTogRXRoMlVuc3Rha2VSZXF1ZXN0XG4gICk6IFByb21pc2U8U2lnblJlc3BvbnNlPEV0aDJVbnN0YWtlUmVzcG9uc2U+PiB7XG4gICAgY29uc3QgcHVia2V5ID0gdHlwZW9mIGtleSA9PT0gXCJzdHJpbmdcIiA/IChrZXkgYXMgc3RyaW5nKSA6IGtleS5tYXRlcmlhbElkO1xuICAgIGNvbnN0IHNpZ24gPSBhc3luYyAoaGVhZGVycz86IEhlYWRlcnNJbml0KSA9PiB7XG4gICAgICBjb25zdCByZXNwID0gYXdhaXQgKFxuICAgICAgICBhd2FpdCB0aGlzLmNsaWVudCgpXG4gICAgICApLnBvc3QoXCIvdjEvb3JnL3tvcmdfaWR9L2V0aDIvdW5zdGFrZS97cHVia2V5fVwiLCB7XG4gICAgICAgIHBhcmFtczogeyBwYXRoOiB7IG9yZ19pZDogdGhpcy4jb3JnSWQsIHB1YmtleSB9IH0sXG4gICAgICAgIGJvZHk6IHJlcSxcbiAgICAgICAgaGVhZGVycyxcbiAgICAgICAgcGFyc2VBczogXCJqc29uXCIsXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBhc3NlcnRPayhyZXNwKTtcbiAgICB9O1xuICAgIHJldHVybiBuZXcgU2lnblJlc3BvbnNlKHRoaXMuY3MsIHRoaXMuI29yZ0lkLCB0aGlzLnJvbGVJZCwgc2lnbiwgYXdhaXQgc2lnbigpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaWduIGEgcmF3IGJsb2IuXG4gICAqIEBwYXJhbSB7S2V5IHwgc3RyaW5nfSBrZXkgVGhlIGtleSB0byBzaWduIHdpdGggKGVpdGhlciB7QGxpbmsgS2V5fSBvciBpdHMgSUQpLlxuICAgKiBAcGFyYW0ge0Jsb2JTaWduUmVxdWVzdH0gcmVxIFdoYXQgdG8gc2lnblxuICAgKiBAcmV0dXJuIHtQcm9taXNlPEJsb2JTaWduUmVzcG9uc2UgfCBBY2NlcHRlZFJlc3BvbnNlPn0gVGhlIHJlc3BvbnNlLlxuICAgKi9cbiAgYXN5bmMgc2lnbkJsb2Ioa2V5OiBLZXkgfCBzdHJpbmcsIHJlcTogQmxvYlNpZ25SZXF1ZXN0KTogUHJvbWlzZTxTaWduUmVzcG9uc2U8QmxvYlNpZ25SZXNwb25zZT4+IHtcbiAgICBjb25zdCBrZXlfaWQgPSB0eXBlb2Yga2V5ID09PSBcInN0cmluZ1wiID8gKGtleSBhcyBzdHJpbmcpIDoga2V5LmlkO1xuICAgIGNvbnN0IHNpZ24gPSBhc3luYyAoaGVhZGVycz86IEhlYWRlcnNJbml0KSA9PiB7XG4gICAgICBjb25zdCByZXNwID0gYXdhaXQgKFxuICAgICAgICBhd2FpdCB0aGlzLmNsaWVudCgpXG4gICAgICApLnBvc3QoXCIvdjEvb3JnL3tvcmdfaWR9L2Jsb2Ivc2lnbi97a2V5X2lkfVwiLCB7XG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgIHBhdGg6IHsgb3JnX2lkOiB0aGlzLiNvcmdJZCwga2V5X2lkIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGJvZHk6IHJlcSxcbiAgICAgICAgaGVhZGVycyxcbiAgICAgICAgcGFyc2VBczogXCJqc29uXCIsXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBhc3NlcnRPayhyZXNwKTtcbiAgICB9O1xuICAgIHJldHVybiBuZXcgU2lnblJlc3BvbnNlKHRoaXMuY3MsIHRoaXMuI29yZ0lkLCB0aGlzLnJvbGVJZCwgc2lnbiwgYXdhaXQgc2lnbigpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaWduIGEgYml0Y29pbiBtZXNzYWdlLlxuICAgKiBAcGFyYW0ge0tleSB8IHN0cmluZ30ga2V5IFRoZSBrZXkgdG8gc2lnbiB3aXRoIChlaXRoZXIge0BsaW5rIEtleX0gb3IgaXRzIG1hdGVyaWFsIElEKS5cbiAgICogQHBhcmFtIHtCdGNTaWduUmVxdWVzdH0gcmVxIFdoYXQgdG8gc2lnblxuICAgKiBAcmV0dXJuIHtQcm9taXNlPEJ0Y1NpZ25SZXNwb25zZSB8IEFjY2VwdGVkUmVzcG9uc2U+fSBUaGUgcmVzcG9uc2UuXG4gICAqL1xuICBhc3luYyBzaWduQnRjKGtleTogS2V5IHwgc3RyaW5nLCByZXE6IEJ0Y1NpZ25SZXF1ZXN0KTogUHJvbWlzZTxTaWduUmVzcG9uc2U8QnRjU2lnblJlc3BvbnNlPj4ge1xuICAgIGNvbnN0IHB1YmtleSA9IHR5cGVvZiBrZXkgPT09IFwic3RyaW5nXCIgPyAoa2V5IGFzIHN0cmluZykgOiBrZXkubWF0ZXJpYWxJZDtcbiAgICBjb25zdCBzaWduID0gYXN5bmMgKGhlYWRlcnM/OiBIZWFkZXJzSW5pdCkgPT4ge1xuICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IChcbiAgICAgICAgYXdhaXQgdGhpcy5jbGllbnQoKVxuICAgICAgKS5wb3N0KFwiL3YwL29yZy97b3JnX2lkfS9idGMvc2lnbi97cHVia2V5fVwiLCB7XG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgIHBhdGg6IHsgb3JnX2lkOiB0aGlzLiNvcmdJZCwgcHVia2V5IH0sXG4gICAgICAgIH0sXG4gICAgICAgIGJvZHk6IHJlcSxcbiAgICAgICAgaGVhZGVyczogaGVhZGVycyxcbiAgICAgICAgcGFyc2VBczogXCJqc29uXCIsXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBhc3NlcnRPayhyZXNwKTtcbiAgICB9O1xuICAgIHJldHVybiBuZXcgU2lnblJlc3BvbnNlKHRoaXMuY3MsIHRoaXMuI29yZ0lkLCB0aGlzLnJvbGVJZCwgc2lnbiwgYXdhaXQgc2lnbigpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaWduIGEgc29sYW5hIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSB7S2V5IHwgc3RyaW5nfSBrZXkgVGhlIGtleSB0byBzaWduIHdpdGggKGVpdGhlciB7QGxpbmsgS2V5fSBvciBpdHMgbWF0ZXJpYWwgSUQpLlxuICAgKiBAcGFyYW0ge1NvbGFuYVNpZ25SZXF1ZXN0fSByZXEgV2hhdCB0byBzaWduXG4gICAqIEByZXR1cm4ge1Byb21pc2U8U29sYW5hU2lnblJlc3BvbnNlIHwgQWNjZXB0ZWRSZXNwb25zZT59IFRoZSByZXNwb25zZS5cbiAgICovXG4gIGFzeW5jIHNpZ25Tb2xhbmEoXG4gICAga2V5OiBLZXkgfCBzdHJpbmcsXG4gICAgcmVxOiBTb2xhbmFTaWduUmVxdWVzdFxuICApOiBQcm9taXNlPFNpZ25SZXNwb25zZTxTb2xhbmFTaWduUmVzcG9uc2U+PiB7XG4gICAgY29uc3QgcHVia2V5ID0gdHlwZW9mIGtleSA9PT0gXCJzdHJpbmdcIiA/IChrZXkgYXMgc3RyaW5nKSA6IGtleS5tYXRlcmlhbElkO1xuICAgIGNvbnN0IHNpZ24gPSBhc3luYyAoaGVhZGVycz86IEhlYWRlcnNJbml0KSA9PiB7XG4gICAgICBjb25zdCByZXNwID0gYXdhaXQgKFxuICAgICAgICBhd2FpdCB0aGlzLmNsaWVudCgpXG4gICAgICApLnBvc3QoXCIvdjEvb3JnL3tvcmdfaWR9L3NvbGFuYS9zaWduL3twdWJrZXl9XCIsIHtcbiAgICAgICAgcGFyYW1zOiB7IHBhdGg6IHsgb3JnX2lkOiB0aGlzLiNvcmdJZCwgcHVia2V5IH0gfSxcbiAgICAgICAgYm9keTogcmVxLFxuICAgICAgICBoZWFkZXJzLFxuICAgICAgICBwYXJzZUFzOiBcImpzb25cIixcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGFzc2VydE9rKHJlc3ApO1xuICAgIH07XG4gICAgcmV0dXJuIG5ldyBTaWduUmVzcG9uc2UodGhpcy5jcywgdGhpcy4jb3JnSWQsIHRoaXMucm9sZUlkLCBzaWduLCBhd2FpdCBzaWduKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBzaWduZXIgc2Vzc2lvbi5cbiAgICogQHBhcmFtIHtDdWJlU2lnbmVyfSBjcyBDdWJlU2lnbmVyXG4gICAqIEBwYXJhbSB7U2Vzc2lvblN0b3JhZ2U8U2lnbmVyU2Vzc2lvbk9iamVjdD59IHN0b3JhZ2UgVGhlIHNlc3Npb24gc3RvcmFnZSB0byB1c2VcbiAgICogQHBhcmFtIHtzdHJpbmd9IG9yZ0lkIE9yZyBJRFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcm9sZUlkIFJvbGUgSURcbiAgICogQHBhcmFtIHtzdHJpbmd9IHB1cnBvc2UgVGhlIHB1cnBvc2Ugb2YgdGhlIHNlc3Npb25cbiAgICogQHBhcmFtIHtTaWduZXJTZXNzaW9uTGlmZXRpbWV9IHR0bCBMaWZldGltZSBzZXR0aW5nc1xuICAgKiBAcmV0dXJuIHtQcm9taXNlPFNpbmdlclNlc3Npb24+fSBOZXcgc2lnbmVyIHNlc3Npb25cbiAgICovXG4gIHN0YXRpYyBhc3luYyBjcmVhdGUoXG4gICAgY3M6IEN1YmVTaWduZXIsXG4gICAgc3RvcmFnZTogU2Vzc2lvblN0b3JhZ2U8U2lnbmVyU2Vzc2lvbk9iamVjdD4sXG4gICAgb3JnSWQ6IHN0cmluZyxcbiAgICByb2xlSWQ6IHN0cmluZyxcbiAgICBwdXJwb3NlOiBzdHJpbmcsXG4gICAgdHRsPzogU2lnbmVyU2Vzc2lvbkxpZmV0aW1lXG4gICk6IFByb21pc2U8U2lnbmVyU2Vzc2lvbj4ge1xuICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBjcy5tYW5hZ2VtZW50KCkucG9zdChcIi92MC9vcmcve29yZ19pZH0vcm9sZXMve3JvbGVfaWR9L3Rva2Vuc1wiLCB7XG4gICAgICBwYXJhbXM6IHsgcGF0aDogeyBvcmdfaWQ6IG9yZ0lkLCByb2xlX2lkOiByb2xlSWQgfSB9LFxuICAgICAgYm9keToge1xuICAgICAgICBwdXJwb3NlLFxuICAgICAgICBhdXRoX2xpZmV0aW1lOiB0dGw/LmF1dGggfHwgZGVmYXVsdFNpZ25lclNlc3Npb25MaWZldGltZS5hdXRoLFxuICAgICAgICByZWZyZXNoX2xpZmV0aW1lOiB0dGw/LnJlZnJlc2ggfHwgZGVmYXVsdFNpZ25lclNlc3Npb25MaWZldGltZS5yZWZyZXNoLFxuICAgICAgICBzZXNzaW9uX2xpZmV0aW1lOiB0dGw/LnNlc3Npb24gfHwgZGVmYXVsdFNpZ25lclNlc3Npb25MaWZldGltZS5zZXNzaW9uLFxuICAgICAgfSxcbiAgICAgIHBhcnNlQXM6IFwianNvblwiLFxuICAgIH0pO1xuICAgIGNvbnN0IGRhdGEgPSBhc3NlcnRPayhyZXNwKTtcbiAgICBjb25zdCBzZXNzaW9uX2luZm8gPSBkYXRhLnNlc3Npb25faW5mbztcbiAgICBpZiAoIXNlc3Npb25faW5mbykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2lnbmVyIHNlc3Npb24gaW5mbyBtaXNzaW5nXCIpO1xuICAgIH1cbiAgICBhd2FpdCBzdG9yYWdlLnNhdmUoe1xuICAgICAgb3JnX2lkOiBvcmdJZCxcbiAgICAgIHJvbGVfaWQ6IHJvbGVJZCxcbiAgICAgIHB1cnBvc2UsXG4gICAgICB0b2tlbjogZGF0YS50b2tlbixcbiAgICAgIHNlc3Npb25faW5mbyxcbiAgICB9KTtcbiAgICByZXR1cm4gbmV3IFNpZ25lclNlc3Npb24oY3MsIHN0b3JhZ2UsIG9yZ0lkLCByb2xlSWQsIGRhdGEudG9rZW4pO1xuICB9XG5cbiAgLyoqXG4gICAqIExvYWRzIGFuIGV4aXN0aW5nIHNpZ25lciBzZXNzaW9uIGZyb20gYSBzZXNzaW9uIHN0b3JhZ2VcbiAgICogQHBhcmFtIHtDdWJlU2lnbmVyfSBjcyBDdWJlU2lnbmVyXG4gICAqIEBwYXJhbSB7U2Vzc2lvblN0b3JhZ2U8U2lnbmVyU2Vzc2lvbkluZm8+fSBzdG9yYWdlIFRoZSBzZXNzaW9uIHN0b3JhZ2UgaG9sZGluZyB0aGUgY3JlZGVudGlhbHNcbiAgICogQHJldHVybiB7UHJvbWlzZTxTaW5nZXJTZXNzaW9uPn0gTmV3IHNpZ25lciBzZXNzaW9uXG4gICAqL1xuICBzdGF0aWMgYXN5bmMgbG9hZEZyb21TdG9yYWdlKFxuICAgIGNzOiBDdWJlU2lnbmVyLFxuICAgIHN0b3JhZ2U6IFNlc3Npb25TdG9yYWdlPFNpZ25lclNlc3Npb25PYmplY3Q+XG4gICk6IFByb21pc2U8U2lnbmVyU2Vzc2lvbj4ge1xuICAgIGNvbnN0IHNlc3Npb24gPSBhd2FpdCBzdG9yYWdlLnJldHJpZXZlKCk7XG4gICAgcmV0dXJuIG5ldyBTaWduZXJTZXNzaW9uKGNzLCBzdG9yYWdlLCBzZXNzaW9uLm9yZ19pZCwgc2Vzc2lvbi5yb2xlX2lkLCBzZXNzaW9uLnRva2VuKTtcbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIC0tIElOVEVSTkFMIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdG9yLlxuICAgKiBAcGFyYW0ge0N1YmVTaWduZXJ9IGNzIEN1YmVTaWduZXJcbiAgICogQHBhcmFtIHtTZXNzaW9uU3RvcmFnZTxTaWduZXJTZXNzaW9uT2JqZWN0Pn0gc3RvcmFnZSBUaGUgc2Vzc2lvbiBzdG9yYWdlIHRvIHVzZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gb3JnSWQgT3JnYW5pemF0aW9uIElEXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByb2xlSWQgVGhlIGlkIG9mIHRoZSByb2xlIHRoYXQgdGhpcyBzZXNzaW9uIGFzc3VtZXNcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRva2VuIFRoZSBhdXRob3JpemF0aW9uIHRva2VuIHRvIHVzZVxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIHByaXZhdGUgY29uc3RydWN0b3IoXG4gICAgY3M6IEN1YmVTaWduZXIsXG4gICAgc3RvcmFnZTogU2Vzc2lvblN0b3JhZ2U8U2lnbmVyU2Vzc2lvbk9iamVjdD4sXG4gICAgb3JnSWQ6IHN0cmluZyxcbiAgICByb2xlSWQ6IHN0cmluZyxcbiAgICB0b2tlbjogc3RyaW5nXG4gICkge1xuICAgIHN1cGVyKHN0b3JhZ2UpO1xuICAgIHRoaXMuY3MgPSBjcztcbiAgICB0aGlzLiNvcmdJZCA9IG9yZ0lkO1xuICAgIHRoaXMucm9sZUlkID0gcm9sZUlkO1xuICAgIHRoaXMuI2NsaWVudCA9IHRoaXMuI21ha2VDbGllbnQodG9rZW4pO1xuICB9XG5cbiAgLyogZXNsaW50LWRpc2FibGUgcmVxdWlyZS1qc2RvYyAqL1xuXG4gIC8qKlxuICAgKiBTdGF0aWMgbWV0aG9kIGZvciByZXZva2luZyBhIHRva2VuICh1c2VkIGJvdGggZnJvbSB7U2lnbmVyU2Vzc2lvbn0gYW5kIHtTaWduZXJTZXNzaW9uSW5mb30pLlxuICAgKiBAcGFyYW0ge0N1YmVTaWduZXJ9IGNzIEN1YmVTaWduZXIgaW5zdGFuY2VcbiAgICogQHBhcmFtIHtzdHJpbmd9IG9yZ0lkIE9yZ2FuaXphdGlvbiBJRFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcm9sZUlkIFJvbGUgSURcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNlc3Npb25JZCBTaWduZXIgc2Vzc2lvbiBJRFxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIHN0YXRpYyBhc3luYyByZXZva2UoY3M6IEN1YmVTaWduZXIsIG9yZ0lkOiBzdHJpbmcsIHJvbGVJZDogc3RyaW5nLCBzZXNzaW9uSWQ6IHN0cmluZykge1xuICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBjcy5tYW5hZ2VtZW50KCkuZGVsKFwiL3YwL29yZy97b3JnX2lkfS9yb2xlcy97cm9sZV9pZH0vdG9rZW5zL3tzZXNzaW9uX2lkfVwiLCB7XG4gICAgICBwYXJhbXM6IHtcbiAgICAgICAgcGF0aDogeyBvcmdfaWQ6IG9yZ0lkLCByb2xlX2lkOiByb2xlSWQsIHNlc3Npb25faWQ6IHNlc3Npb25JZCB9LFxuICAgICAgfSxcbiAgICAgIHBhcnNlQXM6IFwianNvblwiLFxuICAgIH0pO1xuICAgIGFzc2VydE9rKHJlc3ApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgUkVTVCBjbGllbnQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0b2tlbiBUaGUgYXV0aG9yaXphdGlvbiB0b2tlbiB0byB1c2UgZm9yIHRoZSBjbGllbnRcbiAgICogQHJldHVybiB7Q2xpZW50fSBUaGUgbmV3IFJFU1QgY2xpZW50XG4gICAqL1xuICAjbWFrZUNsaWVudCh0b2tlbjogc3RyaW5nKTogQ2xpZW50IHtcbiAgICByZXR1cm4gY3JlYXRlQ2xpZW50PHBhdGhzPih7XG4gICAgICBiYXNlVXJsOiB0aGlzLmNzLmVudi5TaWduZXJBcGlSb290LFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICBBdXRob3JpemF0aW9uOiB0b2tlbixcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==