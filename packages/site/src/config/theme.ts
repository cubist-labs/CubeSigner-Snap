import { createGlobalStyle, DefaultTheme } from "styled-components";

const breakpoints = ["600px", "768px", "992px"];

/**
 * Common theme properties.
 */
const theme = {
  fonts: {
    default:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  },
  fontSizes: {
    heading: "9.4rem",
    mobileHeading: "3.6rem",
    title: "2.4rem",
    large: "2rem",
    text: "1.6rem",
    small: "1.4rem",
  },
  radii: {
    default: "50px",
    button: "50px",
  },
  breakpoints,
  mediaQueries: {
    small: `@media screen and (max-width: ${breakpoints[0]})`,
    medium: `@media screen and (min-width: ${breakpoints[1]})`,
    large: `@media screen and (min-width: ${breakpoints[2]})`,
  },
  shadows: {},
};

/**
 * Light theme color properties.
 */
export const light: DefaultTheme = {
  colors: {
    background: {
      default: "#E8DDD1",
      inverse: "#000C49",
    },
    icon: {
      default: "#000C49",
      alternative: "#BBC0C5",
    },
    text: {
      default: "#0F1B54",
      muted: "#6A737D",
      inverse: "#F7F5F0",
    },
    buttonText: {
      default: "#F7F5F0",
      muted: "#6A737D",
      inverse: "#ED633D",
    },
    border: {
      default: "#BBC0C5",
    },
    primary: {
      default: "#ED633D",
      inverse: "#F7F5F0",
    },
    error: {
      default: "#d73a49",
      alternative: "#b92534",
      muted: "#d73a4919",
    },
  },
  ...theme,
};

/**
 * Dark theme color properties
 */
export const dark: DefaultTheme = {
  colors: {},
  ...theme,
};

/**
 * Default style applied to the app.
 *
 * @param props - Styled Components props.
 * @return Global style React component.
 */
export const GlobalStyle = createGlobalStyle`
  html {
    /* 62.5% of the base size of 16px = 10px.*/
    font-size: 62.5%;
  }

  body {
    background: ${(props) => props.theme.colors.background.default} !important;
    color: ${(props) => props.theme.colors.text.default};
    font-family: ${(props) => props.theme.fonts.default};
    font-size: ${(props) => props.theme.fontSizes.text};
    margin: 0;
  }

  h1, h2, h3, h4, h5, h6 {
    font-size: ${(props) => props.theme.fontSizes.heading};
    font-weight: 400;
    line-height: 100px;
    ${(props) => props.theme.mediaQueries.small} {
      font-size: ${(props) => props.theme.fontSizes.mobileHeading};
    }
  }

  button {
    font-size: ${(props) => props.theme.fontSizes.small};
    border-radius: ${(props) => props.theme.radii.button};
    background-color: ${(props) => props.theme.colors.primary.default};
    color: ${(props) => props.theme.colors.buttonText.default};
    border: 1px solid ${(props) => props.theme.colors.primary.default};
    padding: 1rem;
    min-height: 4.2rem;
    cursor: pointer;
    transition: all .2s ease-in-out;

    &:hover {
      background-color: transparent;
      border: 1px solid ${(props) => props.theme.colors.primary.default};
      color: ${(props) => props.theme.colors.buttonText.inverse};
    }

    &:disabled,
    &[disabled] {
      cursor: not-allowed;
    }

    &:disabled:hover,
    &[disabled]:hover {
      background-color: ${(props) => props.theme.colors.primary.default};
      color: ${(props) => props.theme.colors.buttonText.default};
      border: 1px solid ${(props) => props.theme.colors.primary.default};
      }
  }
`;
