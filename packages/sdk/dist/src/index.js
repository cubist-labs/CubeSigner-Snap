"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
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
var _CubeSigner_managementToken, _CubeSigner_env, _CubeSigner_managementClient;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CubeSigner = void 0;
const env_1 = require("./env");
const console_1 = require("console");
const openapi_fetch_1 = __importDefault(require("openapi-fetch"));
const org_1 = require("./org");
const signer_session_1 = require("./signer_session");
/** CubeSigner client */
class CubeSigner {
    /** @return {EnvInterface} The CubeSigner environment of this client */
    get env() {
        return __classPrivateFieldGet(this, _CubeSigner_env, "f");
    }
    /**
     * Create a new CubeSigner instance.
     * @param {CubeSignerOptions} options The options for the CubeSigner instance.
     */
    constructor(options) {
        _CubeSigner_managementToken.set(this, void 0);
        _CubeSigner_env.set(this, void 0);
        _CubeSigner_managementClient.set(this, void 0);
        __classPrivateFieldSet(this, _CubeSigner_managementToken, options.managementToken, "f");
        __classPrivateFieldSet(this, _CubeSigner_env, options.env ?? env_1.env["gamma"], "f");
        if (__classPrivateFieldGet(this, _CubeSigner_managementToken, "f")) {
            __classPrivateFieldSet(this, _CubeSigner_managementClient, (0, openapi_fetch_1.default)({
                baseUrl: __classPrivateFieldGet(this, _CubeSigner_env, "f").SignerApiRoot,
                headers: {
                    Authorization: __classPrivateFieldGet(this, _CubeSigner_managementToken, "f"),
                },
            }), "f");
        }
    }
    /**
     * Loads a signer session from a session storage (e.g., session file).
     * @param {SessionStorage<SignerSessionObject>} storage The signer session storage
     * @return {Promise<SignerSession>} New signer session
     */
    async loadSignerSessionFromStorage(storage) {
        return await signer_session_1.SignerSession.loadFromStorage(this, storage);
    }
    /** Retrieves information about the current user. */
    async aboutMe() {
        const resp = await this.management().get("/v0/about_me", {
            parseAs: "json",
        });
        const data = (0, env_1.assertOk)(resp);
        return data;
    }
    /** Retrieves information about an organization.
     * @param {string} org The ID or name of the organization.
     * @return {Org} The organization.
     * */
    async getOrg(org) {
        const resp = await this.management().get("/v0/org/{org_id}", {
            params: { path: { org_id: org } },
            parseAs: "json",
        });
        const data = (0, env_1.assertOk)(resp);
        return new org_1.Org(this, data);
    }
    /** Get the management client.
     * @return {Client} The client.
     * @internal
     * */
    management() {
        (0, console_1.assert)(__classPrivateFieldGet(this, _CubeSigner_managementClient, "f"), "managementClient must be defined");
        return __classPrivateFieldGet(this, _CubeSigner_managementClient, "f");
    }
}
exports.CubeSigner = CubeSigner;
_CubeSigner_managementToken = new WeakMap(), _CubeSigner_env = new WeakMap(), _CubeSigner_managementClient = new WeakMap();
/** Organizations */
__exportStar(require("./org"), exports);
/** Keys */
__exportStar(require("./key"), exports);
/** Roles */
__exportStar(require("./role"), exports);
/** Env */
__exportStar(require("./env"), exports);
/** Sessions */
__exportStar(require("./signer_session"), exports);
/** Session storage */
__exportStar(require("./session/session_storage"), exports);
/** Session manager */
__exportStar(require("./session/session_manager"), exports);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwrQkFBb0Q7QUFDcEQscUNBQWlDO0FBQ2pDLGtFQUF5QztBQUV6QywrQkFBNEI7QUFHNUIscURBQWlEO0FBWWpELHdCQUF3QjtBQUN4QixNQUFhLFVBQVU7SUFLckIsdUVBQXVFO0lBQ3ZFLElBQUksR0FBRztRQUNMLE9BQU8sdUJBQUEsSUFBSSx1QkFBSyxDQUFDO0lBQ25CLENBQUM7SUFFRDs7O09BR0c7SUFDSCxZQUFZLE9BQTBCO1FBYjdCLDhDQUEwQjtRQUMxQixrQ0FBbUI7UUFDbkIsK0NBQTJCO1FBWWxDLHVCQUFBLElBQUksK0JBQW9CLE9BQU8sQ0FBQyxlQUFlLE1BQUEsQ0FBQztRQUNoRCx1QkFBQSxJQUFJLG1CQUFRLE9BQU8sQ0FBQyxHQUFHLElBQUksU0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFBLENBQUM7UUFFeEMsSUFBSSx1QkFBQSxJQUFJLG1DQUFpQixFQUFFO1lBQ3pCLHVCQUFBLElBQUksZ0NBQXFCLElBQUEsdUJBQVksRUFBUTtnQkFDM0MsT0FBTyxFQUFFLHVCQUFBLElBQUksdUJBQUssQ0FBQyxhQUFhO2dCQUNoQyxPQUFPLEVBQUU7b0JBQ1AsYUFBYSxFQUFFLHVCQUFBLElBQUksbUNBQWlCO2lCQUNyQzthQUNGLENBQUMsTUFBQSxDQUFDO1NBQ0o7SUFDSCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyw0QkFBNEIsQ0FDaEMsT0FBNEM7UUFFNUMsT0FBTyxNQUFNLDhCQUFhLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRUQsb0RBQW9EO0lBQ3BELEtBQUssQ0FBQyxPQUFPO1FBQ1gsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRTtZQUN2RCxPQUFPLEVBQUUsTUFBTTtTQUNoQixDQUFDLENBQUM7UUFDSCxNQUFNLElBQUksR0FBRyxJQUFBLGNBQVEsRUFBQyxJQUFJLENBQUMsQ0FBQztRQUM1QixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRDs7O1NBR0s7SUFDTCxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQVc7UUFDdEIsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFO1lBQzNELE1BQU0sRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsRUFBRTtZQUNqQyxPQUFPLEVBQUUsTUFBTTtTQUNoQixDQUFDLENBQUM7UUFDSCxNQUFNLElBQUksR0FBRyxJQUFBLGNBQVEsRUFBQyxJQUFJLENBQUMsQ0FBQztRQUM1QixPQUFPLElBQUksU0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBRUQ7OztTQUdLO0lBQ0wsVUFBVTtRQUNSLElBQUEsZ0JBQU0sRUFBQyx1QkFBQSxJQUFJLG9DQUFrQixFQUFFLGtDQUFrQyxDQUFDLENBQUM7UUFDbkUsT0FBTyx1QkFBQSxJQUFJLG9DQUFtQixDQUFDO0lBQ2pDLENBQUM7Q0FDRjtBQXJFRCxnQ0FxRUM7O0FBRUQsb0JBQW9CO0FBQ3BCLHdDQUFzQjtBQUN0QixXQUFXO0FBQ1gsd0NBQXNCO0FBQ3RCLFlBQVk7QUFDWix5Q0FBdUI7QUFDdkIsVUFBVTtBQUNWLHdDQUFzQjtBQUN0QixlQUFlO0FBQ2YsbURBQWlDO0FBQ2pDLHNCQUFzQjtBQUN0Qiw0REFBMEM7QUFDMUMsc0JBQXNCO0FBQ3RCLDREQUEwQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGFzc2VydE9rLCBlbnYsIEVudkludGVyZmFjZSB9IGZyb20gXCIuL2VudlwiO1xuaW1wb3J0IHsgYXNzZXJ0IH0gZnJvbSBcImNvbnNvbGVcIjtcbmltcG9ydCBjcmVhdGVDbGllbnQgZnJvbSBcIm9wZW5hcGktZmV0Y2hcIjtcbmltcG9ydCB7IGNvbXBvbmVudHMsIHBhdGhzLCBDbGllbnQgfSBmcm9tIFwiLi9jbGllbnRcIjtcbmltcG9ydCB7IE9yZyB9IGZyb20gXCIuL29yZ1wiO1xuaW1wb3J0IHsgU2Vzc2lvblN0b3JhZ2UgfSBmcm9tIFwiLi9zZXNzaW9uL3Nlc3Npb25fc3RvcmFnZVwiO1xuaW1wb3J0IHsgU2lnbmVyU2Vzc2lvbk9iamVjdCB9IGZyb20gXCIuL3Nlc3Npb24vc2Vzc2lvbl9tYW5hZ2VyXCI7XG5pbXBvcnQgeyBTaWduZXJTZXNzaW9uIH0gZnJvbSBcIi4vc2lnbmVyX3Nlc3Npb25cIjtcblxuLyoqIEN1YmVTaWduZXIgY29uc3RydWN0b3Igb3B0aW9ucyAqL1xuZXhwb3J0IGludGVyZmFjZSBDdWJlU2lnbmVyT3B0aW9ucyB7XG4gIC8qKiBUaGUgbWFuYWdlbWVudCBhdXRob3JpemF0aW9uIHRva2VuICovXG4gIG1hbmFnZW1lbnRUb2tlbj86IHN0cmluZztcbiAgLyoqIFRoZSBlbnZpcm9ubWVudCB0byB1c2UgKi9cbiAgZW52PzogRW52SW50ZXJmYWNlO1xufVxuXG50eXBlIFVzZXJJbmZvID0gY29tcG9uZW50c1tcInNjaGVtYXNcIl1bXCJVc2VySW5mb1wiXTtcblxuLyoqIEN1YmVTaWduZXIgY2xpZW50ICovXG5leHBvcnQgY2xhc3MgQ3ViZVNpZ25lciB7XG4gIHJlYWRvbmx5ICNtYW5hZ2VtZW50VG9rZW4/OiBzdHJpbmc7XG4gIHJlYWRvbmx5ICNlbnY6IEVudkludGVyZmFjZTtcbiAgcmVhZG9ubHkgI21hbmFnZW1lbnRDbGllbnQ/OiBDbGllbnQ7XG5cbiAgLyoqIEByZXR1cm4ge0VudkludGVyZmFjZX0gVGhlIEN1YmVTaWduZXIgZW52aXJvbm1lbnQgb2YgdGhpcyBjbGllbnQgKi9cbiAgZ2V0IGVudigpOiBFbnZJbnRlcmZhY2Uge1xuICAgIHJldHVybiB0aGlzLiNlbnY7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IEN1YmVTaWduZXIgaW5zdGFuY2UuXG4gICAqIEBwYXJhbSB7Q3ViZVNpZ25lck9wdGlvbnN9IG9wdGlvbnMgVGhlIG9wdGlvbnMgZm9yIHRoZSBDdWJlU2lnbmVyIGluc3RhbmNlLlxuICAgKi9cbiAgY29uc3RydWN0b3Iob3B0aW9uczogQ3ViZVNpZ25lck9wdGlvbnMpIHtcbiAgICB0aGlzLiNtYW5hZ2VtZW50VG9rZW4gPSBvcHRpb25zLm1hbmFnZW1lbnRUb2tlbjtcbiAgICB0aGlzLiNlbnYgPSBvcHRpb25zLmVudiA/PyBlbnZbXCJnYW1tYVwiXTtcblxuICAgIGlmICh0aGlzLiNtYW5hZ2VtZW50VG9rZW4pIHtcbiAgICAgIHRoaXMuI21hbmFnZW1lbnRDbGllbnQgPSBjcmVhdGVDbGllbnQ8cGF0aHM+KHtcbiAgICAgICAgYmFzZVVybDogdGhpcy4jZW52LlNpZ25lckFwaVJvb3QsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICBBdXRob3JpemF0aW9uOiB0aGlzLiNtYW5hZ2VtZW50VG9rZW4sXG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTG9hZHMgYSBzaWduZXIgc2Vzc2lvbiBmcm9tIGEgc2Vzc2lvbiBzdG9yYWdlIChlLmcuLCBzZXNzaW9uIGZpbGUpLlxuICAgKiBAcGFyYW0ge1Nlc3Npb25TdG9yYWdlPFNpZ25lclNlc3Npb25PYmplY3Q+fSBzdG9yYWdlIFRoZSBzaWduZXIgc2Vzc2lvbiBzdG9yYWdlXG4gICAqIEByZXR1cm4ge1Byb21pc2U8U2lnbmVyU2Vzc2lvbj59IE5ldyBzaWduZXIgc2Vzc2lvblxuICAgKi9cbiAgYXN5bmMgbG9hZFNpZ25lclNlc3Npb25Gcm9tU3RvcmFnZShcbiAgICBzdG9yYWdlOiBTZXNzaW9uU3RvcmFnZTxTaWduZXJTZXNzaW9uT2JqZWN0PlxuICApOiBQcm9taXNlPFNpZ25lclNlc3Npb24+IHtcbiAgICByZXR1cm4gYXdhaXQgU2lnbmVyU2Vzc2lvbi5sb2FkRnJvbVN0b3JhZ2UodGhpcywgc3RvcmFnZSk7XG4gIH1cblxuICAvKiogUmV0cmlldmVzIGluZm9ybWF0aW9uIGFib3V0IHRoZSBjdXJyZW50IHVzZXIuICovXG4gIGFzeW5jIGFib3V0TWUoKTogUHJvbWlzZTxVc2VySW5mbz4ge1xuICAgIGNvbnN0IHJlc3AgPSBhd2FpdCB0aGlzLm1hbmFnZW1lbnQoKS5nZXQoXCIvdjAvYWJvdXRfbWVcIiwge1xuICAgICAgcGFyc2VBczogXCJqc29uXCIsXG4gICAgfSk7XG4gICAgY29uc3QgZGF0YSA9IGFzc2VydE9rKHJlc3ApO1xuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlcyBpbmZvcm1hdGlvbiBhYm91dCBhbiBvcmdhbml6YXRpb24uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvcmcgVGhlIElEIG9yIG5hbWUgb2YgdGhlIG9yZ2FuaXphdGlvbi5cbiAgICogQHJldHVybiB7T3JnfSBUaGUgb3JnYW5pemF0aW9uLlxuICAgKiAqL1xuICBhc3luYyBnZXRPcmcob3JnOiBzdHJpbmcpOiBQcm9taXNlPE9yZz4ge1xuICAgIGNvbnN0IHJlc3AgPSBhd2FpdCB0aGlzLm1hbmFnZW1lbnQoKS5nZXQoXCIvdjAvb3JnL3tvcmdfaWR9XCIsIHtcbiAgICAgIHBhcmFtczogeyBwYXRoOiB7IG9yZ19pZDogb3JnIH0gfSxcbiAgICAgIHBhcnNlQXM6IFwianNvblwiLFxuICAgIH0pO1xuICAgIGNvbnN0IGRhdGEgPSBhc3NlcnRPayhyZXNwKTtcbiAgICByZXR1cm4gbmV3IE9yZyh0aGlzLCBkYXRhKTtcbiAgfVxuXG4gIC8qKiBHZXQgdGhlIG1hbmFnZW1lbnQgY2xpZW50LlxuICAgKiBAcmV0dXJuIHtDbGllbnR9IFRoZSBjbGllbnQuXG4gICAqIEBpbnRlcm5hbFxuICAgKiAqL1xuICBtYW5hZ2VtZW50KCk6IENsaWVudCB7XG4gICAgYXNzZXJ0KHRoaXMuI21hbmFnZW1lbnRDbGllbnQsIFwibWFuYWdlbWVudENsaWVudCBtdXN0IGJlIGRlZmluZWRcIik7XG4gICAgcmV0dXJuIHRoaXMuI21hbmFnZW1lbnRDbGllbnQhO1xuICB9XG59XG5cbi8qKiBPcmdhbml6YXRpb25zICovXG5leHBvcnQgKiBmcm9tIFwiLi9vcmdcIjtcbi8qKiBLZXlzICovXG5leHBvcnQgKiBmcm9tIFwiLi9rZXlcIjtcbi8qKiBSb2xlcyAqL1xuZXhwb3J0ICogZnJvbSBcIi4vcm9sZVwiO1xuLyoqIEVudiAqL1xuZXhwb3J0ICogZnJvbSBcIi4vZW52XCI7XG4vKiogU2Vzc2lvbnMgKi9cbmV4cG9ydCAqIGZyb20gXCIuL3NpZ25lcl9zZXNzaW9uXCI7XG4vKiogU2Vzc2lvbiBzdG9yYWdlICovXG5leHBvcnQgKiBmcm9tIFwiLi9zZXNzaW9uL3Nlc3Npb25fc3RvcmFnZVwiO1xuLyoqIFNlc3Npb24gbWFuYWdlciAqL1xuZXhwb3J0ICogZnJvbSBcIi4vc2Vzc2lvbi9zZXNzaW9uX21hbmFnZXJcIjtcbiJdfQ==