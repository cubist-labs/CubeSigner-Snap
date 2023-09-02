import {
  CubeSigner,
  MemorySessionStorage,
  SignerSession,
  SignerSessionFile,
} from "@cubist-labs/cubesigner-sdk";
import { RpcRequest } from "./types";
import { heading, text, panel } from "@metamask/snaps-ui";
import { Json } from "@metamask/types";
import { Shape, sanitize } from "./types";
import { rpcErrors, providerErrors } from "@metamask/rpc-errors";

/**
 * Log into CubeSigner (if not already logged in) and save the session info in Snap managed state.
 * @param {RpcRequest} rpc RPC request
 * */
export async function login(rpc: RpcRequest) {
  if ((await getState()) === null) {
    await handleLogin(rpc);
  }
}

/**
 * Log out of CubeSigner (if logged in) and revoke the token.
 * @param {RpcRequest} rpc RPC request
 * */
export async function logout(rpc: RpcRequest) {
  if ((await getState()) !== null) {
    await handleLogout(rpc.origin);
  }
}

/**
 * RPC parameters for the {@link login} method.
 */
export interface LoginParams {
  /** The base64 encoded session token*/
  token_base64: string;
}

/**
 * Login given a token or by asking the user to input their CubeSigner token.
 * @param {RpcRequest} rpc RPC request
 */
async function handleLogin(rpc: RpcRequest): Promise<void> {
  if (rpc.request.params) {
    await handleTokenBasedLogin(rpc);
  } else {
    await handleUserLogin(rpc.origin);
  }
}

/**
 * Login with an existign CubeSigner token; only ask user for confirmation.
 * @param {RpcRequest} rpc RPC request
 */
async function handleTokenBasedLogin(rpc: RpcRequest): Promise<void> {
  const shape = <Shape>{
    token_base64: "string",
  };
  const params = sanitize<LoginParams>(rpc.request.params, shape);
  const secretBase64Token = params.token_base64;

  // parse and validate the token
  let secretApiToken;
  try {
    secretApiToken = parseAndValidateToken(secretBase64Token);
  } catch (_err) {
    throw rpcErrors.invalidParams({
      message: "Invalid RPC Params: Parameter 'token_base64' is an invalid base64 string.",
    });
  }

  const approved = await snap.request({
    method: "snap_dialog",
    params: {
      type: "confirmation",
      content: panel([
        heading("Log in to CubeSigner"),
        text(`Do you want to let **${rpc.origin}** log you into CubeSigner?`),
      ]),
    },
  });
  if (!approved) {
    throw providerErrors.userRejectedRequest();
  }
  // store the parsed token
  await setState(secretApiToken);
}

/**
 * Ask the user to input their CubeSigner token.
 * @param {string} origin The origin of the request
 */
async function handleUserLogin(origin: string): Promise<void> {
  const secretInput = (await snap.request({
    method: "snap_dialog",
    params: {
      type: "prompt",
      content: panel([
        heading("Log in to CubeSigner"),
        text(`**${origin}** is asking you to login with CubeSigner.`),
        text("Your secret API session token:"),
      ]),
      placeholder: "ewog...Q==",
    },
  })) as string;

  // user cancelled
  if (secretInput === null) {
    throw providerErrors.userRejectedRequest();
  }

  try {
    // parse and validate the token
    const secretApiToken = parseAndValidateToken(secretInput);
    // store the parsed token
    await setState(secretApiToken);
  } catch (err) {
    const retry = await snap.request({
      method: "snap_dialog",
      params: {
        type: "confirmation",
        content: panel([
          heading("Bad API token!"),
          text(
            "The session token you entered is not valid. The token should be a base64-encoded JSON object created with CubeSigner: cs token create"
          ),
          text("Try again with another token?"),
        ]),
      },
    });

    if (retry == true) {
      return await handleUserLogin(origin);
    }
    throw providerErrors.userRejectedRequest();
  }
}

/**
 * Ask the user to logout of CubeSigner.
 * @param {string} origin The origin of the request
 */
async function handleLogout(origin: string): Promise<void> {
  const approved = await snap.request({
    method: "snap_dialog",
    params: {
      type: "confirmation",
      content: panel([
        heading("Do you want to log out?"),
        text(`**${origin}** is asking you to log out.`),
      ]),
    },
  });
  if (approved) {
    await clearState();

    await snap.request({
      method: "snap_dialog",
      params: {
        type: "alert",
        content: panel([
          heading("Token removed"),
          text(`If you want to revoke your token, use the CubeSigner: 'cs token revoke'`),
        ]),
      },
    });
  }
}

/**
 * Get the current session.
 * @return {SignerSession} The current session.
 */
export async function getCurrentSignerSession(): Promise<SignerSession> {
  const state = await getState();

  if (!state) {
    throw rpcErrors.invalidRequest({ message: "Not logged in" });
  }
  const env = state.env["Dev-CubeSignerStack"];
  const cs = new CubeSigner({ env });
  // TODO: Replace with Snap-specific storage class
  return cs.loadSignerSessionFromStorage(new MemorySessionStorage(state));
}

/** Persistent signer state. */
export type CubeSignerState = SignerSessionFile;

/**
 * Get the current state of the snap.
 *
 * This uses the `snap_manageState` JSON-RPC method to get the state.
 *
 * @return {CubeSignerState} The current state of the snap.
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_managestate
 */
async function getState(): Promise<CubeSignerState | null> {
  const state = await snap.request({
    method: "snap_manageState",
    params: { operation: "get" },
  });

  return state as CubeSignerState | null;
}

/**
 * Set the state of the snap. This will overwrite the current state.
 *
 * This uses the `snap_manageState` JSON-RPC method to set the state. The state
 * is encrypted with the user's secret recovery phrase and stored in the user's
 * browser.
 *
 * @param {CubeSignerState} newState - The new state of the snap.
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_managestate
 */
async function setState(newState: CubeSignerState) {
  await snap.request({
    method: "snap_manageState",
    params: { operation: "update", newState: newState as unknown as Record<string, Json> },
  });
}

/**
 * Clear the state of the snap.
 *
 * This uses the `snap_manageState` JSON-RPC method to clear the state.
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_managestate
 * */
async function clearState() {
  await snap.request({
    method: "snap_manageState",
    params: { operation: "clear" },
  });
}

/**
 * Takes a {@link Json} object, validates it into {@link CubeSignerState}.
 * We assume the input is a plain object (e.g., constructed from JSON.parse or Object.assign).
 *
 * @param {Json} json Json object to covert to {@link CubeSignerState}.
 * @return {CubeSignerState} Validated sessoin.
 */
function validateSignerSession(json: Json): CubeSignerState {
  // Shape corresponding to CubeSignerState
  const shape = <Shape>{
    org_id: "string",
    role_id: "string",
    purpose: "string",
    token: "string",
    session_info: {
      auth_token: "string",
      auth_token_exp: "number",
      epoch: "number",
      epoch_token: "string",
      refresh_token: "string",
      refresh_token_exp: "number",
      session_id: "string",
    },
    env: {
      "Dev-CubeSignerStack": {
        ClientId: "string",
        Region: "string",
        UserPoolId: "string",
        SignerApiRoot: "string",
      },
    },
  };

  try {
    return sanitize<CubeSignerState>(json, shape); // throws if check fails
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    throw rpcErrors.invalidInput({
      message: `Invalid API session token: ${message}`,
    });
  }
}

/**
 * Parse and validate the base64 API session token.
 * @param {string} secretInput Base64 encoded API session token.
 * @return {CubeSignerState} Validated session.
 */
function parseAndValidateToken(secretInput: string): CubeSignerState {
  // parse token
  const secretB64Token = secretInput.replace(/\s/g, "");
  const secretApiToken = JSON.parse(atob(secretB64Token));
  // validate token
  return validateSignerSession(secretApiToken as Json);
}
