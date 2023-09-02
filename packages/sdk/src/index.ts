import { assertOk, env, EnvInterface } from "./env";
import { assert } from "console";
import createClient from "openapi-fetch";
import { components, paths, Client } from "./client";
import { Org } from "./org";
import { SessionStorage } from "./session/session_storage";
import { SignerSessionObject } from "./session/session_manager";
import { SignerSession } from "./signer_session";

/** CubeSigner constructor options */
export interface CubeSignerOptions {
  /** The management authorization token */
  managementToken?: string;
  /** The environment to use */
  env?: EnvInterface;
}

type UserInfo = components["schemas"]["UserInfo"];

/** CubeSigner client */
export class CubeSigner {
  readonly #managementToken?: string;
  readonly #env: EnvInterface;
  readonly #managementClient?: Client;

  /** @return {EnvInterface} The CubeSigner environment of this client */
  get env(): EnvInterface {
    return this.#env;
  }

  /**
   * Create a new CubeSigner instance.
   * @param {CubeSignerOptions} options The options for the CubeSigner instance.
   */
  constructor(options: CubeSignerOptions) {
    this.#managementToken = options.managementToken;
    this.#env = options.env ?? env["gamma"];

    if (this.#managementToken) {
      this.#managementClient = createClient<paths>({
        baseUrl: this.#env.SignerApiRoot,
        headers: {
          Authorization: this.#managementToken,
        },
      });
    }
  }

  /**
   * Loads a signer session from a session storage (e.g., session file).
   * @param {SessionStorage<SignerSessionObject>} storage The signer session storage
   * @return {Promise<SignerSession>} New signer session
   */
  async loadSignerSessionFromStorage(
    storage: SessionStorage<SignerSessionObject>
  ): Promise<SignerSession> {
    return await SignerSession.loadFromStorage(this, storage);
  }

  /** Retrieves information about the current user. */
  async aboutMe(): Promise<UserInfo> {
    const resp = await this.management().get("/v0/about_me", {
      parseAs: "json",
    });
    const data = assertOk(resp);
    return data;
  }

  /** Retrieves information about an organization.
   * @param {string} org The ID or name of the organization.
   * @return {Org} The organization.
   * */
  async getOrg(org: string): Promise<Org> {
    const resp = await this.management().get("/v0/org/{org_id}", {
      params: { path: { org_id: org } },
      parseAs: "json",
    });
    const data = assertOk(resp);
    return new Org(this, data);
  }

  /** Get the management client.
   * @return {Client} The client.
   * @internal
   * */
  management(): Client {
    assert(this.#managementClient, "managementClient must be defined");
    return this.#managementClient!;
  }
}

/** Organizations */
export * from "./org";
/** Keys */
export * from "./key";
/** Roles */
export * from "./role";
/** Env */
export * from "./env";
/** Sessions */
export * from "./signer_session";
/** Session storage */
export * from "./session/session_storage";
/** Session manager */
export * from "./session/session_manager";
