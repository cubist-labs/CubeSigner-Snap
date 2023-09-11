import { useContext, useEffect, useState } from "react";
import { Container, ErrorMessage, Heading, Subtitle } from "../components/_styledElements";
import { CubeSignerContext, MetaMaskContext } from "../hooks";
import { SignInComponent, SignerComponent, WalletsComponent } from "../components";

const Index = () => {
  const [cubeSignerState, _cubeSigerDispatch] = useContext(CubeSignerContext);
  const [metamaskState, _metamaskDispatch] = useContext(MetaMaskContext);

  // note - didn't feel like implementing dynamic paging / higher level auth checks.
  // we can consider doing that if this become more than a quick demo.

  const [viewTitle, setViewTitle] = useState<string>();
  const [viewSubTitle, setViewSubTitle] = useState<string>();

  /**
   * Handle title update on state change.
   */
  useEffect(() => {
    if (!cubeSignerState.authenticated) {
      setViewTitle("Welcome to CubeSigner Snap");
      setViewSubTitle("Please log in to continue");
    } else if (cubeSignerState.authenticated && !cubeSignerState.selectedWallet) {
      setViewTitle("Your Wallets");
      setViewSubTitle("");
    } else {
      setViewSubTitle("");
      // in transaction state, finer selections.
      if (cubeSignerState.sending) {
        setViewTitle("Sending...");
      } else if (cubeSignerState.error) {
        setViewTitle("Error");
        setViewSubTitle("Unable to sign transaction, please try again.");
      } else if (cubeSignerState.tx) {
        setViewTitle("Transaction Successful!");
      } else {
        setViewTitle(`Send ${cubeSignerState.provider?.chain.asset.displayName || ""}`);
      }
    }
  }, [cubeSignerState]);

  return (
    <Container>
      <Heading>{viewTitle}</Heading>
      {viewSubTitle && <Subtitle>{viewSubTitle}</Subtitle>}
      {metamaskState.error && (
        <ErrorMessage>
          <b>An error happened:</b> {metamaskState.error.message}
        </ErrorMessage>
      )}
      {!cubeSignerState.authenticated && <SignInComponent />}
      {cubeSignerState.authenticated && !cubeSignerState.selectedWallet && <WalletsComponent />}
      {cubeSignerState.selectedWallet && <SignerComponent />}
    </Container>
  );
};

export default Index;
