import { ComponentProps } from "react";
import styled from "styled-components";

export const Button = styled.button`
  display: flex;
  align-self: flex-start;
  align-items: center;
  margin-left: 8px;
  justify-content: center;
  margin-top: auto;
  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
  }
`;

export const LargeButton = styled.button`
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  margin-left: 8px;
  justify-content: center;
  margin-top: auto;
  font-size: 18px;
  font-style: normal;
  line-height: 18px;
  font-weight: 400;
  width: auto;
  height: auto;
  padding: 25px 50px;
  gap: 10px;
  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
  }
`;

export const LogoutButton = styled.button`
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  margin-left: 8px;
  justify-content: center;
  margin-top: auto;
  font-size: 16px;
  font-style: normal;
  line-height: 18px;
  font-weight: 400;
  padding: 11px 16px;
  height: auto;
  width: auto;
  gap: 10px;
  background-color: #f7f5f0;
  color: #ed643d;
  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
  }
`;

export const ConnectButton = (props: ComponentProps<typeof Button>) => {
  return <LargeButton {...props}>Connect MetaMask</LargeButton>;
};

export const ReconnectButton = (props: ComponentProps<typeof Button>) => {
  return <Button {...props}>Reconnect</Button>;
};

export const CubeSignerLoginButton = (props: ComponentProps<typeof Button>) => {
  return <LargeButton {...props}>Log in to CubeSigner</LargeButton>;
};
