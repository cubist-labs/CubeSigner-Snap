import { useContext, useCallback } from "react";
import { CubeSignerContext, MetaMaskContext, MetamaskActions } from "../hooks";
import { connectSnap, getSnap, sendLogin } from "../utils";
import { ConnectButton, CubeSignerLoginButton } from "./Buttons";
import { Box } from "@chakra-ui/react";
import { CubeSignerActionType } from "../lib";

/**
 * Component for users to sign into their CubeSigner account.
 *
 * @returns SignIn Component
 */
export const SignInComponent = () => {
  const [metamaskState, metamaskDispatch] = useContext(MetaMaskContext);
  const [cubeSignerState, cubeSigerDispatch] = useContext(CubeSignerContext);

  /**
   * handles connecting to the snap.
   */
  const handleConnectClick = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();

      metamaskDispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });

      // auto trigger cubesigner login to save a click.
      handleCubeSignerLogin();
    } catch (e) {
      metamaskDispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  /**
   * Enacts a login request using the provided API token.
   */
  const handleCubeSignerLogin = useCallback(async () => {
    try {
      await sendLogin();
      cubeSigerDispatch({
        type: CubeSignerActionType.TokenAuthenticated,
        payload: true,
      });
    } catch (e) {
      metamaskDispatch({ type: MetamaskActions.SetError, payload: e });
    }
  }, [metamaskDispatch, cubeSigerDispatch]);

  return (
    <Box justifyContent={"center"} display={"flex"} margin={"64px 0"}>
      {!metamaskState.installedSnap && <ConnectButton onClick={handleConnectClick} />}
      {metamaskState.installedSnap && !cubeSignerState.authenticated && (
        <CubeSignerLoginButton onClick={handleCubeSignerLogin} />
      )}
    </Box>
  );
};
