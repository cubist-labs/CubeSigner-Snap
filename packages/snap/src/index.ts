import { OnRpcRequestHandler } from "@metamask/snaps-types";
import { login, logout } from "./session";
import { getKeys } from "./keys";
import { signBlob, signBtc, signEvm, signSolana } from "./sign";

export const onRpcRequest: OnRpcRequestHandler = async (rpc) => {
  switch (rpc.request.method) {
    case "login":
      return await login(rpc);
    case "logout":
      return await logout(rpc);
    case "get_keys":
      return await getKeys();
    case "sign_blob":
      return await signBlob(rpc);
    case "sign_evm":
      return await signEvm(rpc);
    case "sign_solana":
      return await signSolana(rpc);
    case "sign_btc":
      return await signBtc(rpc);
    default:
      throw new Error(`Method not found: ${rpc.request.method}`);
  }
};
