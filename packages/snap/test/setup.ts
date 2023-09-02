import * as fs from "fs";
import * as path from "path";
import { ManagementSessionFile } from "@cubist-labs/cubesigner-sdk";
import { Snap, SnapConfirmationInterface, SnapPromptInterface } from "@metamask/snaps-jest";
import { expect } from "@jest/globals";
import { heading, panel, text } from "@metamask/snaps-ui";

/**
 * Directory where CubeSigner stores config files.
 * @return {string} Config dir
 */
function configDir(): string {
  if (!process.env.HOME) {
    throw new Error("HOME environment variable not set");
  }
  const home = process.env.HOME!;
  const configDir =
    process.platform === "darwin"
      ? path.join(home, "Library", "Application Support")
      : path.join(home, ".config");
  return path.join(configDir, "cubesigner");
}

/**
 * Defaults
 */
export class CubeSignerDefaults {
  /** Default signer-session.json file path
   * @return {string} Default signer-session.json file path
   */
  static signerSessionFile(): string {
    return path.join(configDir(), "signer-session.json");
  }

  /** Default management-session.json file path
   * @return {string} Default management-session.json file path
   */
  static managementSessionFile(): string {
    return path.join(configDir(), "management-session.json");
  }
}

/**
 * Loads the default management session from disk.
 * @return {ManagementSession}
 */
export function loadManagementSession(): ManagementSessionFile | undefined {
  return parse(CubeSignerDefaults.managementSessionFile());
}

/**
 * Execute the login RPC and check rendering of the UI.
 * @param {Snap} snap the snap
 * @param {string} origin The origin of the request
 * @return {Promise<{response: SnapResponse, ui: SnapPromptInterface}>} Login response and UI.
 */
export async function login(snap: Snap, origin: string) {
  const response = snap.request({
    method: "login",
    origin,
  });

  const ui = (await response.getInterface()) as SnapPromptInterface;
  expect(ui).toRender(
    panel([
      heading("Log in to CubeSigner"),
      text(`**${origin}** is asking you to login with CubeSigner.`),
      text("Your secret API session token:"),
    ])
  );

  return { response, ui };
}

/**
 * Execute the login RPC with an existing token and check rendering of the UI.
 * @param {Snap} snap the snap
 * @param {string} origin The origin of the request
 * @param {string} token_base64 The token to use.
 * @return {Promise<{response: SnapResponse, ui: SnapPromptInterface}>} Login response and UI.
 */
export async function loginWithToken(snap: Snap, origin: string, token_base64: string) {
  const response = snap.request({
    method: "login",
    origin,
    params: { token_base64 },
  });

  const ui = (await response.getInterface()) as SnapPromptInterface;
  expect(ui).toRender(
    panel([
      heading("Log in to CubeSigner"),
      text(`Do you want to let **${origin}** log you into CubeSigner?`),
    ])
  );

  return { response, ui };
}

/**
 * Execute the logout RPC and check rendering of the UI.
 * @param {Snap} snap the snap
 * @param {string} origin The origin of the request
 * @return {Promise<{response: SnapResponse, ui: SnapConfirmationInterface}>} Logout response and UI.
 */
export async function logout(snap: Snap, origin: string) {
  const response = snap.request({
    method: "logout",
    origin,
  });

  const ui = (await response.getInterface()) as SnapConfirmationInterface;
  expect(ui).toRender(
    panel([heading("Do you want to log out?"), text(`**${origin}** is asking you to log out.`)])
  );

  return { response, ui };
}

/* eslint-disable */

function parse(filePath: string) {
  if (!fs.statSync(filePath).isFile()) return undefined;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
