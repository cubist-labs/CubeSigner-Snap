import { useContext } from "react";
import { MetaMaskContext, CubeSignerContext } from "../hooks";
import { Container, ErrorMessage, Heading, Span, Subtitle } from "../components/_styledElements";
import { SignerComponent } from "../components";

const Index = () => {
  const [metamaskState, _metamaskDispatch] = useContext(MetaMaskContext);
  const [cubeSignerState, _cubeSigerDispatch] = useContext(CubeSignerContext);
  return (
    <Container>
      <Heading>
        Welcome to <Span>CubeSigner</Span>
      </Heading>
      <Subtitle>
        To get started, connect to your MetaMask Wallet, then sign in using your authentication
        token (base64)
      </Subtitle>
      {metamaskState.error && (
        <ErrorMessage>
          <b>An error happened:</b> {metamaskState.error.message}
        </ErrorMessage>
      )}
      {cubeSignerState.authenticated && <SignerComponent />}
    </Container>
  );
};

export default Index;
