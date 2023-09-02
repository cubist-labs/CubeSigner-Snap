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
var _Role_cs, _Role_orgId;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = exports.OperationKind = exports.DepositContract = void 0;
const _1 = require(".");
const env_1 = require("./env");
/** The kind of deposit contracts. */
var DepositContract;
(function (DepositContract) {
    /** Canonical deposit contract */
    DepositContract[DepositContract["Canonical"] = 0] = "Canonical";
    /** Wrapper deposit contract */
    DepositContract[DepositContract["Wrapper"] = 1] = "Wrapper";
})(DepositContract || (exports.DepositContract = DepositContract = {}));
/** All different kinds of sensitive operations. */
var OperationKind;
(function (OperationKind) {
    OperationKind["BlobSign"] = "BlobSign";
    OperationKind["Eth1Sign"] = "Eth1Sign";
    OperationKind["Eth2Sign"] = "Eth2Sign";
    OperationKind["Eth2Stake"] = "Eth2Stake";
    OperationKind["Eth2Unstake"] = "Eth2Unstake";
    OperationKind["SolanaSign"] = "SolanaSign";
})(OperationKind || (exports.OperationKind = OperationKind = {}));
/** Roles. */
class Role {
    /** Delete the role. */
    async delete() {
        await Role.deleteRole(__classPrivateFieldGet(this, _Role_cs, "f"), __classPrivateFieldGet(this, _Role_orgId, "f"), this.id);
    }
    /** Is the role enabled? */
    async enabled() {
        const data = await this.fetch();
        return data.enabled;
    }
    /** Enable the role. */
    async enable() {
        await this.update({ enabled: true });
    }
    /** Disable the role. */
    async disable() {
        await this.update({ enabled: false });
    }
    /** The list of users with access to the role.
     * @example [
     *   "User#c3b9379c-4e8c-4216-bd0a-65ace53cf98f",
     *   "User#5593c25b-52e2-4fb5-b39b-96d41d681d82"
     * ]
     * */
    async users() {
        const data = await this.fetch();
        return data.users;
    }
    /** Add a user to the role.
     * Adds an existing user to an existing role.
     * @param {string} userId The user-id of the user to add to the role.
     * */
    async addUser(userId) {
        const resp = await __classPrivateFieldGet(this, _Role_cs, "f")
            .management()
            .put("/v0/org/{org_id}/roles/{role_id}/add_user/{user_id}", {
            params: { path: { org_id: __classPrivateFieldGet(this, _Role_orgId, "f"), role_id: this.id, user_id: userId } },
            parseAs: "json",
        });
        (0, env_1.assertOk)(resp, "Failed to add user to role");
    }
    /** The list of keys in the role.
     * @example [
     *    {
     *     id: "Key#bfe3eccb-731e-430d-b1e5-ac1363e6b06b",
     *     policy: { TxReceiver: "0x8c594691c0e592ffa21f153a16ae41db5befcaaa" }
     *    },
     *  ]
     * */
    async keys() {
        const data = await this.fetch();
        return data.keys.map((k) => ({
            id: k.key_id,
            ...(k.policy && { policy: k.policy }),
        }));
    }
    /** Add keys to the role.
     * Adds a list of existing keys to an existing role.
     * @param {Key[]} keys The list of keys to add to the role.
     * @param {KeyPolicy?} policy The optional policy to apply to each key.
     * */
    async addKeys(keys, policy) {
        const resp = await __classPrivateFieldGet(this, _Role_cs, "f").management().put("/v0/org/{org_id}/roles/{role_id}/add_keys", {
            params: { path: { org_id: __classPrivateFieldGet(this, _Role_orgId, "f"), role_id: this.id } },
            body: {
                key_ids: keys.map((k) => k.id),
                policy: (policy ?? null),
            },
            parseAs: "json",
        });
        (0, env_1.assertOk)(resp, "Failed to add keys to role");
    }
    /** Add a key to the role.
     * Adds an existing key to an existing role.
     * @param {Key} key The key to add to the role.
     * @param {KeyPolicy?} policy The optional policy to apply to the key.
     * */
    async addKey(key, policy) {
        return await this.addKeys([key], policy);
    }
    /** Remove key from the role.
     * Removes an existing key from an existing role.
     * @param {Key} key The key to remove from the role.
     * */
    async removeKey(key) {
        const resp = await __classPrivateFieldGet(this, _Role_cs, "f").management().del("/v0/org/{org_id}/roles/{role_id}/keys/{key_id}", {
            params: { path: { org_id: __classPrivateFieldGet(this, _Role_orgId, "f"), role_id: this.id, key_id: key.id } },
            parseAs: "json",
        });
        (0, env_1.assertOk)(resp, "Failed to remove key from role");
    }
    /**
     * Create a new session for this role.
     * @param {SessionStorage<SignerSessionObject>} storage The session storage to use
     * @param {string} purpose Descriptive purpose.
     * @param {SignerSessionLifetime} ttl Optional session lifetimes.
     * @return {Promise<SignerSession>} New signer session.
     */
    async createSession(storage, purpose, ttl) {
        return await _1.SignerSession.create(__classPrivateFieldGet(this, _Role_cs, "f"), storage, __classPrivateFieldGet(this, _Role_orgId, "f"), this.id, purpose, ttl);
    }
    /**
     * List all signer sessions for this role. Returned objects can be used to
     * revoke individual sessions, but they cannot be used for authentication.
     * @return {Promise<SignerSessionInfo[]>} Signer sessions for this role.
     */
    async sessions() {
        const resp = await __classPrivateFieldGet(this, _Role_cs, "f").management().get("/v0/org/{org_id}/roles/{role_id}/tokens", {
            params: { path: { org_id: __classPrivateFieldGet(this, _Role_orgId, "f"), role_id: this.id } },
        });
        const data = (0, env_1.assertOk)(resp);
        return data.tokens.map((t) => new _1.SignerSessionInfo(__classPrivateFieldGet(this, _Role_cs, "f"), __classPrivateFieldGet(this, _Role_orgId, "f"), this.id, t.hash, t.purpose));
    }
    /**
     * Get a pending MFA request by its id.
     * @param {string} mfaId The id of the MFA request.
     * @return {Promise<MfaRequestInfo>} The MFA request.
     */
    async mfaGet(mfaId) {
        const resp = await __classPrivateFieldGet(this, _Role_cs, "f").management().get("/v0/org/{org_id}/roles/{role_id}/mfa/{mfa_id}", {
            params: { path: { org_id: __classPrivateFieldGet(this, _Role_orgId, "f"), role_id: this.id, mfa_id: mfaId } },
        });
        return (0, env_1.assertOk)(resp);
    }
    /**
     * Approve a pending MFA request.
     *
     * @param {string} mfaId The id of the MFA request.
     * @return {Promise<MfaRequestInfo>} The MFA request.
     */
    async mfaApprove(mfaId) {
        return Role.mfaApprove(__classPrivateFieldGet(this, _Role_cs, "f"), __classPrivateFieldGet(this, _Role_orgId, "f"), this.id, mfaId);
    }
    // --------------------------------------------------------------------------
    // -- INTERNAL --------------------------------------------------------------
    // --------------------------------------------------------------------------
    /** Create a new role.
     * @param {CubeSigner} cs The CubeSigner instance to use for signing.
     * @param {string} orgId The id of the organization to which the role belongs.
     * @param {RoleInfo} data The JSON response from the API server.
     * @internal
     * */
    constructor(cs, orgId, data) {
        _Role_cs.set(this, void 0);
        _Role_orgId.set(this, void 0);
        __classPrivateFieldSet(this, _Role_cs, cs, "f");
        __classPrivateFieldSet(this, _Role_orgId, orgId, "f");
        this.id = data.role_id;
        this.name = data.name ?? undefined;
    }
    /**
     * Approve a pending MFA request.
     *
     * @param {CubeSigner} cs The CubeSigner instance to use for requests
     * @param {string} orgId The org id of the MFA request
     * @param {string} roleId The role id of the MFA request
     * @param {string} mfaId The id of the MFA request
     * @return {Promise<MfaRequestInfo>} The result of the MFA request
     */
    static async mfaApprove(cs, orgId, roleId, mfaId) {
        const resp = await cs.management().patch("/v0/org/{org_id}/roles/{role_id}/mfa/{mfa_id}", {
            params: { path: { org_id: orgId, role_id: roleId, mfa_id: mfaId } },
        });
        return (0, env_1.assertOk)(resp);
    }
    /** Update the role.
     * @param {UpdateRoleRequest} request The JSON request to send to the API server.
     * */
    async update(request) {
        const resp = await __classPrivateFieldGet(this, _Role_cs, "f").management().patch("/v0/org/{org_id}/roles/{role_id}", {
            params: { path: { org_id: __classPrivateFieldGet(this, _Role_orgId, "f"), role_id: this.id } },
            body: request,
            parseAs: "json",
        });
        (0, env_1.assertOk)(resp);
    }
    /** Create new role.
     * @param {CubeSigner} cs The CubeSigner instance to use for signing.
     * @param {string} orgId The id of the organization to which the role belongs.
     * @param {string?} name The optional name of the role.
     * @return {Role} The new role.
     * @internal
     * */
    static async createRole(cs, orgId, name) {
        const resp = await cs.management().post("/v0/org/{org_id}/roles", {
            params: { path: { org_id: orgId } },
            body: name ? { name } : undefined,
            parseAs: "json",
        });
        const data = (0, env_1.assertOk)(resp);
        return await Role.getRole(cs, orgId, data.role_id);
    }
    /** Get a role by id.
     * @param {CubeSigner} cs The CubeSigner instance to use for signing.
     * @param {string} orgId The id of the organization to which the role belongs.
     * @param {string} roleId The id of the role to get.
     * @return {Role} The role.
     * @internal
     * */
    static async getRole(cs, orgId, roleId) {
        const resp = await cs.management().get("/v0/org/{org_id}/roles/{role_id}", {
            params: { path: { org_id: orgId, role_id: roleId } },
            parseAs: "json",
        });
        const data = (0, env_1.assertOk)(resp);
        return new Role(cs, orgId, data);
    }
    /** Fetches the role information.
     * @return {RoleInfo} The role information.
     * @internal
     * */
    async fetch() {
        const resp = await __classPrivateFieldGet(this, _Role_cs, "f").management().get("/v0/org/{org_id}/roles/{role_id}", {
            params: { path: { org_id: __classPrivateFieldGet(this, _Role_orgId, "f"), role_id: this.id } },
            parseAs: "json",
        });
        const data = (0, env_1.assertOk)(resp);
        return data;
    }
    /** Delete role.
     * @param {CubeSigner} cs The CubeSigner instance to use for signing.
     * @param {string} orgId The id of the organization to which the role belongs.
     * @param {string} roleId The id of the role to delete.
     * @internal
     * */
    static async deleteRole(cs, orgId, roleId) {
        const resp = await cs.management().del("/v0/org/{org_id}/roles/{role_id}", {
            params: { path: { org_id: orgId, role_id: roleId } },
            parseAs: "json",
        });
        (0, env_1.assertOk)(resp);
    }
}
exports.Role = Role;
_Role_cs = new WeakMap(), _Role_orgId = new WeakMap();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9sZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yb2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHdCQVNXO0FBRVgsK0JBQWlDO0FBV2pDLHFDQUFxQztBQUNyQyxJQUFZLGVBS1g7QUFMRCxXQUFZLGVBQWU7SUFDekIsaUNBQWlDO0lBQ2pDLCtEQUFTLENBQUE7SUFDVCwrQkFBK0I7SUFDL0IsMkRBQU8sQ0FBQTtBQUNULENBQUMsRUFMVyxlQUFlLCtCQUFmLGVBQWUsUUFLMUI7QUFrQkQsbURBQW1EO0FBQ25ELElBQVksYUFPWDtBQVBELFdBQVksYUFBYTtJQUN2QixzQ0FBcUIsQ0FBQTtJQUNyQixzQ0FBcUIsQ0FBQTtJQUNyQixzQ0FBcUIsQ0FBQTtJQUNyQix3Q0FBdUIsQ0FBQTtJQUN2Qiw0Q0FBMkIsQ0FBQTtJQUMzQiwwQ0FBeUIsQ0FBQTtBQUMzQixDQUFDLEVBUFcsYUFBYSw2QkFBYixhQUFhLFFBT3hCO0FBZ0VELGFBQWE7QUFDYixNQUFhLElBQUk7SUFZZix1QkFBdUI7SUFDdkIsS0FBSyxDQUFDLE1BQU07UUFDVixNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsdUJBQUEsSUFBSSxnQkFBSSxFQUFFLHVCQUFBLElBQUksbUJBQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUVELDJCQUEyQjtJQUMzQixLQUFLLENBQUMsT0FBTztRQUNYLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2hDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN0QixDQUFDO0lBRUQsdUJBQXVCO0lBQ3ZCLEtBQUssQ0FBQyxNQUFNO1FBQ1YsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELHdCQUF3QjtJQUN4QixLQUFLLENBQUMs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LEVBQUUsTUFBTTtTQUNoQixDQUFDLENBQUM7UUFDSCxJQUFBLGNBQVEsRUFBQyxJQUFJLENBQUMsQ0FBQztJQUNqQixDQUFDO0NBQ0Y7QUFqUkQsb0JBaVJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ3ViZVNpZ25lcixcbiAgS2V5LFxuICBNZmFSZXF1ZXN0SW5mbyxcbiAgU2Vzc2lvblN0b3JhZ2UsXG4gIFNpZ25lclNlc3Npb24sXG4gIFNpZ25lclNlc3Npb25JbmZvLFxuICBTaWduZXJTZXNzaW9uTGlmZXRpbWUsXG4gIFNpZ25lclNlc3Npb25PYmplY3QsXG59IGZyb20gXCIuXCI7XG5pbXBvcnQgeyBjb21wb25lbnRzLCBwYXRocyB9IGZyb20gXCIuL2NsaWVudFwiO1xuaW1wb3J0IHsgYXNzZXJ0T2sgfSBmcm9tIFwiLi9lbnZcIjtcblxudHlwZSBVcGRhdGVSb2xlUmVxdWVzdCA9XG4gIHBhdGhzW1wiL3YwL29yZy97b3JnX2lkfS9rZXlzL3trZXlfaWR9XCJdW1wicGF0Y2hcIl1bXCJyZXF1ZXN0Qm9keVwiXVtcImNvbnRlbnRcIl1bXCJhcHBsaWNhdGlvbi9qc29uXCJdO1xuZXhwb3J0IHR5cGUgUm9sZUluZm8gPSBjb21wb25lbnRzW1wic2NoZW1hc1wiXVtcIlJvbGVJbmZvXCJdO1xuXG4vKiogUmVzdHJpY3QgdHJhbnNhY3Rpb24gcmVjZWl2ZXIuXG4gKiBAZXhhbXBsZSB7IFR4UmVjZWl2ZXI6IFwiMHg4YzU5NDY5MWMwZTU5MmZmYTIxZjE1M2ExNmFlNDFkYjViZWZjYWFhXCIgfVxuICogKi9cbmV4cG9ydCB0eXBlIFR4UmVjZWl2ZXIgPSB7IFR4UmVjZWl2ZXI6IHN0cmluZyB9O1xuXG4vKiogVGhlIGtpbmQgb2YgZGVwb3NpdCBjb250cmFjdHMuICovXG5leHBvcnQgZW51bSBEZXBvc2l0Q29udHJhY3Qge1xuICAvKiogQ2Fub25pY2FsIGRlcG9zaXQgY29udHJhY3QgKi9cbiAgQ2Fub25pY2FsLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gIC8qKiBXcmFwcGVyIGRlcG9zaXQgY29udHJhY3QgKi9cbiAgV3JhcHBlciwgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xufVxuXG4vKiogUmVzdHJpY3QgdHJhbnNhY3Rpb25zIHRvIGNhbGxzIHRvIGRlcG9zaXQgY29udHJhY3QuICovXG5leHBvcnQgdHlwZSBUeERlcG9zaXQgPSBUeERlcG9zaXRCYXNlIHwgVHhEZXBvc2l0UHVia2V5IHwgVHhEZXBvc2l0Um9sZTtcblxuLyoqIFJlc3RyaWN0IHRyYW5zYWN0aW9ucyB0byBjYWxscyB0byBkZXBvc2l0IGNvbnRyYWN0Ki9cbmV4cG9ydCB0eXBlIFR4RGVwb3NpdEJhc2UgPSB7IFR4RGVwb3NpdDogeyBraW5kOiBEZXBvc2l0Q29udHJhY3QgfSB9O1xuXG4vKiogUmVzdHJpY3QgdHJhbnNhY3Rpb25zIHRvIGNhbGxzIHRvIGRlcG9zaXQgY29udHJhY3Qgd2l0aCBmaXhlZCB2YWxpZGF0b3IgKHB1YmtleSk6XG4gKiAgQGV4YW1wbGUgeyBUeERlcG9zaXQ6IHsga2luZDogRGVzcG9zaXRDb250cmFjdC5DYW5vbmljYWwsIHZhbGlkYXRvcjogeyBwdWJrZXk6IFwiODg3OS4uLjhcIn0gfX1cbiAqICovXG5leHBvcnQgdHlwZSBUeERlcG9zaXRQdWJrZXkgPSB7IFR4RGVwb3NpdDogeyBraW5kOiBEZXBvc2l0Q29udHJhY3Q7IHB1YmtleTogc3RyaW5nIH0gfTtcblxuLyoqIFJlc3RyaWN0IHRyYW5zYWN0aW9ucyB0byBjYWxscyB0byBkZXBvc2l0IGNvbnRyYWN0IHdpdGggYW55IHZhbGlkYXRvciBrZXkgaW4gYSByb2xlOlxuICogQGV4YW1wbGUgeyBUeERlcG9zaXQ6IHsga2luZDogRGVzcG9zaXRDb250cmFjdC5DYW5vbmljYWwsIHZhbGlkYXRvcjogeyByb2xlX2lkOiBcIlJvbGUjYzYzLi4uYWZcIn0gfX1cbiAqICovXG5leHBvcnQgdHlwZSBUeERlcG9zaXRSb2xlID0geyBUeERlcG9zaXQ6IHsga2luZDogRGVwb3NpdENvbnRyYWN0OyByb2xlX2lkOiBzdHJpbmcgfSB9O1xuXG4vKiogQWxsIGRpZmZlcmVudCBraW5kcyBvZiBzZW5zaXRpdmUgb3BlcmF0aW9ucy4gKi9cbmV4cG9ydCBlbnVtIE9wZXJhdGlvbktpbmQge1xuICBCbG9iU2lnbiA9IFwiQmxvYlNpZ25cIiwgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICBFdGgxU2lnbiA9IFwiRXRoMVNpZ25cIiwgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICBFdGgyU2lnbiA9IFwiRXRoMlNpZ25cIiwgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICBFdGgyU3Rha2UgPSBcIkV0aDJTdGFrZVwiLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gIEV0aDJVbnN0YWtlID0gXCJFdGgyVW5zdGFrZVwiLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gIFNvbGFuYVNpZ24gPSBcIlNvbGFuYVNpZ25cIiwgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xufVxuXG4vKiogUmVxdWlyZSBNRkEgZm9yIHRyYW5zYWN0aW9ucy5cbiAqIEBleGFtcGxlIHtcbiAqICAgICBSZXF1aXJlTWZhOiB7XG4gKiAgICAgICBraW5kOiB7XG4gKiAgICAgICAgIFJlcXVpcmVkQXBwcm92ZXJzOiB7XG4gKiAgICAgICAgICAgY291bnQ6IDFcbiAqICAgICAgICAgfVxuICogICAgICAgfSxcbiAqICAgICAgIHJlc3RyaWN0ZWRfb3BlcmF0aW9uczogW1xuICogICAgICAgICBcIkV0aDFTaWduXCIsXG4gKiAgICAgICAgIFwiQmxvYlNpZ25cIlxuICogICAgICAgXVxuICogICAgIH1cbiAqICAgfVxuICogKi9cbmV4cG9ydCB0eXBlIFJlcXVpcmVNZmEgPSB7XG4gIFJlcXVpcmVNZmE6IHtcbiAgICBraW5kOiB7XG4gICAgICBSZXF1aXJlZEFwcHJvdmVyczoge1xuICAgICAgICBjb3VudD86IG51bWJlcjtcbiAgICAgIH07XG4gICAgfTtcbiAgICByZXN0cmljdGVkX29wZXJhdGlvbnM/OiBPcGVyYXRpb25LaW5kW107XG4gIH07XG59O1xuXG4vKiogQWxsb3cgcmF3IGJsb2Igc2lnbmluZyAqL1xuZXhwb3J0IHR5cGUgQWxsb3dSYXdCbG9iU2lnbmluZyA9IFwiQWxsb3dSYXdCbG9iU2lnbmluZ1wiO1xuXG4vKiogS2V5IHBvbGljeVxuICogQGV4YW1wbGUgW1xuICogICB7XG4gKiAgICAgXCJUeFJlY2VpdmVyXCI6IFwiMHg4YzU5NDY5MWMwZTU5MmZmYTIxZjE1M2ExNmFlNDFkYjViZWZjYWFhXCJcbiAqICAgfSxcbiAqICAge1xuICogICAgIFwiVHhEZXBvc2l0XCI6IHtcbiAqICAgICAgIFwia2luZFwiOiBcIkNhbm9uaWNhbFwiXG4gKiAgICAgfVxuICogICB9LFxuICogICB7XG4gKiAgICAgXCJSZXF1aXJlTWZhXCI6IHtcbiAqICAgICAgIFwia2luZFwiOiB7XG4gKiAgICAgICAgIFwiUmVxdWlyZWRBcHByb3ZlcnNcIjoge1xuICogICAgICAgICAgIFwiY291bnRcIjogMVxuICogICAgICAgICB9XG4gKiAgICAgICB9LFxuICogICAgICAgXCJyZXN0cmljdGVkX29wZXJhdGlvbnNcIjogW1xuICogICAgICAgICBcIkV0aDFTaWduXCIsXG4gKiAgICAgICAgIFwiQmxvYlNpZ25cIlxuICogICAgICAgXVxuICogICAgIH1cbiAqICAgfVxuICogXVxuICogKi9cbmV4cG9ydCB0eXBlIEtleVBvbGljeSA9IChUeFJlY2VpdmVyIHwgVHhEZXBvc2l0IHwgUmVxdWlyZU1mYSB8IEFsbG93UmF3QmxvYlNpZ25pbmcpW107XG5cbi8qKiBBIGtleSBndWFyZGVkIGJ5IGEgcG9saWN5LiAqL1xuZXhwb3J0IGludGVyZmFjZSBHdWFyZGVkS2V5IHtcbiAgaWQ6IHN0cmluZztcbiAgcG9saWN5PzogS2V5UG9saWN5O1xufVxuXG4vKiogUm9sZXMuICovXG5leHBvcnQgY2xhc3MgUm9sZSB7XG4gIHJlYWRvbmx5ICNjczogQ3ViZVNpZ25lcjtcbiAgcmVhZG9ubHkgI29yZ0lkOiBzdHJpbmc7XG4gIC8qKiBIdW1hbi1yZWFkYWJsZSBuYW1lIGZvciB0aGUgcm9sZSAqL1xuICBwdWJsaWMgcmVhZG9ubHkgbmFtZT86IHN0cmluZztcblxuICAvKipcbiAgICogVGhlIElEIG9mIHRoZSByb2xlLlxuICAgKiBAZXhhbXBsZSBSb2xlI2JmZTNlY2NiLTczMWUtNDMwZC1iMWU1LWFjMTM2M2U2YjA2YlxuICAgKiAqL1xuICByZWFkb25seSBpZDogc3RyaW5nO1xuXG4gIC8qKiBEZWxldGUgdGhlIHJvbGUuICovXG4gIGFzeW5jIGRlbGV0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCBSb2xlLmRlbGV0ZVJvbGUodGhpcy4jY3MsIHRoaXMuI29yZ0lkLCB0aGlzLmlkKTtcbiAgfVxuXG4gIC8qKiBJcyB0aGUgcm9sZSBlbmFibGVkPyAqL1xuICBhc3luYyBlbmFibGVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmZldGNoKCk7XG4gICAgcmV0dXJuIGRhdGEuZW5hYmxlZDtcbiAgfVxuXG4gIC8qKiBFbmFibGUgdGhlIHJvbGUuICovXG4gIGFzeW5jIGVuYWJsZSgpIHtcbiAgICBhd2FpdCB0aGlzLnVwZGF0ZSh7IGVuYWJsZWQ6IHRydWUgfSk7XG4gIH1cblxuICAvKiogRGlzYWJsZSB0aGUgcm9sZS4gKi9cbiAgYXN5bmMgZGlzYWJsZSgpIHtcbiAgICBhd2FpdCB0aGlzLnVwZGF0ZSh7IGVuYWJsZWQ6IGZhbHNlIH0pO1xuICB9XG5cbiAgLyoqIFRoZSBsaXN0IG9mIHVzZXJzIHdpdGggYWNjZXNzIHRvIHRoZSByb2xlLlxuICAgKiBAZXhhbXBsZSBbXG4gICAqICAgXCJVc2VyI2MzYjkzNzljLTRlOGMtNDIxNi1iZDBhLTY1YWNlNTNjZjk4ZlwiLFxuICAgKiAgIFwiVXNlciM1NTkzYzI1Yi01MmUyLTRmYjUtYjM5Yi05NmQ0MWQ2ODFkODJcIlxuICAgKiBdXG4gICAqICovXG4gIGFzeW5jIHVzZXJzKCk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5mZXRjaCgpO1xuICAgIHJldHVybiBkYXRhLnVzZXJzO1xuICB9XG5cbiAgLyoqIEFkZCBhIHVzZXIgdG8gdGhlIHJvbGUuXG4gICAqIEFkZHMgYW4gZXhpc3RpbmcgdXNlciB0byBhbiBleGlzdGluZyByb2xlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdXNlcklkIFRoZSB1c2VyLWlkIG9mIHRoZSB1c2VyIHRvIGFkZCB0byB0aGUgcm9sZS5cbiAgICogKi9cbiAgYXN5bmMgYWRkVXNlcih1c2VySWQ6IHN0cmluZykge1xuICAgIGNvbnN0IHJlc3AgPSBhd2FpdCB0aGlzLiNjc1xuICAgICAgLm1hbmFnZW1lbnQoKVxuICAgICAgLnB1dChcIi92MC9vcmcve29yZ19pZH0vcm9sZXMve3JvbGVfaWR9L2FkZF91c2VyL3t1c2VyX2lkfVwiLCB7XG4gICAgICAgIHBhcmFtczogeyBwYXRoOiB7IG9yZ19pZDogdGhpcy4jb3JnSWQsIHJvbGVfaWQ6IHRoaXMuaWQsIHVzZXJfaWQ6IHVzZXJJZCB9IH0sXG4gICAgICAgIHBhcnNlQXM6IFwianNvblwiLFxuICAgICAgfSk7XG4gICAgYXNzZXJ0T2socmVzcCwgXCJGYWlsZWQgdG8gYWRkIHVzZXIgdG8gcm9sZVwiKTtcbiAgfVxuXG4gIC8qKiBUaGUgbGlzdCBvZiBrZXlzIGluIHRoZSByb2xlLlxuICAgKiBAZXhhbXBsZSBbXG4gICAqICAgIHtcbiAgICogICAgIGlkOiBcIktleSNiZmUzZWNjYi03MzFlLTQzMGQtYjFlNS1hYzEzNjNlNmIwNmJcIixcbiAgICogICAgIHBvbGljeTogeyBUeFJlY2VpdmVyOiBcIjB4OGM1OTQ2OTFjMGU1OTJmZmEyMWYxNTNhMTZhZTQxZGI1YmVmY2FhYVwiIH1cbiAgICogICAgfSxcbiAgICogIF1cbiAgICogKi9cbiAgYXN5bmMga2V5cygpOiBQcm9taXNlPEd1YXJkZWRLZXlbXT4ge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmZldGNoKCk7XG4gICAgcmV0dXJuIGRhdGEua2V5cy5tYXAoKGspID0+ICh7XG4gICAgICBpZDogay5rZXlfaWQsXG4gICAgICAuLi4oay5wb2xpY3kgJiYgeyBwb2xpY3k6IGsucG9saWN5IGFzIHVua25vd24gYXMgS2V5UG9saWN5IH0pLFxuICAgIH0pKTtcbiAgfVxuXG4gIC8qKiBBZGQga2V5cyB0byB0aGUgcm9sZS5cbiAgICogQWRkcyBhIGxpc3Qgb2YgZXhpc3Rpbmcga2V5cyB0byBhbiBleGlzdGluZyByb2xlLlxuICAgKiBAcGFyYW0ge0tleVtdfSBrZXlzIFRoZSBsaXN0IG9mIGtleXMgdG8gYWRkIHRvIHRoZSByb2xlLlxuICAgKiBAcGFyYW0ge0tleVBvbGljeT99IHBvbGljeSBUaGUgb3B0aW9uYWwgcG9saWN5IHRvIGFwcGx5IHRvIGVhY2gga2V5LlxuICAgKiAqL1xuICBhc3luYyBhZGRLZXlzKGtleXM6IEtleVtdLCBwb2xpY3k/OiBLZXlQb2xpY3kpIHtcbiAgICBjb25zdCByZXNwID0gYXdhaXQgdGhpcy4jY3MubWFuYWdlbWVudCgpLnB1dChcIi92MC9vcmcve29yZ19pZH0vcm9sZXMve3JvbGVfaWR9L2FkZF9rZXlzXCIsIHtcbiAgICAgIHBhcmFtczogeyBwYXRoOiB7IG9yZ19pZDogdGhpcy4jb3JnSWQsIHJvbGVfaWQ6IHRoaXMuaWQgfSB9LFxuICAgICAgYm9keToge1xuICAgICAgICBrZXlfaWRzOiBrZXlzLm1hcCgoaykgPT4gay5pZCksXG4gICAgICAgIHBvbGljeTogKHBvbGljeSA/PyBudWxsKSBhcyBSZWNvcmQ8c3RyaW5nLCBuZXZlcj5bXSB8IG51bGwsXG4gICAgICB9LFxuICAgICAgcGFyc2VBczogXCJqc29uXCIsXG4gICAgfSk7XG4gICAgYXNzZXJ0T2socmVzcCwgXCJGYWlsZWQgdG8gYWRkIGtleXMgdG8gcm9sZVwiKTtcbiAgfVxuXG4gIC8qKiBBZGQgYSBrZXkgdG8gdGhlIHJvbGUuXG4gICAqIEFkZHMgYW4gZXhpc3Rpbmcga2V5IHRvIGFuIGV4aXN0aW5nIHJvbGUuXG4gICAqIEBwYXJhbSB7S2V5fSBrZXkgVGhlIGtleSB0byBhZGQgdG8gdGhlIHJvbGUuXG4gICAqIEBwYXJhbSB7S2V5UG9saWN5P30gcG9saWN5IFRoZSBvcHRpb25hbCBwb2xpY3kgdG8gYXBwbHkgdG8gdGhlIGtleS5cbiAgICogKi9cbiAgYXN5bmMgYWRkS2V5KGtleTogS2V5LCBwb2xpY3k/OiBLZXlQb2xpY3kpIHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5hZGRLZXlzKFtrZXldLCBwb2xpY3kpO1xuICB9XG5cbiAgLyoqIFJlbW92ZSBrZXkgZnJvbSB0aGUgcm9sZS5cbiAgICogUmVtb3ZlcyBhbiBleGlzdGluZyBrZXkgZnJvbSBhbiBleGlzdGluZyByb2xlLlxuICAgKiBAcGFyYW0ge0tleX0ga2V5IFRoZSBrZXkgdG8gcmVtb3ZlIGZyb20gdGhlIHJvbGUuXG4gICAqICovXG4gIGFzeW5jIHJlbW92ZUtleShrZXk6IEtleSkge1xuICAgIGNvbnN0IHJlc3AgPSBhd2FpdCB0aGlzLiNjcy5tYW5hZ2VtZW50KCkuZGVsKFwiL3YwL29yZy97b3JnX2lkfS9yb2xlcy97cm9sZV9pZH0va2V5cy97a2V5X2lkfVwiLCB7XG4gICAgICBwYXJhbXM6IHsgcGF0aDogeyBvcmdfaWQ6IHRoaXMuI29yZ0lkLCByb2xlX2lkOiB0aGlzLmlkLCBrZXlfaWQ6IGtleS5pZCB9IH0sXG4gICAgICBwYXJzZUFzOiBcImpzb25cIixcbiAgICB9KTtcbiAgICBhc3NlcnRPayhyZXNwLCBcIkZhaWxlZCB0byByZW1vdmUga2V5IGZyb20gcm9sZVwiKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgc2Vzc2lvbiBmb3IgdGhpcyByb2xlLlxuICAgKiBAcGFyYW0ge1Nlc3Npb25TdG9yYWdlPFNpZ25lclNlc3Npb25PYmplY3Q+fSBzdG9yYWdlIFRoZSBzZXNzaW9uIHN0b3JhZ2UgdG8gdXNlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwdXJwb3NlIERlc2NyaXB0aXZlIHB1cnBvc2UuXG4gICAqIEBwYXJhbSB7U2lnbmVyU2Vzc2lvbkxpZmV0aW1lfSB0dGwgT3B0aW9uYWwgc2Vzc2lvbiBsaWZldGltZXMuXG4gICAqIEByZXR1cm4ge1Byb21pc2U8U2lnbmVyU2Vzc2lvbj59IE5ldyBzaWduZXIgc2Vzc2lvbi5cbiAgICovXG4gIGFzeW5jIGNyZWF0ZVNlc3Npb24oXG4gICAgc3RvcmFnZTogU2Vzc2lvblN0b3JhZ2U8U2lnbmVyU2Vzc2lvbk9iamVjdD4sXG4gICAgcHVycG9zZTogc3RyaW5nLFxuICAgIHR0bD86IFNpZ25lclNlc3Npb25MaWZldGltZVxuICApOiBQcm9taXNlPFNpZ25lclNlc3Npb24+IHtcbiAgICByZXR1cm4gYXdhaXQgU2lnbmVyU2Vzc2lvbi5jcmVhdGUodGhpcy4jY3MsIHN0b3JhZ2UsIHRoaXMuI29yZ0lkLCB0aGlzLmlkLCBwdXJwb3NlLCB0dGwpO1xuICB9XG5cbiAgLyoqXG4gICAqIExpc3QgYWxsIHNpZ25lciBzZXNzaW9ucyBmb3IgdGhpcyByb2xlLiBSZXR1cm5lZCBvYmplY3RzIGNhbiBiZSB1c2VkIHRvXG4gICAqIHJldm9rZSBpbmRpdmlkdWFsIHNlc3Npb25zLCBidXQgdGhleSBjYW5ub3QgYmUgdXNlZCBmb3IgYXV0aGVudGljYXRpb24uXG4gICAqIEByZXR1cm4ge1Byb21pc2U8U2lnbmVyU2Vzc2lvbkluZm9bXT59IFNpZ25lciBzZXNzaW9ucyBmb3IgdGhpcyByb2xlLlxuICAgKi9cbiAgYXN5bmMgc2Vzc2lvbnMoKTogUHJvbWlzZTxTaWduZXJTZXNzaW9uSW5mb1tdPiB7XG4gICAgY29uc3QgcmVzcCA9IGF3YWl0IHRoaXMuI2NzLm1hbmFnZW1lbnQoKS5nZXQoXCIvdjAvb3JnL3tvcmdfaWR9L3JvbGVzL3tyb2xlX2lkfS90b2tlbnNcIiwge1xuICAgICAgcGFyYW1zOiB7IHBhdGg6IHsgb3JnX2lkOiB0aGlzLiNvcmdJZCwgcm9sZV9pZDogdGhpcy5pZCB9IH0sXG4gICAgfSk7XG4gICAgY29uc3QgZGF0YSA9IGFzc2VydE9rKHJlc3ApO1xuICAgIHJldHVybiBkYXRhLnRva2Vucy5tYXAoXG4gICAgICAodCkgPT4gbmV3IFNpZ25lclNlc3Npb25JbmZvKHRoaXMuI2NzLCB0aGlzLiNvcmdJZCwgdGhpcy5pZCwgdC5oYXNoLCB0LnB1cnBvc2UpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBwZW5kaW5nIE1GQSByZXF1ZXN0IGJ5IGl0cyBpZC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG1mYUlkIFRoZSBpZCBvZiB0aGUgTUZBIHJlcXVlc3QuXG4gICAqIEByZXR1cm4ge1Byb21pc2U8TWZhUmVxdWVzdEluZm8+fSBUaGUgTUZBIHJlcXVlc3QuXG4gICAqL1xuICBhc3luYyBtZmFHZXQobWZhSWQ6IHN0cmluZyk6IFByb21pc2U8TWZhUmVxdWVzdEluZm8+IHtcbiAgICBjb25zdCByZXNwID0gYXdhaXQgdGhpcy4jY3MubWFuYWdlbWVudCgpLmdldChcIi92MC9vcmcve29yZ19pZH0vcm9sZXMve3JvbGVfaWR9L21mYS97bWZhX2lkfVwiLCB7XG4gICAgICBwYXJhbXM6IHsgcGF0aDogeyBvcmdfaWQ6IHRoaXMuI29yZ0lkLCByb2xlX2lkOiB0aGlzLmlkLCBtZmFfaWQ6IG1mYUlkIH0gfSxcbiAgICB9KTtcbiAgICByZXR1cm4gYXNzZXJ0T2socmVzcCk7XG4gIH1cblxuICAvKipcbiAgICogQXBwcm92ZSBhIHBlbmRpbmcgTUZBIHJlcXVlc3QuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtZmFJZCBUaGUgaWQgb2YgdGhlIE1GQSByZXF1ZXN0LlxuICAgKiBAcmV0dXJuIHtQcm9taXNlPE1mYVJlcXVlc3RJbmZvPn0gVGhlIE1GQSByZXF1ZXN0LlxuICAgKi9cbiAgYXN5bmMgbWZhQXBwcm92ZShtZmFJZDogc3RyaW5nKTogUHJvbWlzZTxNZmFSZXF1ZXN0SW5mbz4ge1xuICAgIHJldHVybiBSb2xlLm1mYUFwcHJvdmUodGhpcy4jY3MsIHRoaXMuI29yZ0lkLCB0aGlzLmlkLCBtZmFJZCk7XG4gIH1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAtLSBJTlRFUk5BTCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8qKiBDcmVhdGUgYSBuZXcgcm9sZS5cbiAgICogQHBhcmFtIHtDdWJlU2lnbmVyfSBjcyBUaGUgQ3ViZVNpZ25lciBpbnN0YW5jZSB0byB1c2UgZm9yIHNpZ25pbmcuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvcmdJZCBUaGUgaWQgb2YgdGhlIG9yZ2FuaXphdGlvbiB0byB3aGljaCB0aGUgcm9sZSBiZWxvbmdzLlxuICAgKiBAcGFyYW0ge1JvbGVJbmZvfSBkYXRhIFRoZSBKU09OIHJlc3BvbnNlIGZyb20gdGhlIEFQSSBzZXJ2ZXIuXG4gICAqIEBpbnRlcm5hbFxuICAgKiAqL1xuICBjb25zdHJ1Y3RvcihjczogQ3ViZVNpZ25lciwgb3JnSWQ6IHN0cmluZywgZGF0YTogUm9sZUluZm8pIHtcbiAgICB0aGlzLiNjcyA9IGNzO1xuICAgIHRoaXMuI29yZ0lkID0gb3JnSWQ7XG4gICAgdGhpcy5pZCA9IGRhdGEucm9sZV9pZDtcbiAgICB0aGlzLm5hbWUgPSBkYXRhLm5hbWUgPz8gdW5kZWZpbmVkO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcHJvdmUgYSBwZW5kaW5nIE1GQSByZXF1ZXN0LlxuICAgKlxuICAgKiBAcGFyYW0ge0N1YmVTaWduZXJ9IGNzIFRoZSBDdWJlU2lnbmVyIGluc3RhbmNlIHRvIHVzZSBmb3IgcmVxdWVzdHNcbiAgICogQHBhcmFtIHtzdHJpbmd9IG9yZ0lkIFRoZSBvcmcgaWQgb2YgdGhlIE1GQSByZXF1ZXN0XG4gICAqIEBwYXJhbSB7c3RyaW5nfSByb2xlSWQgVGhlIHJvbGUgaWQgb2YgdGhlIE1GQSByZXF1ZXN0XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtZmFJZCBUaGUgaWQgb2YgdGhlIE1GQSByZXF1ZXN0XG4gICAqIEByZXR1cm4ge1Byb21pc2U8TWZhUmVxdWVzdEluZm8+fSBUaGUgcmVzdWx0IG9mIHRoZSBNRkEgcmVxdWVzdFxuICAgKi9cbiAgc3RhdGljIGFzeW5jIG1mYUFwcHJvdmUoXG4gICAgY3M6IEN1YmVTaWduZXIsXG4gICAgb3JnSWQ6IHN0cmluZyxcbiAgICByb2xlSWQ6IHN0cmluZyxcbiAgICBtZmFJZDogc3RyaW5nXG4gICk6IFByb21pc2U8TWZhUmVxdWVzdEluZm8+IHtcbiAgICBjb25zdCByZXNwID0gYXdhaXQgY3MubWFuYWdlbWVudCgpLnBhdGNoKFwiL3YwL29yZy97b3JnX2lkfS9yb2xlcy97cm9sZV9pZH0vbWZhL3ttZmFfaWR9XCIsIHtcbiAgICAgIHBhcmFtczogeyBwYXRoOiB7IG9yZ19pZDogb3JnSWQsIHJvbGVfaWQ6IHJvbGVJZCwgbWZhX2lkOiBtZmFJZCB9IH0sXG4gICAgfSk7XG4gICAgcmV0dXJuIGFzc2VydE9rKHJlc3ApO1xuICB9XG5cbiAgLyoqIFVwZGF0ZSB0aGUgcm9sZS5cbiAgICogQHBhcmFtIHtVcGRhdGVSb2xlUmVxdWVzdH0gcmVxdWVzdCBUaGUgSlNPTiByZXF1ZXN0IHRvIHNlbmQgdG8gdGhlIEFQSSBzZXJ2ZXIuXG4gICAqICovXG4gIHByaXZhdGUgYXN5bmMgdXBkYXRlKHJlcXVlc3Q6IFVwZGF0ZVJvbGVSZXF1ZXN0KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcmVzcCA9IGF3YWl0IHRoaXMuI2NzLm1hbmFnZW1lbnQoKS5wYXRjaChcIi92MC9vcmcve29yZ19pZH0vcm9sZXMve3JvbGVfaWR9XCIsIHtcbiAgICAgIHBhcmFtczogeyBwYXRoOiB7IG9yZ19pZDogdGhpcy4jb3JnSWQsIHJvbGVfaWQ6IHRoaXMuaWQgfSB9LFxuICAgICAgYm9keTogcmVxdWVzdCxcbiAgICAgIHBhcnNlQXM6IFwianNvblwiLFxuICAgIH0pO1xuICAgIGFzc2VydE9rKHJlc3ApO1xuICB9XG5cbiAgLyoqIENyZWF0ZSBuZXcgcm9sZS5cbiAgICogQHBhcmFtIHtDdWJlU2lnbmVyfSBjcyBUaGUgQ3ViZVNpZ25lciBpbnN0YW5jZSB0byB1c2UgZm9yIHNpZ25pbmcuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvcmdJZCBUaGUgaWQgb2YgdGhlIG9yZ2FuaXphdGlvbiB0byB3aGljaCB0aGUgcm9sZSBiZWxvbmdzLlxuICAgKiBAcGFyYW0ge3N0cmluZz99IG5hbWUgVGhlIG9wdGlvbmFsIG5hbWUgb2YgdGhlIHJvbGUuXG4gICAqIEByZXR1cm4ge1JvbGV9IFRoZSBuZXcgcm9sZS5cbiAgICogQGludGVybmFsXG4gICAqICovXG4gIHN0YXRpYyBhc3luYyBjcmVhdGVSb2xlKGNzOiBDdWJlU2lnbmVyLCBvcmdJZDogc3RyaW5nLCBuYW1lPzogc3RyaW5nKTogUHJvbWlzZTxSb2xlPiB7XG4gICAgY29uc3QgcmVzcCA9IGF3YWl0IGNzLm1hbmFnZW1lbnQoKS5wb3N0KFwiL3YwL29yZy97b3JnX2lkfS9yb2xlc1wiLCB7XG4gICAgICBwYXJhbXM6IHsgcGF0aDogeyBvcmdfaWQ6IG9yZ0lkIH0gfSxcbiAgICAgIGJvZHk6IG5hbWUgPyB7IG5hbWUgfSA6IHVuZGVmaW5lZCxcbiAgICAgIHBhcnNlQXM6IFwianNvblwiLFxuICAgIH0pO1xuICAgIGNvbnN0IGRhdGEgPSBhc3NlcnRPayhyZXNwKTtcbiAgICByZXR1cm4gYXdhaXQgUm9sZS5nZXRSb2xlKGNzLCBvcmdJZCwgZGF0YS5yb2xlX2lkKTtcbiAgfVxuXG4gIC8qKiBHZXQgYSByb2xlIGJ5IGlkLlxuICAgKiBAcGFyYW0ge0N1YmVTaWduZXJ9IGNzIFRoZSBDdWJlU2lnbmVyIGluc3RhbmNlIHRvIHVzZSBmb3Igc2lnbmluZy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG9yZ0lkIFRoZSBpZCBvZiB0aGUgb3JnYW5pemF0aW9uIHRvIHdoaWNoIHRoZSByb2xlIGJlbG9uZ3MuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByb2xlSWQgVGhlIGlkIG9mIHRoZSByb2xlIHRvIGdldC5cbiAgICogQHJldHVybiB7Um9sZX0gVGhlIHJvbGUuXG4gICAqIEBpbnRlcm5hbFxuICAgKiAqL1xuICBzdGF0aWMgYXN5bmMgZ2V0Um9sZShjczogQ3ViZVNpZ25lciwgb3JnSWQ6IHN0cmluZywgcm9sZUlkOiBzdHJpbmcpOiBQcm9taXNlPFJvbGU+IHtcbiAgICBjb25zdCByZXNwID0gYXdhaXQgY3MubWFuYWdlbWVudCgpLmdldChcIi92MC9vcmcve29yZ19pZH0vcm9sZXMve3JvbGVfaWR9XCIsIHtcbiAgICAgIHBhcmFtczogeyBwYXRoOiB7IG9yZ19pZDogb3JnSWQsIHJvbGVfaWQ6IHJvbGVJZCB9IH0sXG4gICAgICBwYXJzZUFzOiBcImpzb25cIixcbiAgICB9KTtcbiAgICBjb25zdCBkYXRhID0gYXNzZXJ0T2socmVzcCk7XG4gICAgcmV0dXJuIG5ldyBSb2xlKGNzLCBvcmdJZCwgZGF0YSk7XG4gIH1cblxuICAvKiogRmV0Y2hlcyB0aGUgcm9sZSBpbmZvcm1hdGlvbi5cbiAgICogQHJldHVybiB7Um9sZUluZm99IFRoZSByb2xlIGluZm9ybWF0aW9uLlxuICAgKiBAaW50ZXJuYWxcbiAgICogKi9cbiAgcHJpdmF0ZSBhc3luYyBmZXRjaCgpOiBQcm9taXNlPFJvbGVJbmZvPiB7XG4gICAgY29uc3QgcmVzcCA9IGF3YWl0IHRoaXMuI2NzLm1hbmFnZW1lbnQoKS5nZXQoXCIvdjAvb3JnL3tvcmdfaWR9L3JvbGVzL3tyb2xlX2lkfVwiLCB7XG4gICAgICBwYXJhbXM6IHsgcGF0aDogeyBvcmdfaWQ6IHRoaXMuI29yZ0lkLCByb2xlX2lkOiB0aGlzLmlkIH0gfSxcbiAgICAgIHBhcnNlQXM6IFwianNvblwiLFxuICAgIH0pO1xuICAgIGNvbnN0IGRhdGEgPSBhc3NlcnRPayhyZXNwKTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIC8qKiBEZWxldGUgcm9sZS5cbiAgICogQHBhcmFtIHtDdWJlU2lnbmVyfSBjcyBUaGUgQ3ViZVNpZ25lciBpbnN0YW5jZSB0byB1c2UgZm9yIHNpZ25pbmcuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvcmdJZCBUaGUgaWQgb2YgdGhlIG9yZ2FuaXphdGlvbiB0byB3aGljaCB0aGUgcm9sZSBiZWxvbmdzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcm9sZUlkIFRoZSBpZCBvZiB0aGUgcm9sZSB0byBkZWxldGUuXG4gICAqIEBpbnRlcm5hbFxuICAgKiAqL1xuICBwcml2YXRlIHN0YXRpYyBhc3luYyBkZWxldGVSb2xlKGNzOiBDdWJlU2lnbmVyLCBvcmdJZDogc3RyaW5nLCByb2xlSWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBjcy5tYW5hZ2VtZW50KCkuZGVsKFwiL3YwL29yZy97b3JnX2lkfS9yb2xlcy97cm9sZV9pZH1cIiwge1xuICAgICAgcGFyYW1zOiB7IHBhdGg6IHsgb3JnX2lkOiBvcmdJZCwgcm9sZV9pZDogcm9sZUlkIH0gfSxcbiAgICAgIHBhcnNlQXM6IFwianNvblwiLFxuICAgIH0pO1xuICAgIGFzc2VydE9rKHJlc3ApO1xuICB9XG59XG4iXX0=