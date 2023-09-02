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
var _Org_cs, _Org_id;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Org = void 0;
const env_1 = require("./env");
const key_1 = require("./key");
const role_1 = require("./role");
/** An organization. */
class Org {
    /**
     * @description The org id
     * @example Org#c3b9379c-4e8c-4216-bd0a-65ace53cf98f
     * */
    get id() {
        return __classPrivateFieldGet(this, _Org_id, "f");
    }
    /** Human-readable name for the org */
    async name() {
        const data = await this.fetch();
        return data.name ?? undefined;
    }
    /** Set the human-readable name for the org.
     * @param {string} name The new human-readable name for the org (must be alphanumeric).
     * @example my_org_name
     * */
    async setName(name) {
        if (!/^[a-zA-Z0-9_]{3,30}$/.test(name)) {
            throw new Error("Org name must be alphanumeric and between 3 and 30 characters");
        }
        await this.update({ name });
    }
    /** Is the org enabled? */
    async enabled() {
        const data = await this.fetch();
        return data.enabled;
    }
    /** Enable the org. */
    async enable() {
        await this.update({ enabled: true });
    }
    /** Disable the org. */
    async disable() {
        await this.update({ enabled: false });
    }
    /** Get the policy for the org. */
    async policy() {
        const data = await this.fetch();
        return (data.policy ?? []);
    }
    /** Set the policy for the org.
     * @param {OrgPolicy[]} policy The new policy for the org.
     * */
    async setPolicy(policy) {
        const p = policy;
        await this.update({ policy: p });
    }
    /** Create a new signing key.
     * @param {KeyType} type The type of key to create.
     * @return {Key[]} The new keys.
     * */
    async createKey(type) {
        return (await key_1.Key.createKeys(__classPrivateFieldGet(this, _Org_cs, "f"), this.id, type, 1))[0];
    }
    /** Create new signing keys.
     * @param {KeyType} type The type of key to create.
     * @param {nummber?} count The number of keys to create. Defaults to 1.
     * @return {Key[]} The new keys.
     * */
    async createKeys(type, count = 1) {
        return key_1.Key.createKeys(__classPrivateFieldGet(this, _Org_cs, "f"), this.id, type, count);
    }
    /** Get a key by id.
     * @param {string} keyId The id of the key to get.
     * @return {Key} The key.
     * */
    async getKey(keyId) {
        return await key_1.Key.getKey(__classPrivateFieldGet(this, _Org_cs, "f"), this.id, keyId);
    }
    /** Get all keys.
     * @param {KeyType?} type Optional key type to filter list for.
     * @return {Key} The key.
     * */
    async listKeys(type) {
        return key_1.Key.listKeys(__classPrivateFieldGet(this, _Org_cs, "f"), this.id, type);
    }
    /** Create a new role.
     * @param {string?} name The name of the role.
     * @return {Role} The new role.
     * */
    async createRole(name) {
        return role_1.Role.createRole(__classPrivateFieldGet(this, _Org_cs, "f"), this.id, name);
    }
    /** Get a role by id or name.
     * @param {string} roleId The id or name of the role to get.
     * @return {Role} The role.
     * */
    async getRole(roleId) {
        return role_1.Role.getRole(__classPrivateFieldGet(this, _Org_cs, "f"), this.id, roleId);
    }
    /** List all roles.
     * @return {Role[]} The roles.
     * */
    async listRoles() {
        return Org.listRoles(__classPrivateFieldGet(this, _Org_cs, "f"), this.id);
    }
    // --------------------------------------------------------------------------
    // -- INTERNAL --------------------------------------------------------------
    // --------------------------------------------------------------------------
    /** Create a new org.
     * @param {CubeSigner} cs The CubeSigner instance.
     * @param {OrgInfo} data The JSON response from the API server.
     * @internal
     * */
    constructor(cs, data) {
        _Org_cs.set(this, void 0);
        /**
         * The ID of the organization.
         * @example Org#124dfe3e-3bbd-487d-80c0-53c55e8ab87a
         */
        _Org_id.set(this, void 0);
        __classPrivateFieldSet(this, _Org_cs, cs, "f");
        __classPrivateFieldSet(this, _Org_id, data.org_id, "f");
    }
    /** Fetch org info.
     * @return {OrgInfo} The org info.
     * */
    async fetch() {
        const resp = await __classPrivateFieldGet(this, _Org_cs, "f").management().get("/v0/org/{org_id}", {
            params: { path: { org_id: this.id } },
            parseAs: "json",
        });
        const data = (0, env_1.assertOk)(resp);
        return data;
    }
    /** Update the org.
     * @param {UpdateOrgRequest} request The JSON request to send to the API server.
     * @return {UpdateOrgResponse} The JSON response from the API server.
     * */
    async update(request) {
        const resp = await __classPrivateFieldGet(this, _Org_cs, "f").management().patch("/v0/org/{org_id}", {
            params: { path: { org_id: this.id } },
            body: request,
            parseAs: "json",
        });
        return (0, env_1.assertOk)(resp);
    }
    /** List roles.
     * @param {CubeSigner} cs The CubeSigner instance to use for signing.
     * @param {string} orgId The id of the organization to which the role belongs.
     * @return {Role} The role.
     * @internal
     * */
    static async listRoles(cs, orgId) {
        const resp = await cs.management().get("/v0/org/{org_id}/roles", {
            params: { path: { org_id: orgId } },
            parseAs: "json",
        });
        const data = (0, env_1.assertOk)(resp);
        return data.roles.map((r) => new role_1.Role(cs, orgId, r));
    }
}
exports.Org = Org;
_Org_cs = new WeakMap(), _Org_id = new WeakMap();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL29yZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFFQSwrQkFBaUM7QUFDakMsK0JBQXFDO0FBQ3JDLGlDQUF3QztBQXNDeEMsdUJBQXVCO0FBQ3ZCLE1BQWEsR0FBRztJQVFkOzs7U0FHSztJQUNMLElBQUksRUFBRTtRQUNKLE9BQU8sdUJBQUEsSUFBSSxlQUFJLENBQUM7SUFDbEIsQ0FBQztJQUVELHNDQUFzQztJQUN0QyxLQUFLLENBQUMsSUFBSTtRQUNSLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2hDLE9BQU8sSUFBSSxDQUFDLElBQUksSUFBSSxTQUFTLENBQUM7SUFDaEMsQ0FBQztJQUVEOzs7U0FHSztJQUNMLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBWTtRQUN4QixJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3RDLE1BQU0sSUFBSSxLQUFLLENBQUMsK0RBQStELENBQUMsQ0FBQztTQUNsRjtRQUNELE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVELDBCQUEwQjtJQUMxQixLQUFLLENBQUMsT0FBTztRQUNYLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2hDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN0QixDQUFDO0lBRUQsc0JBQXNCO0lBQ3RCLEtBQUssQ0FBQyxNQUFNO1FBQ1YsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELHVCQUF1QjtJQUN2QixLQUFLLENBQUMsT0FBTztRQUNYLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLE9B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QUM7UUFDSCxNQUFNLElBQUksR0FBRyxJQUFBLGNBQVEsRUFBQyxJQUFJLENBQUMsQ0FBQztRQUM1QixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRDs7O1NBR0s7SUFDRyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQXlCO1FBQzVDLE1BQU0sSUFBSSxHQUFHLE1BQU0sdUJBQUEsSUFBSSxlQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFO1lBQ2pFLE1BQU0sRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUU7WUFDckMsSUFBSSxFQUFFLE9BQU87WUFDYixPQUFPLEVBQUUsTUFBTTtTQUNoQixDQUFDLENBQUM7UUFDSCxPQUFPLElBQUEsY0FBUSxFQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFRDs7Ozs7U0FLSztJQUNHLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEVBQWMsRUFBRSxLQUFhO1FBQzFELE1BQU0sSUFBSSxHQUFHLE1BQU0sRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRTtZQUMvRCxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDbkMsT0FBTyxFQUFFLE1BQU07U0FDaEIsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxJQUFJLEdBQUcsSUFBQSxjQUFRLEVBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQVcsRUFBRSxFQUFFLENBQUMsSUFBSSxXQUFJLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7Q0FDRjtBQTVLRCxrQkE0S0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDdWJlU2lnbmVyIH0gZnJvbSBcIi5cIjtcbmltcG9ydCB7IGNvbXBvbmVudHMsIHBhdGhzIH0gZnJvbSBcIi4vY2xpZW50XCI7XG5pbXBvcnQgeyBhc3NlcnRPayB9IGZyb20gXCIuL2VudlwiO1xuaW1wb3J0IHsgS2V5VHlwZSwgS2V5IH0gZnJvbSBcIi4va2V5XCI7XG5pbXBvcnQgeyBSb2xlLCBSb2xlSW5mbyB9IGZyb20gXCIuL3JvbGVcIjtcblxuLyoqIE9yZ2FuaXphdGlvbiBpZCAqL1xuZXhwb3J0IHR5cGUgT3JnSWQgPSBzdHJpbmc7XG5cbi8qKiBPcmctd2lkZSBwb2xpY3kgKi9cbmV4cG9ydCB0eXBlIE9yZ1BvbGljeSA9IFNvdXJjZUlwQWxsb3dsaXN0UG9saWN5IHwgT3JpZ2luQWxsb3dsaXN0UG9saWN5IHwgTWF4RGFpbHlVbnN0YWtlUG9saWN5O1xuXG4vKipcbiAqIE9ubHkgYWxsb3cgcmVxdWVzdHMgZnJvbSB0aGUgc3BlY2lmaWVkIG9yaWdpbnMuXG4gKiBAZXhhbXBsZSB7XCJPcmlnaW5BbGxvd2xpc3RcIjogXCIqXCJ9XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgT3JpZ2luQWxsb3dsaXN0UG9saWN5IHtcbiAgT3JpZ2luQWxsb3dsaXN0OiBzdHJpbmdbXSB8IFwiKlwiO1xufVxuXG4vKipcbiAqIFJlc3RyaWN0IHNpZ25pbmcgdG8gc3BlY2lmaWMgc291cmNlIElQIGFkZHJlc3Nlcy5cbiAqIEBleGFtcGxlIHtcIlNvdXJjZUlwQWxsb3dsaXN0XCI6IFtcIjEwLjEuMi4zLzhcIiwgXCIxNjkuMjU0LjE3LjEvMTZcIl19XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU291cmNlSXBBbGxvd2xpc3RQb2xpY3kge1xuICBTb3VyY2VJcEFsbG93bGlzdDogc3RyaW5nW107XG59XG5cbi8qKlxuICogUmVzdHJpY3QgdGhlIG51bWJlciBvZiB1bnN0YWtlcyBwZXIgZGF5LlxuICogQGV4YW1wbGUge1wiTWF4RGFpbHlVbnN0YWtlXCI6IDUgfVxuICovXG5leHBvcnQgaW50ZXJmYWNlIE1heERhaWx5VW5zdGFrZVBvbGljeSB7XG4gIE1heERhaWx5VW5zdGFrZTogbnVtYmVyO1xufVxuXG50eXBlIE9yZ0luZm8gPSBjb21wb25lbnRzW1wic2NoZW1hc1wiXVtcIk9yZ0luZm9cIl07XG50eXBlIFVwZGF0ZU9yZ1JlcXVlc3QgPVxuICBwYXRoc1tcIi92MC9vcmcve29yZ19pZH1cIl1bXCJwYXRjaFwiXVtcInJlcXVlc3RCb2R5XCJdW1wiY29udGVudFwiXVtcImFwcGxpY2F0aW9uL2pzb25cIl07XG50eXBlIFVwZGF0ZU9yZ1Jlc3BvbnNlID1cbiAgcGF0aHNbXCIvdjAvb3JnL3tvcmdfaWR9XCJdW1wicGF0Y2hcIl1bXCJyZXNwb25zZXNcIl1bXCIyMDBcIl1bXCJjb250ZW50XCJdW1wiYXBwbGljYXRpb24vanNvblwiXTtcblxuLyoqIEFuIG9yZ2FuaXphdGlvbi4gKi9cbmV4cG9ydCBjbGFzcyBPcmcge1xuICByZWFkb25seSAjY3M6IEN1YmVTaWduZXI7XG4gIC8qKlxuICAgKiBUaGUgSUQgb2YgdGhlIG9yZ2FuaXphdGlvbi5cbiAgICogQGV4YW1wbGUgT3JnIzEyNGRmZTNlLTNiYmQtNDg3ZC04MGMwLTUzYzU1ZThhYjg3YVxuICAgKi9cbiAgcmVhZG9ubHkgI2lkOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBUaGUgb3JnIGlkXG4gICAqIEBleGFtcGxlIE9yZyNjM2I5Mzc5Yy00ZThjLTQyMTYtYmQwYS02NWFjZTUzY2Y5OGZcbiAgICogKi9cbiAgZ2V0IGlkKCk6IE9yZ0lkIHtcbiAgICByZXR1cm4gdGhpcy4jaWQ7XG4gIH1cblxuICAvKiogSHVtYW4tcmVhZGFibGUgbmFtZSBmb3IgdGhlIG9yZyAqL1xuICBhc3luYyBuYW1lKCk6IFByb21pc2U8c3RyaW5nIHwgdW5kZWZpbmVkPiB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuZmV0Y2goKTtcbiAgICByZXR1cm4gZGF0YS5uYW1lID8/IHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qKiBTZXQgdGhlIGh1bWFuLXJlYWRhYmxlIG5hbWUgZm9yIHRoZSBvcmcuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFRoZSBuZXcgaHVtYW4tcmVhZGFibGUgbmFtZSBmb3IgdGhlIG9yZyAobXVzdCBiZSBhbHBoYW51bWVyaWMpLlxuICAgKiBAZXhhbXBsZSBteV9vcmdfbmFtZVxuICAgKiAqL1xuICBhc3luYyBzZXROYW1lKG5hbWU6IHN0cmluZykge1xuICAgIGlmICghL15bYS16QS1aMC05X117MywzMH0kLy50ZXN0KG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJPcmcgbmFtZSBtdXN0IGJlIGFscGhhbnVtZXJpYyBhbmQgYmV0d2VlbiAzIGFuZCAzMCBjaGFyYWN0ZXJzXCIpO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLnVwZGF0ZSh7IG5hbWUgfSk7XG4gIH1cblxuICAvKiogSXMgdGhlIG9yZyBlbmFibGVkPyAqL1xuICBhc3luYyBlbmFibGVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmZldGNoKCk7XG4gICAgcmV0dXJuIGRhdGEuZW5hYmxlZDtcbiAgfVxuXG4gIC8qKiBFbmFibGUgdGhlIG9yZy4gKi9cbiAgYXN5bmMgZW5hYmxlKCkge1xuICAgIGF3YWl0IHRoaXMudXBkYXRlKHsgZW5hYmxlZDogdHJ1ZSB9KTtcbiAgfVxuXG4gIC8qKiBEaXNhYmxlIHRoZSBvcmcuICovXG4gIGFzeW5jIGRpc2FibGUoKSB7XG4gICAgYXdhaXQgdGhpcy51cGRhdGUoeyBlbmFibGVkOiBmYWxzZSB9KTtcbiAgfVxuXG4gIC8qKiBHZXQgdGhlIHBvbGljeSBmb3IgdGhlIG9yZy4gKi9cbiAgYXN5bmMgcG9saWN5KCk6IFByb21pc2U8T3JnUG9saWN5W10+IHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5mZXRjaCgpO1xuICAgIHJldHVybiAoZGF0YS5wb2xpY3kgPz8gW10pIGFzIHVua25vd24gYXMgT3JnUG9saWN5W107XG4gIH1cblxuICAvKiogU2V0IHRoZSBwb2xpY3kgZm9yIHRoZSBvcmcuXG4gICAqIEBwYXJhbSB7T3JnUG9saWN5W119IHBvbGljeSBUaGUgbmV3IHBvbGljeSBmb3IgdGhlIG9yZy5cbiAgICogKi9cbiAgYXN5bmMgc2V0UG9saWN5KHBvbGljeTogT3JnUG9saWN5W10pIHtcbiAgICBjb25zdCBwID0gcG9saWN5IGFzIHVua25vd24gYXMgUmVjb3JkPHN0cmluZywgbmV2ZXI+W107XG4gICAgYXdhaXQgdGhpcy51cGRhdGUoeyBwb2xpY3k6IHAgfSk7XG4gIH1cblxuICAvKiogQ3JlYXRlIGEgbmV3IHNpZ25pbmcga2V5LlxuICAgKiBAcGFyYW0ge0tleVR5cGV9IHR5cGUgVGhlIHR5cGUgb2Yga2V5IHRvIGNyZWF0ZS5cbiAgICogQHJldHVybiB7S2V5W119IFRoZSBuZXcga2V5cy5cbiAgICogKi9cbiAgYXN5bmMgY3JlYXRlS2V5KHR5cGU6IEtleVR5cGUpOiBQcm9taXNlPEtleT4ge1xuICAgIHJldHVybiAoYXdhaXQgS2V5LmNyZWF0ZUtleXModGhpcy4jY3MsIHRoaXMuaWQsIHR5cGUsIDEpKVswXTtcbiAgfVxuXG4gIC8qKiBDcmVhdGUgbmV3IHNpZ25pbmcga2V5cy5cbiAgICogQHBhcmFtIHtLZXlUeXBlfSB0eXBlIFRoZSB0eXBlIG9mIGtleSB0byBjcmVhdGUuXG4gICAqIEBwYXJhbSB7bnVtbWJlcj99IGNvdW50IFRoZSBudW1iZXIgb2Yga2V5cyB0byBjcmVhdGUuIERlZmF1bHRzIHRvIDEuXG4gICAqIEByZXR1cm4ge0tleVtdfSBUaGUgbmV3IGtleXMuXG4gICAqICovXG4gIGFzeW5jIGNyZWF0ZUtleXModHlwZTogS2V5VHlwZSwgY291bnQgPSAxKTogUHJvbWlzZTxLZXlbXT4ge1xuICAgIHJldHVybiBLZXkuY3JlYXRlS2V5cyh0aGlzLiNjcywgdGhpcy5pZCwgdHlwZSwgY291bnQpO1xuICB9XG5cbiAgLyoqIEdldCBhIGtleSBieSBpZC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGtleUlkIFRoZSBpZCBvZiB0aGUga2V5IHRvIGdldC5cbiAgICogQHJldHVybiB7S2V5fSBUaGUga2V5LlxuICAgKiAqL1xuICBhc3luYyBnZXRLZXkoa2V5SWQ6IHN0cmluZyk6IFByb21pc2U8S2V5PiB7XG4gICAgcmV0dXJuIGF3YWl0IEtleS5nZXRLZXkodGhpcy4jY3MsIHRoaXMuaWQsIGtleUlkKTtcbiAgfVxuXG4gIC8qKiBHZXQgYWxsIGtleXMuXG4gICAqIEBwYXJhbSB7S2V5VHlwZT99IHR5cGUgT3B0aW9uYWwga2V5IHR5cGUgdG8gZmlsdGVyIGxpc3QgZm9yLlxuICAgKiBAcmV0dXJuIHtLZXl9IFRoZSBrZXkuXG4gICAqICovXG4gIGFzeW5jIGxpc3RLZXlzKHR5cGU/OiBLZXlUeXBlKTogUHJvbWlzZTxLZXlbXT4ge1xuICAgIHJldHVybiBLZXkubGlzdEtleXModGhpcy4jY3MsIHRoaXMuaWQsIHR5cGUpO1xuICB9XG5cbiAgLyoqIENyZWF0ZSBhIG5ldyByb2xlLlxuICAgKiBAcGFyYW0ge3N0cmluZz99IG5hbWUgVGhlIG5hbWUgb2YgdGhlIHJvbGUuXG4gICAqIEByZXR1cm4ge1JvbGV9IFRoZSBuZXcgcm9sZS5cbiAgICogKi9cbiAgYXN5bmMgY3JlYXRlUm9sZShuYW1lPzogc3RyaW5nKTogUHJvbWlzZTxSb2xlPiB7XG4gICAgcmV0dXJuIFJvbGUuY3JlYXRlUm9sZSh0aGlzLiNjcywgdGhpcy5pZCwgbmFtZSk7XG4gIH1cblxuICAvKiogR2V0IGEgcm9sZSBieSBpZCBvciBuYW1lLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcm9sZUlkIFRoZSBpZCBvciBuYW1lIG9mIHRoZSByb2xlIHRvIGdldC5cbiAgICogQHJldHVybiB7Um9sZX0gVGhlIHJvbGUuXG4gICAqICovXG4gIGFzeW5jIGdldFJvbGUocm9sZUlkOiBzdHJpbmcpOiBQcm9taXNlPFJvbGU+IHtcbiAgICByZXR1cm4gUm9sZS5nZXRSb2xlKHRoaXMuI2NzLCB0aGlzLmlkLCByb2xlSWQpO1xuICB9XG5cbiAgLyoqIExpc3QgYWxsIHJvbGVzLlxuICAgKiBAcmV0dXJuIHtSb2xlW119IFRoZSByb2xlcy5cbiAgICogKi9cbiAgYXN5bmMgbGlzdFJvbGVzKCk6IFByb21pc2U8Um9sZVtdPiB7XG4gICAgcmV0dXJuIE9yZy5saXN0Um9sZXModGhpcy4jY3MsIHRoaXMuaWQpO1xuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gLS0gSU5URVJOQUwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvKiogQ3JlYXRlIGEgbmV3IG9yZy5cbiAgICogQHBhcmFtIHtDdWJlU2lnbmVyfSBjcyBUaGUgQ3ViZVNpZ25lciBpbnN0YW5jZS5cbiAgICogQHBhcmFtIHtPcmdJbmZvfSBkYXRhIFRoZSBKU09OIHJlc3BvbnNlIGZyb20gdGhlIEFQSSBzZXJ2ZXIuXG4gICAqIEBpbnRlcm5hbFxuICAgKiAqL1xuICBjb25zdHJ1Y3RvcihjczogQ3ViZVNpZ25lciwgZGF0YTogT3JnSW5mbykge1xuICAgIHRoaXMuI2NzID0gY3M7XG4gICAgdGhpcy4jaWQgPSBkYXRhLm9yZ19pZDtcbiAgfVxuXG4gIC8qKiBGZXRjaCBvcmcgaW5mby5cbiAgICogQHJldHVybiB7T3JnSW5mb30gVGhlIG9yZyBpbmZvLlxuICAgKiAqL1xuICBwcml2YXRlIGFzeW5jIGZldGNoKCk6IFByb21pc2U8T3JnSW5mbz4ge1xuICAgIGNvbnN0IHJlc3AgPSBhd2FpdCB0aGlzLiNjcy5tYW5hZ2VtZW50KCkuZ2V0KFwiL3YwL29yZy97b3JnX2lkfVwiLCB7XG4gICAgICBwYXJhbXM6IHsgcGF0aDogeyBvcmdfaWQ6IHRoaXMuaWQgfSB9LFxuICAgICAgcGFyc2VBczogXCJqc29uXCIsXG4gICAgfSk7XG4gICAgY29uc3QgZGF0YSA9IGFzc2VydE9rKHJlc3ApO1xuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgLyoqIFVwZGF0ZSB0aGUgb3JnLlxuICAgKiBAcGFyYW0ge1VwZGF0ZU9yZ1JlcXVlc3R9IHJlcXVlc3QgVGhlIEpTT04gcmVxdWVzdCB0byBzZW5kIHRvIHRoZSBBUEkgc2VydmVyLlxuICAgKiBAcmV0dXJuIHtVcGRhdGVPcmdSZXNwb25zZX0gVGhlIEpTT04gcmVzcG9uc2UgZnJvbSB0aGUgQVBJIHNlcnZlci5cbiAgICogKi9cbiAgcHJpdmF0ZSBhc3luYyB1cGRhdGUocmVxdWVzdDogVXBkYXRlT3JnUmVxdWVzdCk6IFByb21pc2U8VXBkYXRlT3JnUmVzcG9uc2U+IHtcbiAgICBjb25zdCByZXNwID0gYXdhaXQgdGhpcy4jY3MubWFuYWdlbWVudCgpLnBhdGNoKFwiL3YwL29yZy97b3JnX2lkfVwiLCB7XG4gICAgICBwYXJhbXM6IHsgcGF0aDogeyBvcmdfaWQ6IHRoaXMuaWQgfSB9LFxuICAgICAgYm9keTogcmVxdWVzdCxcbiAgICAgIHBhcnNlQXM6IFwianNvblwiLFxuICAgIH0pO1xuICAgIHJldHVybiBhc3NlcnRPayhyZXNwKTtcbiAgfVxuXG4gIC8qKiBMaXN0IHJvbGVzLlxuICAgKiBAcGFyYW0ge0N1YmVTaWduZXJ9IGNzIFRoZSBDdWJlU2lnbmVyIGluc3RhbmNlIHRvIHVzZSBmb3Igc2lnbmluZy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG9yZ0lkIFRoZSBpZCBvZiB0aGUgb3JnYW5pemF0aW9uIHRvIHdoaWNoIHRoZSByb2xlIGJlbG9uZ3MuXG4gICAqIEByZXR1cm4ge1JvbGV9IFRoZSByb2xlLlxuICAgKiBAaW50ZXJuYWxcbiAgICogKi9cbiAgcHJpdmF0ZSBzdGF0aWMgYXN5bmMgbGlzdFJvbGVzKGNzOiBDdWJlU2lnbmVyLCBvcmdJZDogc3RyaW5nKTogUHJvbWlzZTxSb2xlW10+IHtcbiAgICBjb25zdCByZXNwID0gYXdhaXQgY3MubWFuYWdlbWVudCgpLmdldChcIi92MC9vcmcve29yZ19pZH0vcm9sZXNcIiwge1xuICAgICAgcGFyYW1zOiB7IHBhdGg6IHsgb3JnX2lkOiBvcmdJZCB9IH0sXG4gICAgICBwYXJzZUFzOiBcImpzb25cIixcbiAgICB9KTtcbiAgICBjb25zdCBkYXRhID0gYXNzZXJ0T2socmVzcCk7XG4gICAgcmV0dXJuIGRhdGEucm9sZXMubWFwKChyOiBSb2xlSW5mbykgPT4gbmV3IFJvbGUoY3MsIG9yZ0lkLCByKSk7XG4gIH1cbn1cbiJdfQ==