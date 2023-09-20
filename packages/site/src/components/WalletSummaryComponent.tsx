import { useCallback, useState } from "react";
import { WalletIcon } from "../assets";
import { Wallet } from "../utils";
import { Flex, Text } from "@chakra-ui/react";

/**
 *
 * @param {Wallet} props.wallet - wallet.
 * @param {boolean} props.showHover - toggle denoting if we want to have a hover state on this component.
 *
 * @returns Component to render.
 */
const WalletSummaryComponent = (props: { wallet: Wallet; showHover: boolean }) => {
  const { wallet, showHover } = props;

  /** Hover state tracker */
  const [hover, setHover] = useState(false);

  /** Handles mouse entering the component. */
  const handleMouseEnter = useCallback(() => {
    if (showHover) {
      setHover(true);
    }
  }, [showHover, setHover]);

  /** Handles mouse exiting the component. */
  const handleMouseExit = useCallback(() => {
    if (showHover) {
      setHover(false);
    }
  }, [showHover, setHover]);

  return (
    <Flex
      bg={"transparent"}
      align="center"
      gap={8}
      justify="left"
      padding={"16px 20px"}
      textAlign={"center"}
      cursor={"pointer"}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseExit}
    >
      <WalletIcon type={wallet.type} hover={hover} />
      <Text fontSize={16} maxWidth={80}>
        {wallet.materialId}
      </Text>
    </Flex>
  );
};

export default WalletSummaryComponent;
