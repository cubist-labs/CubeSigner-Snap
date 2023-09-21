import Select, {
  MultiValue,
  OptionProps,
  SingleValue,
  SingleValueProps,
  StylesConfig,
  components,
} from "react-select";
import { Chain } from "../utils";
import { FC, useCallback } from "react";
import { Box, Text } from "@chakra-ui/react";

interface ChainSelectProps {
  chains: Chain[];
  onSelectHandler: (chain: Chain) => void;
  chain: Chain | null;
}

const ChainSelectOptionComponent = (props: OptionProps<Chain>) => {
  const chain = props.data;

  return (
    <components.Option {...props} key={chain.name} data-key-id={chain.name}>
      <Box cursor={"pointer"} textAlign={"center"} height={"inherit"} bg={"transparent"}>
        <Text float={"left"} bg={"transparent"}>
          {chain.displayName}
        </Text>
      </Box>
    </components.Option>
  );
};

const ChainSelectSingleValueComponent = (props: SingleValueProps<Chain>) => {
  const chain = props.data;
  return (
    <Box
      margin={"0px 0px 16px 16px"}
      cursor={"pointer"}
      textAlign={"center"}
      height={"inherit"}
      bg={"transparent"}
    >
      <Text float={"left"} bg={"transparent"}>
        {chain.displayName}
      </Text>
    </Box>
  );
};

/**
 * Styles layout for component.
 *
 * TODO acadams - establish base select, this and WalletSelectComponent share a lot of similarities.
 */
const styles: StylesConfig<Chain> = {
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
  placeholder: (styles) => ({
    ...styles,
    background: "transparent",
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
    borderRadius: "22px",
    background: "transparent",
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

export const ChainSelect: FC<ChainSelectProps> = (props) => {
  const { chains, chain, onSelectHandler } = props;

  const onChange = useCallback(
    (chain: SingleValue<Chain> | MultiValue<Chain>) => {
      const newChain = chain as SingleValue<Chain>;
      onSelectHandler(newChain!);
    },
    [onSelectHandler]
  );

  return (
    <Select
      {...props}
      styles={styles}
      onChange={onChange}
      isSearchable={false}
      value={chain}
      components={{
        Option: ChainSelectOptionComponent,
        SingleValue: ChainSelectSingleValueComponent,
      }}
      options={chains}
      className="basic-single"
    />
  );
};
