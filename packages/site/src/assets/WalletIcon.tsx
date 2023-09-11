import { BitcoinIcon, EvmIcon, SolanaIcon } from ".";

interface WalletIconProps {
  type: string;
  hover: boolean;
}

/**
 * Display icon for a wallet.
 *
 * @param props properties needed to render the component.
 *
 * @returns component.
 */
export const WalletIcon = (props: WalletIconProps) => {
  const { type, hover } = props;
  switch (type) {
    case "SecpEthAddr": {
      return <EvmIcon hover={hover} />;
    }

    case "Ed25519SolanaAddr": {
      return <SolanaIcon hover={hover} />;
    }

    case "SecpBct":
    case "SecpBtcTest": {
      return <BitcoinIcon hover={hover} />;
    }
  }
};
