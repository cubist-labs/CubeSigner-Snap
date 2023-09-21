import { useCallback, useContext } from "react";
import styled from "styled-components";
import { CubeSignerContext, MetamaskActions, MetaMaskContext } from "../hooks";
import { connectSnap, getSnap, sendLogout, shouldDisplayReconnectButton } from "../utils";
import { LogoutButton, ReconnectButton } from "./Buttons";
import { ReactComponent as CubistLogo } from "../assets/cubist_text_logo.svg";
import { CubeSignerActionType } from "../lib";

const HeaderWrapper = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 4.2rem;
`;

const RightContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const Header = ({ handleToggleClick }: { handleToggleClick(): void }) => {
  const [state, metamaskDispatch] = useContext(MetaMaskContext);
  const [cubeSignerState, cubeSigerDispatch] = useContext(CubeSignerContext);

  const handleConnectClick = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();

      metamaskDispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (e) {
      metamaskDispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  /**
   * Logs user out of CubeSigner.
   */
  const handleCubeSignerLogout = useCallback(async () => {
    try {
      await sendLogout();
      cubeSigerDispatch({
        type: CubeSignerActionType.TokenRevoked,
        payload: false,
      });
    } catch (e) {
      metamaskDispatch({ type: MetamaskActions.SetError, payload: e });
    }
  }, [metamaskDispatch, cubeSigerDispatch]);

  return (
    <HeaderWrapper>
      <CubistLogo />
      <RightContainer>
        {shouldDisplayReconnectButton(state.installedSnap) && (
          <ReconnectButton onClick={handleConnectClick} />
        )}
        {cubeSignerState.authenticated && (
          <LogoutButton onClick={handleCubeSignerLogout}>Log out</LogoutButton>
        )}
      </RightContainer>
    </HeaderWrapper>
  );
};
