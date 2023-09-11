import { useCallback, useContext } from "react";
import { CubeSignerContext, useWallets } from "../hooks";
import { Box, SimpleGrid, Spinner, Text } from "@chakra-ui/react";
import { CubeSignerActionType } from "../lib";
import WalletSummaryComponent from "./WalletSummaryComponent";

/**
 * Creates our wallets list splash page.
 *
 * @returns Wallets view component.
 */
export const WalletsComponent = () => {
  const [_cubeSignerState, cubeSigerDispatch] = useContext(CubeSignerContext);
  const { wallets, loadingWallets, loadingWalletsError } = useWallets();

  const onWalletClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const keyId = e.currentTarget.getAttribute("data-id");
      const wallet = wallets?.find((wallet) => wallet.id === keyId)!;

      cubeSigerDispatch({
        type: CubeSignerActionType.WalletSelected,
        payload: wallet,
      });
    },
    [cubeSigerDispatch, wallets]
  );

  return (
    <Box display={"flex"} margin={"64px 0"}>
      {loadingWallets && <Spinner />}
      {loadingWalletsError && (
        <Text display={"flex"} margin={"64px 0"}>
          Failed to load keys, considering logging out and providing a new token.
        </Text>
      )}
      {!loadingWallets && !loadingWalletsError && (
        <SimpleGrid columns={2} gap={16}>
          {wallets?.map((wallet) => {
            return (
              <Box
                key={wallet.id}
                data-id={wallet.id}
                height={88}
                cursor={"pointer"}
                width={572}
                borderRadius={"22px"}
                bg={"rgba(247, 245, 240, 0.40)"}
                border={"1px solid #F7F5F0"}
                onClick={onWalletClick}
              >
                <WalletSummaryComponent wallet={wallet} />
              </Box>
            );
          })}
        </SimpleGrid>
      )}
    </Box>
  );
};
