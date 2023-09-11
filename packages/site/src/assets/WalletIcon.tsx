/**
 * Properties needed/suggested for rendering a wallet icon.
 */
interface WalletIconProps {
  /** background color */
  background: string;
  /** top left shape color */
  topLeft?: string;
  /** top right shape color */
  topRight?: string;
  /** bottom right shape color */
  bottomRight?: string;
  /** bottom left shape color */
  bottomLeft?: string;
}

/**
 * Creates an icon we use to accompany wallet information.
 *
 * @param {WalletIconProps} props
 *
 * @returns An icon we display for a wallet summary.
 */
export const WalletIcon = (props: WalletIconProps) => {
  const iconColors = props;

  return (
    <svg width="48" height="48" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="54" height="54" rx="14.2941" fill={iconColors.background} />
      <rect
        x="0.5"
        y="0.5"
        width="53"
        height="53"
        rx="13.7941"
        stroke="black"
        strokeOpacity="0.1"
      />
      <path
        d="M15.3615 26.7773L16.9784 26.7773L27.3296 26.7773L27.3296 21.6587L15.2502 14.2962L11.9117 14.2962L11.9117 16.3169L11.9117 21.5503L11.9117 24.1638L11.9117 26.7773L15.3615 26.7773Z"
        fill={iconColors.topLeft}
      />
      <path
        d="M16.9784 26.2773L15.3615 26.2773L12.4117 26.2773L12.4117 24.1638L12.4117 21.5503L12.4117 16.3169L12.4117 14.7962L15.1099 14.7962L26.8296 21.9395L26.8296 26.2773L16.9784 26.2773Z"
        stroke="black"
        strokeOpacity="0.1"
      />
      <path
        d="M24.345 39.9922L22.7281 39.9922L12.377 39.9922L12.377 34.5724L24.4563 26.7769L27.7948 26.7769L27.7948 28.9164L27.7948 34.4577L27.7948 37.2249L27.7948 39.9922L24.345 39.9922Z"
        fill={iconColors.bottomLeft}
      />
      <path
        d="M22.7281 39.4922L24.345 39.4922L27.2948 39.4922L27.2948 37.2249L27.2948 34.4577L27.2948 28.9164L27.2948 27.2769L24.6036 27.2769L12.877 34.8448L12.877 39.4922L22.7281 39.4922Z"
        stroke="black"
        strokeOpacity="0.1"
      />
      <path
        d="M42.7475 37.1667V26.7769H27.3296V39.9922H40.0194L42.7475 37.1667Z"
        fill={iconColors.bottomRight}
      />
      <path
        d="M39.8071 39.4922L42.2475 36.9647V27.2769H27.8296V39.4922H39.8071Z"
        stroke="black"
        strokeOpacity="0.1"
      />
    </svg>
  );
};
