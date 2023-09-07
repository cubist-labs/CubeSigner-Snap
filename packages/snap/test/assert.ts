import { SnapResponse } from "@metamask/snaps-jest";
import { Json } from "@metamask/snaps-types";
import { expect } from "@jest/globals";

/* eslint-disable require-jsdoc */

export function assertOk(resp: SnapResponse): Json {
  expect(resp.response).toHaveProperty("result");
  return (resp.response as { result: Json }).result;
}

export function assertInvalidParams(resp: SnapResponse) {
  expect(resp).toRespondWithError({
    code: -32603,
    message: "Internal JSON-RPC error.",
    data: {
      cause: {
        message: expect.stringMatching("Invalid RPC Params"),
        stack: expect.any(String),
      },
    },
  });
}

export function assertUserRejected(resp: SnapResponse) {
  expect(resp).toRespondWithError({
    code: -32603,
    message: "Internal JSON-RPC error.",
    data: {
      cause: {
        message: "User rejected the request.",
        stack: expect.any(String),
      },
    },
  });
}
