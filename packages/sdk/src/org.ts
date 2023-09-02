import { CubeSigner } from ".";
import { components, paths } from "./client";
import { assertOk } from "./env";
import { KeyType, Key } from "./key";
import { Role, RoleInfo } from "./role";

/** Organization id */
export type OrgId = string;

/** Org-wide policy */
export type OrgPolicy = SourceIpAllowlistPolicy | OriginAllowlistPolicy | MaxDailyUnstakePolicy;

/**
 * Only allow requests from the specified origins.
 * @example {"OriginAllowlist": "*"}
 */
export interface OriginAllowlistPolicy {
  OriginAllowlist: string[] | "*";
}

/**
 * Restrict signing to specific source IP addresses.
 * @example {"SourceIpAllowlist": ["10.1.2.3/8", "169.254.17.1/16"]}
 */
export interface SourceIpAllowlistPolicy {
  SourceIpAllowlist: string[];
}

/**
 * Restrict the number of unstakes per day.
 * @example {"MaxDailyUnstake": 5 }
 */
export interface MaxDailyUnstakePolicy {
  MaxDailyUnstake: number;
}

type OrgInfo = components["schemas"]["OrgInfo"];
type UpdateOrgRequest =
  paths["/v0/org/{org_id}"]["patch"]["requestBody"]["content"]["application/json"];
type UpdateOrgResponse =
  paths["/v0/org/{org_id}"]["patch"]["responses"]["200"]["content"]["application/json"];

/** An organization. */
export class Org {
  readonly #cs: CubeSigner;
  /**
   * The ID of the organization.
   * @example Org#124dfe3e-3bbd-487d-80c0-53c55e8ab87a
   */
  readonly #id: string;

  /**
   * @description The org id
   * @example Org#c3b9379c-4e8c-4216-bd0a-65ace53cf98f
   * */
  get id(): OrgId {
    return this.#id;
  }

  /** Human-readable name for the org */
  async name(): Promise<string | undefined> {
    const data = await this.fetch();
    return data.name ?? undefined;
  }

  /** Set the human-readable name for the org.
   * @param {string} name The new human-readable name for the org (must be alphanumeric).
   * @example my_org_name
   * */
  async setName(name: string) {
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(name)) {
      throw new Error("Org name must be alphanumeric and between 3 and 30 characters");
    }
    await this.update({ name });
  }

  /** Is the org enabled? */
  async enabled(): Promise<boolean> {
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
  async policy(): Promise<OrgPolicy[]> {
    const data = await this.fetch();
    return (data.policy ?? []) as unknown as OrgPolicy[];
  }

  /** Set the policy for the org.
   * @param {OrgPolicy[]} policy The new policy for the org.
   * */
  async setPolicy(policy: OrgPolicy[]) {
    const p = policy as unknown as Record<string, never>[];
    await this.update({ policy: p });
  }

  /** Create a new signing key.
   * @param {KeyType} type The type of key to create.
   * @return {Key[]} The new keys.
   * */
  async createKey(type: KeyType): Promise<Key> {
    return (await Key.createKeys(this.#cs, this.id, type, 1))[0];
  }

  /** Create new signing keys.
   * @param {KeyType} type The type of key to create.
   * @param {nummber?} count The number of keys to create. Defaults to 1.
   * @return {Key[]} The new keys.
   * */
  async createKeys(type: KeyType, count = 1): Promise<Key[]> {
    return Key.createKeys(this.#cs, this.id, type, count);
  }

  /** Get a key by id.
   * @param {string} keyId The id of the key to get.
   * @return {Key} The key.
   * */
  async getKey(keyId: string): Promise<Key> {
    return await Key.getKey(this.#cs, this.id, keyId);
  }

  /** Get all keys.
   * @param {KeyType?} type Optional key type to filter list for.
   * @return {Key} The key.
   * */
  async listKeys(type?: KeyType): Promise<Key[]> {
    return Key.listKeys(this.#cs, this.id, type);
  }

  /** Create a new role.
   * @param {string?} name The name of the role.
   * @return {Role} The new role.
   * */
  async createRole(name?: string): Promise<Role> {
    return Role.createRole(this.#cs, this.id, name);
  }

  /** Get a role by id or name.
   * @param {string} roleId The id or name of the role to get.
   * @return {Role} The role.
   * */
  async getRole(roleId: string): Promise<Role> {
    return Role.getRole(this.#cs, this.id, roleId);
  }

  /** List all roles.
   * @return {Role[]} The roles.
   * */
  async listRoles(): Promise<Role[]> {
    return Org.listRoles(this.#cs, this.id);
  }

  // --------------------------------------------------------------------------
  // -- INTERNAL --------------------------------------------------------------
  // --------------------------------------------------------------------------

  /** Create a new org.
   * @param {CubeSigner} cs The CubeSigner instance.
   * @param {OrgInfo} data The JSON response from the API server.
   * @internal
   * */
  constructor(cs: CubeSigner, data: OrgInfo) {
    this.#cs = cs;
    this.#id = data.org_id;
  }

  /** Fetch org info.
   * @return {OrgInfo} The org info.
   * */
  private async fetch(): Promise<OrgInfo> {
    const resp = await this.#cs.management().get("/v0/org/{org_id}", {
      params: { path: { org_id: this.id } },
      parseAs: "json",
    });
    const data = assertOk(resp);
    return data;
  }

  /** Update the org.
   * @param {UpdateOrgRequest} request The JSON request to send to the API server.
   * @return {UpdateOrgResponse} The JSON response from the API server.
   * */
  private async update(request: UpdateOrgRequest): Promise<UpdateOrgResponse> {
    const resp = await this.#cs.management().patch("/v0/org/{org_id}", {
      params: { path: { org_id: this.id } },
      body: request,
      parseAs: "json",
    });
    return assertOk(resp);
  }

  /** List roles.
   * @param {CubeSigner} cs The CubeSigner instance to use for signing.
   * @param {string} orgId The id of the organization to which the role belongs.
   * @return {Role} The role.
   * @internal
   * */
  private static async listRoles(cs: CubeSigner, orgId: string): Promise<Role[]> {
    const resp = await cs.management().get("/v0/org/{org_id}/roles", {
      params: { path: { org_id: orgId } },
      parseAs: "json",
    });
    const data = assertOk(resp);
    return data.roles.map((r: RoleInfo) => new Role(cs, orgId, r));
  }
}
