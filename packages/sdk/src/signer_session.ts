import assert from "assert";
import { CubeSigner, Key, Role, SessionStorage } from ".";
import { SessionManager, SignerSessionObject } from "./session/session_manager";
import { components, paths, Client } from "./client";
import { assertOk } from "./env";
import createClient from "openapi-fetch";

const EXPIRATION_BUFFER_SECS = 30;

export type CreateSignerSessionRequest =
  paths["/v0/org/{org_id}/roles/{role_id}/tokens"]["post"]["requestBody"]["content"]["application/json"];
export type RefreshSignerSessionRequest =
  paths["/v1/org/{org_id}/token/refresh"]["patch"]["requestBody"]["content"]["application/json"];
export type KeyInfo = components["schemas"]["KeyInfo"];

/* eslint-disable */
export type Eth1SignRequest =
  paths["/v1/org/{org_id}/eth1/sign/{pubkey}"]["post"]["requestBody"]["content"]["application/json"];
export type Eth2SignRequest =
  paths["/v1/org/{org_id}/eth2/sign/{pubkey}"]["post"]["requestBody"]["content"]["application/json"];
export type Eth2StakeRequest =
  paths["/v1/org/{org_id}/eth2/stake"]["post"]["requestBody"]["content"]["application/json"];
export type Eth2UnstakeRequest =
  paths["/v1/org/{org_id}/eth2/unstake/{pubkey}"]["post"]["requestBody"]["content"]["application/json"];
export type BlobSignRequest =
  paths["/v1/org/{org_id}/blob/sign/{key_id}"]["post"]["requestBody"]["content"]["application/json"];
export type BtcSignRequest =
  paths["/v0/org/{org_id}/btc/sign/{pubkey}"]["post"]["requestBody"]["content"]["application/json"];
export type SolanaSignRequest =
  paths["/v1/org/{org_id}/solana/sign/{pubkey}"]["post"]["requestBody"]["content"]["application/json"];

export type Eth1SignResponse =
  components["responses"]["Eth1SignResponse"]["content"]["application/json"];
export type Eth2SignResponse =
  components["responses"]["Eth2SignResponse"]["content"]["application/json"];
export type Eth2StakeResponse =
  components["responses"]["StakeResponse"]["content"]["application/json"];
export type Eth2UnstakeResponse =
  components["responses"]["UnstakeResponse"]["content"]["application/json"];
export type BlobSignResponse =
  components["responses"]["BlobSignResponse"]["content"]["application/json"];
export type BtcSignResponse =
  components["responses"]["BtcSignResponse"]["content"]["application/json"];
export type SolanaSignResponse =
  components["responses"]["SolanaSignResponse"]["content"]["application/json"];
export type MfaRequestInfo =
  components["responses"]["MfaRequestInfo"]["content"]["application/json"];

export type AcceptedResponse = components["schemas"]["AcceptedResponse"];
export type ErrorResponse = components["schemas"]["ErrorResponse"];
export type BtcSignatureKind = components["schemas"]["BtcSignatureKind"];
/* eslint-enable */

type SignFn<U> = (headers?: HeadersInit) => Promise<U | AcceptedResponse>;

export interface SignerSessionLifetime {
  /** Session lifetime (in seconds). Defaults to one week (604800). */
  session?: number;
  /** Auth token lifetime (in seconds). Defaults to five minutes (300). */
  auth: number;
  /** Refresh token lifetime (in seconds). Defaults to one day (86400). */
  refresh?: number;
}

const defaultSignerSessionLifetime: SignerSessionLifetime = {
  session: 604800,
  auth: 300,
  refresh: 86400,
};

/**
 * A response of a signing request.
 */
export class SignResponse<U> {
  readonly #cs: CubeSigner;
  readonly #orgId: string;
  readonly #roleId: string;
  readonly #signFn: SignFn<U>;
  readonly #resp: U | AcceptedResponse;

  /** @return {boolean} True if this signing request requires an MFA approval */
  requiresMfa(): boolean {
    return (this.#resp as AcceptedResponse).accepted?.MfaRequired !== undefined;
  }

  /** @return {U} The signed data */
  data(): U {
    return this.#resp as U;
  }

  /**
   * Approves the MFA request.
   *
   * Note: This only works for MFA requests that require a single approval.
   *
   * @return {SignResponse<U>} The result of signing with the approval
   */
  async approve(): Promise<SignResponse<U>> {
    const mfaRequired = (this.#resp as AcceptedResponse).accepted?.MfaRequired;
    if (!mfaRequired) {
      throw new Error("Request does not require MFA approval");
    }

    const mfaId = mfaRequired.id;
    const mfaApproval = await Role.mfaApprove(this.#cs, this.#orgId, this.#roleId, mfaId);
    assert(mfaApproval.id === mfaId);

    const mfaConf = mfaApproval.receipt?.confirmation;
    if (!mfaConf) {
      throw new Error("MfaRequest has not been approved yet");
    }

    const headers = {
      "x-cubist-mfa-id": mfaId,
      "x-cubist-mfa-confirmation": mfaConf,
    };
    return new SignResponse(
      this.#cs,
      this.#orgId,
      this.#roleId,
      this.#signFn,
      await this.#signFn(headers)
    );
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
  constructor(
    cs: CubeSigner,
    orgId: string,
    roleId: string,
    signFn: SignFn<U>,
    resp: U | AcceptedResponse
  ) {
    this.#cs = cs;
    this.#orgId = orgId;
    this.#roleId = roleId;
    this.#signFn = signFn;
    this.#resp = resp;
  }
}

/** Signer session info. Can only be used to revoke a token, but not for authentication. */
export class SignerSessionInfo {
  readonly #cs: CubeSigner;
  readonly #orgId: string;
  readonly #roleId: string;
  readonly #sessionId: string;
  public readonly purpose: string;

  /** Revoke this token */
  async revoke() {
    await SignerSession.revoke(this.#cs, this.#orgId, this.#roleId, this.#sessionId);
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
  constructor(cs: CubeSigner, orgId: string, roleId: string, hash: string, purpose: string) {
    this.#cs = cs;
    this.#orgId = orgId;
    this.#roleId = roleId;
    this.#sessionId = hash;
    this.purpose = purpose;
  }
}

/** Signer session. */
export class SignerSession extends SessionManager<SignerSessionObject> {
  readonly cs: CubeSigner;
  readonly #orgId: string;
  readonly roleId: string;
  #client: Client;

  /**
   * Returns a client with the current session and refreshes the current
   * session. May **UPDATE/MUTATE** self.
   */
  async client(): Promise<Client> {
    await this.refreshIfNeeded();
    return this.#client;
  }

  /** Revokes the session. */
  async revoke(): Promise<void> {
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
    assertOk(resp);
  }

  /**
   * Returns whether it's time to refresh this token.
   * @return {boolean} Whether it's time to refresh this token.
   * @internal
   */
  async isStale(): Promise<boolean> {
    const session = await this.storage.retrieve();
    const csi = session.session_info;
    const now_epoch_seconds = new Date().getTime() / 1000;
    return csi.auth_token_exp < now_epoch_seconds + EXPIRATION_BUFFER_SECS;
  }

  /**
   * Refreshes the session and **UPDATES/MUTATES** self.
   */
  async refresh(): Promise<void> {
    const session = await this.storage.retrieve();
    const csi = session.session_info;
    const resp = await this.#client.patch("/v1/org/{org_id}/token/refresh", {
      params: { path: { org_id: session.org_id } },
      body: <RefreshSignerSessionRequest>{
        epoch_num: csi.epoch,
        epoch_token: csi.epoch_token,
        other_token: csi.refresh_token,
      },
      parseAs: "json",
    });
    const data = assertOk(resp);
    await this.storage.save(<SignerSessionObject>{
      ...session,
      session_info: data.session_info,
      token: data.token,
    });
    this.#client = this.#makeClient(data.token);
  }

  /**
   * @return {Promise<string>} The session id
   */
  async sessionId(): Promise<string> {
    const session = await this.storage.retrieve();
    return session.session_info.session_id;
  }

  /**
   * Returns the list of keys that this token grants access to.
   * @return {KeyInfo[]} The list of keys.
   */
  async keys(): Promise<KeyInfo[]> {
    const resp = await (
      await this.client()
    ).get("/v0/org/{org_id}/token/keys", {
      params: { path: { org_id: this.#orgId } },
      parseAs: "json",
    });
    const data = assertOk(resp);
    return data.keys;
  }

  /**
   * Submit an 'eth1' sign request.
   * @param {Key | string} key The key to sign with (either {@link Key} or its material ID).
   * @param {Eth1SignRequest} req What to sign.
   * @return {Promise<Eth1SignResponse | AcceptedResponse>} Signature
   */
  async signEth1(key: Key | string, req: Eth1SignRequest): Promise<SignResponse<Eth1SignResponse>> {
    const pubkey = typeof key === "string" ? (key as string) : key.materialId;
    const sign = async (headers?: HeadersInit) => {
      const resp = await (
        await this.client()
      ).post("/v1/org/{org_id}/eth1/sign/{pubkey}", {
        params: { path: { org_id: this.#orgId, pubkey } },
        body: req,
        headers,
        parseAs: "json",
      });
      return assertOk(resp);
    };
    return new SignResponse(this.cs, this.#orgId, this.roleId, sign, await sign());
  }

  /**
   * Submit an 'eth2' sign request.
   * @param {Key | string} key The key to sign with (either {@link Key} or its material ID).
   * @param {Eth2SignRequest} req What to sign.
   * @return {Promise<Eth2SignResponse | AcceptedResponse>} Signature
   */
  async signEth2(key: Key | string, req: Eth2SignRequest): Promise<SignResponse<Eth2SignResponse>> {
    const pubkey = typeof key === "string" ? (key as string) : key.materialId;
    const sign = async (headers?: HeadersInit) => {
      const resp = await (
        await this.client()
      ).post("/v1/org/{org_id}/eth2/sign/{pubkey}", {
        params: { path: { org_id: this.#orgId, pubkey } },
        body: req,
        headers,
        parseAs: "json",
      });
      return assertOk(resp);
    };
    return new SignResponse(this.cs, this.#orgId, this.roleId, sign, await sign());
  }

  /**
   * Sign a stake request.
   * @param {Eth2StakeRequest} req The request to sign.
   * @return {Promise<Eth2StakeResponse | AcceptedResponse>} The response.
   */
  async stake(req: Eth2StakeRequest): Promise<SignResponse<Eth2StakeResponse>> {
    const sign = async (headers?: HeadersInit) => {
      const resp = await (
        await this.client()
      ).post("/v1/org/{org_id}/eth2/stake", {
        params: { path: { org_id: this.#orgId } },
        body: req,
        headers,
        parseAs: "json",
      });
      return assertOk(resp);
    };
    return new SignResponse(this.cs, this.#orgId, this.roleId, sign, await sign());
  }

  /**
   * Sign an unstake request.
   * @param {Key | string} key The key to sign with (either {@link Key} or its material ID).
   * @param {Eth2UnstakeRequest} req The request to sign.
   * @return {Promise<Eth2UnstakeResponse | AcceptedResponse>} The response.
   */
  async unstake(
    key: Key | string,
    req: Eth2UnstakeRequest
  ): Promise<SignResponse<Eth2UnstakeResponse>> {
    const pubkey = typeof key === "string" ? (key as string) : key.materialId;
    const sign = async (headers?: HeadersInit) => {
      const resp = await (
        await this.client()
      ).post("/v1/org/{org_id}/eth2/unstake/{pubkey}", {
        params: { path: { org_id: this.#orgId, pubkey } },
        body: req,
        headers,
        parseAs: "json",
      });
      return assertOk(resp);
    };
    return new SignResponse(this.cs, this.#orgId, this.roleId, sign, await sign());
  }

  /**
   * Sign a raw blob.
   * @param {Key | string} key The key to sign with (either {@link Key} or its ID).
   * @param {BlobSignRequest} req What to sign
   * @return {Promise<BlobSignResponse | AcceptedResponse>} The response.
   */
  async signBlob(key: Key | string, req: BlobSignRequest): Promise<SignResponse<BlobSignResponse>> {
    const key_id = typeof key === "string" ? (key as string) : key.id;
    const sign = async (headers?: HeadersInit) => {
      const resp = await (
        await this.client()
      ).post("/v1/org/{org_id}/blob/sign/{key_id}", {
        params: {
          path: { org_id: this.#orgId, key_id },
        },
        body: req,
        headers,
        parseAs: "json",
      });
      return assertOk(resp);
    };
    return new SignResponse(this.cs, this.#orgId, this.roleId, sign, await sign());
  }

  /**
   * Sign a bitcoin message.
   * @param {Key | string} key The key to sign with (either {@link Key} or its material ID).
   * @param {BtcSignRequest} req What to sign
   * @return {Promise<BtcSignResponse | AcceptedResponse>} The response.
   */
  async signBtc(key: Key | string, req: BtcSignRequest): Promise<SignResponse<BtcSignResponse>> {
    const pubkey = typeof key === "string" ? (key as string) : key.materialId;
    const sign = async (headers?: HeadersInit) => {
      const resp = await (
        await this.client()
      ).post("/v0/org/{org_id}/btc/sign/{pubkey}", {
        params: {
          path: { org_id: this.#orgId, pubkey },
        },
        body: req,
        headers: headers,
        parseAs: "json",
      });
      return assertOk(resp);
    };
    return new SignResponse(this.cs, this.#orgId, this.roleId, sign, await sign());
  }

  /**
   * Sign a solana message.
   * @param {Key | string} key The key to sign with (either {@link Key} or its material ID).
   * @param {SolanaSignRequest} req What to sign
   * @return {Promise<SolanaSignResponse | AcceptedResponse>} The response.
   */
  async signSolana(
    key: Key | string,
    req: SolanaSignRequest
  ): Promise<SignResponse<SolanaSignResponse>> {
    const pubkey = typeof key === "string" ? (key as string) : key.materialId;
    const sign = async (headers?: HeadersInit) => {
      const resp = await (
        await this.client()
      ).post("/v1/org/{org_id}/solana/sign/{pubkey}", {
        params: { path: { org_id: this.#orgId, pubkey } },
        body: req,
        headers,
        parseAs: "json",
      });
      return assertOk(resp);
    };
    return new SignResponse(this.cs, this.#orgId, this.roleId, sign, await sign());
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
  static async create(
    cs: CubeSigner,
    storage: SessionStorage<SignerSessionObject>,
    orgId: string,
    roleId: string,
    purpose: string,
    ttl?: SignerSessionLifetime
  ): Promise<SignerSession> {
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
    const data = assertOk(resp);
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
  static async loadFromStorage(
    cs: CubeSigner,
    storage: SessionStorage<SignerSessionObject>
  ): Promise<SignerSession> {
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
  private constructor(
    cs: CubeSigner,
    storage: SessionStorage<SignerSessionObject>,
    orgId: string,
    roleId: string,
    token: string
  ) {
    super(storage);
    this.cs = cs;
    this.#orgId = orgId;
    this.roleId = roleId;
    this.#client = this.#makeClient(token);
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
  static async revoke(cs: CubeSigner, orgId: string, roleId: string, sessionId: string) {
    const resp = await cs.management().del("/v0/org/{org_id}/roles/{role_id}/tokens/{session_id}", {
      params: {
        path: { org_id: orgId, role_id: roleId, session_id: sessionId },
      },
      parseAs: "json",
    });
    assertOk(resp);
  }

  /**
   * Creates a new REST client.
   * @param {string} token The authorization token to use for the client
   * @return {Client} The new REST client
   */
  #makeClient(token: string): Client {
    return createClient<paths>({
      baseUrl: this.cs.env.SignerApiRoot,
      headers: {
        Authorization: token,
      },
    });
  }
}
