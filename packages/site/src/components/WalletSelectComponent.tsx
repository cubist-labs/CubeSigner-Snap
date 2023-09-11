import { Box } from "@chakra-ui/react";
import Select, {
  components,
  SingleValueProps,
  MultiValue,
  OptionProps,
  SingleValue,
  StylesConfig,
} from "react-select";
import { Wallet } from "../utils";
import { FC, useCallback } from "react";
import WalletSummaryComponent from "./WalletSummaryComponent";

const WalletSelectOptionComponent = (props: OptionProps<Wallet>) => {
  const wallet = props.data;

  return (
    <components.Option {...props} key={wallet.id} data-key-id={wallet.id}>
      <Box cursor={"pointer"} textAlign={"center"} height={"inherit"} bg={"transparent"}>
        <WalletSummaryComponent wallet={wallet} showHover={true} />
      </Box>
    </components.Option>
  );
};

const WalletSelectSingleValueComponent = (props: SingleValueProps<Wallet>) => {
  return <WalletSummaryComponent wallet={props.data} showHover={false} />;
};

interface WalletSelectProps {
  wallets: Wallet[];
  onSelectHandler: (wallet: Wallet) => void;
  selectedWallet?: Wallet;
}

const styles: StylesConfig<Wallet> = {
  control: (styles, state) => ({
    ...styles,
    border: "1px solid #F7F5F0",
    boxShadow: "none",
    borderRadius: state.menuIsOpen ? "22px 22px 0 0" : "22px",
    background: "#EEE7DD",
    height: "92px",
  }),
  menu: (styles) => ({
    ...styles,
    margin: 0,
    borderRadius: "0 0 22px 22px",
    border: "1px",
    borderTop: 0,
    borderStyle: "solid",
    borderColor: "#F7F5F0",
    background: "#EEE7DD",
  }),
  menuList: (styles) => ({
    ...styles,
    borderRadius: "0 0 22px 22px",
    background: "#EEE7DD",
    scrollbarWidth: "none",
  }),
  valueContainer: (styles) => ({
    ...styles,
    border: "none",
    boxShadow: "none",
    display: "absolute",
    marginLeft: "-8px",
  }),
  indicatorSeparator: () => ({
    // intentional no-op to remove default separator
  }),
  indicatorsContainer: (styles) => ({
    ...styles,
    background: "transparent",
    height: "inherit",
  }),
  dropdownIndicator: () => ({
    background: "transparent",
    marginRight: 16,
  }),
  option: () => ({
    height: "64px",
    padding: "2px 16px",
    background: "transparent",
    "&:hover": {},
  }),
};

export const WalletSelect: FC<WalletSelectProps> = (props) => {
  const { wallets, selectedWallet, onSelectHandler } = props;

  const onChange = useCallback(
    (wallet: SingleValue<Wallet> | MultiValue<Wallet>) => {
      const newWallet = wallet as SingleValue<Wallet>;
      onSelectHandler(newWallet!);
    },
    [onSelectHandler]
  );

  return (
    <Select
      {...props}
      styles={styles}
      onChange={onChange}
      isSearchable={false}
      value={selectedWallet}
      components={{
        Option: WalletSelectOptionComponent,
        SingleValue: WalletSelectSingleValueComponent,
      }}
      options={wallets}
      className="basic-single"
    />
  );
};
