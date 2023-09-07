/* eslint-disable require-jsdoc */

import { installSnap } from "@metamask/snaps-jest";
import { expect } from "@jest/globals";

describe("onRpcRequest", () => {
  it("throws an error if the requested method does not exist", async () => {
    const cs = await installSnap();

    const response = await cs.request({
      method: "foo",
    });

    expect(response).toRespondWithError({
      code: -32603,
      message: "Internal JSON-RPC error.",
      data: {
        cause: {
          message: "Method not found: foo",
          stack: expect.any(String),
        },
      },
    });
  });
});
