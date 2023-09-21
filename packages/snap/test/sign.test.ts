/* eslint-disable require-jsdoc */

import {
  Snap,
  SnapAlertInterface,
  SnapConfirmationInterface,
  installSnap,
} from "@metamask/snaps-jest";
import { expect } from "@jest/globals";
import { login, logout } from "./setup";
import { assertOk, assertUserRejected } from "./assert";
import {
  CubeSigner,
  Org,
  Role,
  Key,
  Secp256k1,
  BlobSignRequest,
  EvmSignRequest,
  SolanaSignRequest,
  Ed25519,
  MemorySessionStorage,
  SignerSessionData,
  BtcSignRequest,
  BtcSignatureKind,
} from "@cubist-labs/cubesigner-sdk";
import { heading, text, copyable, panel } from "@metamask/snaps-ui";

const origin = "https://cubesigner-snap-test.com";

describe("onRpcRequest", () => {
  let org: Org;
  let role: Role;
  let secp: Key;
  let solana: Key;
  let btc: Key;
  let snap: Snap;

  beforeAll(async () => {
    const cs = await CubeSigner.loadManagementSession();

    // create a new role
    console.log("Creating a role");
    const aboutMe = await cs.aboutMe();
    const orgId = aboutMe.org_ids[0];
    org = await cs.getOrg(orgId);
    role = await org.createRole();

    // create some keys and add them to that role
    console.log("Creating keys");
    secp = await org.createKey(Secp256k1.Evm);
    solana = await org.createKey(Ed25519.Solana);
    btc = await org.createKey(Secp256k1.Btc);
    await role.addKeys([secp, solana, btc], ["AllowRawBlobSigning"]);

    // create session
    console.log("Creating session");
    const storage = new MemorySessionStorage<SignerSessionData>();
    await role.createSession(storage, "snap-sign-test");
    const token = btoa(JSON.stringify(await storage.retrieve()));

    snap = await installSnap();

    // login to the snap
    console.log("Logging into Snap");
    const l = await login(snap, origin);
    await l.ui.ok(token);
    expect(await l.response).toRespondWith(null);
  });

  afterAll(async () => {
    const { response, ui } = await logout(snap, origin);
    ui.ok(); // OK to 'do you want to log out?'
    const alertUi = (await response.getInterface()) as SnapAlertInterface;
    alertUi.ok(); // Close the alert about token removed
    expect(await response).toRespondWith(null);

    await role.delete();
  });

  describe("sign_evm", () => {
    it("asks for approval then signs evm request", async () => {
      console.log("Calling sign_evm");
      const body = <EvmSignRequest>{
        chain_id: 1,
        tx: <unknown>{
          type: "0x00",
          gas: "0x61a80",
          gasPrice: "0x77359400",
          nonce: "0",
        },
      };

      const response = snap.request({
        method: "sign_evm",
        origin,
        params: {
          pubkey: secp.materialId,
          body,
        },
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui).toRender(confirmationPanel("evm", JSON.stringify(body), secp.materialId));

      console.log("Approving evm");
      await ui.ok();
      const info = assertOk(await response);
      console.log(info);
      expect(info).toHaveProperty("rlp_signed_tx");
    });
  });

  describe("sign_blob", () => {
    it("signs a blob unless rejected", async () => {
      console.log("Calling sign_blob");
      const body = <BlobSignRequest>{
        message_base64: "L1kE9g59xD3fzYQQSR7340BwU9fGrP6EMfIFcyX/YBc=",
      };

      for (const approve of [true, false]) {
        const response = snap.request({
          method: "sign_blob",
          origin,
          params: {
            keyId: secp.id,
            body,
          },
        });

        const ui = (await response.getInterface()) as SnapConfirmationInterface;
        expect(ui).toRender(confirmationPanel("blob", JSON.stringify(body), secp.id));

        if (approve) {
          console.log("Approving blob sign");
          await ui.ok();
          const info = assertOk(await response);
          expect(info).toHaveProperty("signature");
          console.log(info);
        } else {
          console.log("Rejecting blob sign");
          await ui.cancel();
          assertUserRejected(await response);
        }
      }
    });
  });

  describe("sign_btc", () => {
    it("asks for approval then signs btc request", async () => {
      console.log("Calling sign_btc");
      const body = {
        sig_kind: <BtcSignatureKind>{
          Segwit: {
            input_index: 0,
            script_code: "0x76a91479091972186c449eb1ded22b78e40d009bdf008988ac",
            value: 1_000_000,
            sighash_type: "All",
          },
        },
        tx: {
          version: 1,
          lock_time: 1170,
          input: [
            {
              previous_output: "77541aeb3c4dac9260b68f74f44c973081a9d4cb2ebe8038b2d70faa201b6bdb:1",
              script_sig: "",
              sequence: 4294967294,
              witness: [],
            },
          ],
          output: [
            {
              value: 199996600,
              script_pubkey: "76a914a457b684d7f0d539a46a45bbc043f35b59d0d96388ac",
            },
            {
              value: 800000000,
              script_pubkey: "76a914fd270b1ee6abcaea97fea7ad0402e8bd8ad6d77c88ac",
            },
          ],
        },
      } as unknown as BtcSignRequest;

      const response = snap.request({
        method: "sign_btc",
        origin,
        params: {
          pubkey: btc.materialId,
          body,
        },
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui).toRender(confirmationPanel("BTC", JSON.stringify(body), btc.materialId));

      console.log("Approving BTC");
      await ui.ok();
      const info = assertOk(await response);
      console.log(info);
      expect(info).toHaveProperty("signature");
    });
  });

  describe("sign_solana", () => {
    it("asks for approval then signs solana request", async () => {
      console.log("Calling sign_solana");
      const body = {
        message: {
          accountKeys: [
            [1],
            [
              49, 241, 12, 133, 218, 209, 176, 139, 26, 206, 239, 57, 16, 221, 18, 53, 24, 210, 83,
              28, 238, 193, 32, 60, 246, 98, 141, 113, 38, 39, 247, 0,
            ],
          ],
          header: {
            numReadonlySignedAccounts: 0,
            numReadonlyUnsignedAccounts: 0,
            numRequiredSignatures: 1,
          },
          instructions: [[1], { accounts: [[0]], data: [[0]], programIdIndex: 0 }],
          recentBlockhash: [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0,
          ],
        },
      } as unknown as SolanaSignRequest;

      const response = snap.request({
        method: "sign_solana",
        origin,
        params: {
          pubkey: solana.materialId,
          body,
        },
      });

      const ui = (await response.getInterface()) as SnapConfirmationInterface;
      expect(ui).toRender(confirmationPanel("Solana", JSON.stringify(body), solana.materialId));

      console.log("Approving solana");
      await ui.ok();
      const info = assertOk(await response);
      console.log(info);
      expect(info).toHaveProperty("signature");
    });
  });
});

function confirmationPanel(kind: string, request: string, key: string) {
  return panel([
    heading("Signature request"),
    text(`Do you want to sign the following "${kind}" request`),
    copyable(request),
    text(`with the following public key?`),
    copyable(key),
  ]);
}
