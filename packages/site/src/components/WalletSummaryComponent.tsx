import { Wallet } from "../utils";
import { Flex, Text, Spacer } from "@chakra-ui/react";

const WalletSummaryComponent = (props: { wallet: Wallet }) => {
  return (
    <Flex
      bg={"transparent"}
      align="center"
      gap={8}
      justify="left"
      margin={"20px"}
      textAlign={"center"}
      cursor={"pointer"}
    >
      <props.wallet.asset.Icon />
      <Text fontSize={16}>{props.wallet.materialId}</Text>
    </Flex>
  );
};

export default WalletSummaryComponent;
