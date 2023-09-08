import { useCallback, useContext } from "react";
import styled, { useTheme } from "styled-components";
import {
  CubeSignerActionType,
  CubeSignerContext,
  MetamaskActions,
  MetaMaskContext,
} from "../hooks";
import { connectSnap, getSnap, sendLogin, sendLogout } from "../utils";
import { CubeSignerLoginButton, CubeSignerLogoutButton, HeaderButtons } from "./Buttons";
import { ReactComponent as CubistLogo } from "../assets/cubist_logo.svg";
import { FaTrademark } from "react-icons/fa";

const HeaderWrapper = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 2.4rem;
`;

const Title = styled.p`
  font-size: ${(props) => props.theme.fontSizes.title};
  font-weight: bold;
  margin: 0;
  margin-left: 1.2rem;
  ${({ theme }) => theme.mediaQueries.small} {
    display: none;
  }
`;

const LogoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const RightContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const Header = ({ handleToggleClick }: { handleToggleClick(): void }) => {
  const theme = useTheme();
  const [state, metamaskDispatch] = useContext(MetaMaskContext);
  const [cubeSignerState, cubeSigerDispatch] = useContext(CubeSignerContext);

  /**
   * Enacts a login request using the provided API token.
   */
  const handleCubeSignerLogin = useCallback(async () => {
    try {
      const res = await sendLogin();
      if (res) {
        cubeSigerDispatch({
          type: CubeSignerActionType.TokenAuthenticated,
          payload: true,
        });
      }
    } catch (e) {
      console.error(e);
      metamaskDispatch({ type: MetamaskActions.SetError, payload: e });
    }
  }, [metamaskDispatch, cubeSigerDispatch]);

  /**
   * Logs user out of CubeSigner.
   */
  const handleCubeSignerLogout = useCallback(async () => {
    try {
      const res = await sendLogout();
      if (res) {
        cubeSigerDispatch({
          type: CubeSignerActionType.TokenRevoked,
          payload: false,
        });
      } else {
        metamaskDispatch({
          type: MetamaskActions.SetError,
          payload: { message: "logout failed for reasons unarticulated." },
        });
      }
    } catch (e) {
      console.error(e);
      metamaskDispatch({ type: MetamaskActions.SetError, payload: e });
    }
  }, [metamaskDispatch, cubeSigerDispatch]);

  const handleConnectClick = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();

      metamaskDispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (e) {
      console.error(e);
      metamaskDispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };
  return (
    <HeaderWrapper>
      <LogoWrapper>
        <CubistLogo color={theme.colors.icon.default} width={69} height={57} />
        <Title>
          cubist
          <FaTrademark />
        </Title>
      </LogoWrapper>
      <RightContainer>
        <HeaderButtons state={state} onConnectClick={handleConnectClick} />
        {cubeSignerState.authenticated ? (
          <CubeSignerLogoutButton onClick={handleCubeSignerLogout} />
        ) : (
          <CubeSignerLoginButton onClick={handleCubeSignerLogin} disabled={!state.installedSnap} />
        )}
      </RightContainer>
    </HeaderWrapper>
  );
};
