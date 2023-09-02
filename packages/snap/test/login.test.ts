/* eslint-disable require-jsdoc */

import {
  Snap,
  installSnap,
  SnapConfirmationInterface,
  SnapAlertInterface,
} from "@metamask/snaps-jest";
import { loadManagementSession, login, loginWithToken, logout } from "./setup";
import {
  CubeSigner,
  MemorySessionStorage,
  Org,
  Role,
  Secp256k1,
  SignerSession,
  SignerSessionObject,
} from "@cubist-labs/cubesigner-sdk";
import { expect } from "@jest/globals";
import { assertInvalidParams, assertUserRejected } from "./assert";

const origin = "https://cubesigner-snap-test.com";

describe("bad login using user input", () => {
  describe("cancel", () => {
    it("throws", async () => {
      const snap = await installSnap();
      const { response, ui } = await login(snap, origin);

      await ui.cancel();
      assertUserRejected(await response);
    });
  });
  describe("bad token", () => {
    it("prompts again", async () => {
      const snap = await installSnap();
      const l = await login(snap, origin);
      await l.ui.ok("badtoken");

      const badApi = (await l.response.getInterface()) as SnapConfirmationInterface;
      expect(badApi.type).toEqual("confirmation");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const heading = (badApi.content as any).children[0].value;
      expect(heading).toEqual("Bad API token!");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = (badApi.content as any).children[2].value;
      expect(err).toMatch(/Try again/);
      await badApi.cancel();
      assertUserRejected(await l.response);
    });
  });
});

describe("session (with user input token)", () => {
  let org: Org;
  let role: Role;
  let snap: Snap;
  let session: SignerSession;
  let token: string;

  beforeEach(async () => {
    const ms = loadManagementSession();
    expect(ms).toBeDefined();
    const cs = new CubeSigner({
      env: ms!.env["Dev-CubeSignerStack"],
      managementToken: ms!.id_token,
    });

    // create a new role and session for signing
    const aboutMe = await cs.aboutMe();
    const orgId = aboutMe.org_ids[0];
    org = await cs.getOrg(orgId);
    role = await org.createRole();
    // create a key and add it to the role
    const secp = await org.createKey(Secp256k1.Evm);
    await role.addKeys([secp], ["AllowRawBlobSigning"]);

    // create session
    console.log("Creating session");
    const storage = new MemorySessionStorage<SignerSessionObject>();
    session = await role.createSession(storage, "snap-sign-test");
    const sessionData: SignerSessionObject = await storage.retrieve();
    token = btoa(
      JSON.stringify({
        ...sessionData,
        env: ms!.env,
      })
    );

    snap = await installSnap();
  });

  afterEach(async () => {
    await session.revoke();
    await role.delete();
  });

  describe("logging in", () => {
    it("returns list of keys", async () => {
      const l = await login(snap, origin);
      await l.ui.ok(token);
      expect(await l.response).toRespondWith(null);

      // get keys
      const listKeysResponse = await snap.request({
        method: "get_keys",
        origin,
      });
      expect(listKeysResponse).toRespondWith(await session.keys());
    });
  });

  describe("logging out", () => {
    it("fails to retrieve keys", async () => {
      const l = await login(snap, origin);

      await l.ui.ok(token);
      expect(await l.response).toRespondWith(null);

      // log out
      const { response, ui } = await logout(snap, origin);
      ui.ok(); // OK to 'do you want to log out?'
      const alertUi = (await response.getInterface()) as SnapAlertInterface;
      alertUi.ok(); // Close the alert about token removed
      expect(await response).toRespondWith(null);

      // get keys fails
      const listKeysReponse = await snap.request({
        method: "get_keys",
        origin,
      });
      expect(listKeysReponse).toRespondWithError({
        code: -32603,
        message: "Internal JSON-RPC error.",
        data: {
          cause: {
            message: "Not logged in",
            stack: expect.any(String),
          },
        },
      });
    });
  });
});

describe("bad login using token", () => {
  describe("bad token", () => {
    it("throws", async () => {
      const snap = await installSnap();
      const response = snap.request({
        method: "login",
        origin,
        params: { token_base64: "badtoken" },
      });
      assertInvalidParams(await response);
    });
  });
});

describe("session using token param", () => {
  let org: Org;
  let role: Role;
  let snap: Snap;
  let session: SignerSession;
  let token: string;

  beforeEach(async () => {
    const ms = loadManagementSession();
    expect(ms).toBeDefined();
    const cs = new CubeSigner({
      env: ms!.env["Dev-CubeSignerStack"],
      managementToken: ms!.id_token,
    });

    // create a new role and session for signing
    const aboutMe = await cs.aboutMe();
    const orgId = aboutMe.org_ids[0];
    org = await cs.getOrg(orgId);
    role = await org.createRole();
    // create a key and add it to the role
    const secp = await org.createKey(Secp256k1.Evm);
    await role.addKeys([secp], ["AllowRawBlobSigning"]);

    // create session
    console.log("Creating session");
    const storage = new MemorySessionStorage<SignerSessionObject>();
    session = await role.createSession(storage, "snap-sign-test");
    const sessionData: SignerSessionObject = await storage.retrieve();
    token = btoa(
      JSON.stringify({
        ...sessionData,
        env: ms!.env,
      })
    );

    snap = await installSnap();
  });

  afterEach(async () => {
    await session.revoke();
    await role.delete();
  });

  describe("logging in (with token)", () => {
    it("returns list of keys", async () => {
      const l = await loginWithToken(snap, origin, token);
      await l.ui.ok();
      expect(await l.response).toRespondWith(null);

      // get keys
      const listKeysResponse = await snap.request({
        method: "get_keys",
        origin,
      });
      expect(listKeysResponse).toRespondWith(await session.keys());
    });
  });

  describe("cancelling logging in", () => {
    it("fails with rejected", async () => {
      const { response, ui } = await loginWithToken(snap, origin, token);
      await ui.cancel();
      assertUserRejected(await response);
    });
  });
});
