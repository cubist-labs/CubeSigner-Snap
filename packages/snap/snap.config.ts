import type { SnapConfig } from "@metamask/snaps-cli";
import { merge } from "@metamask/snaps-cli";
import { resolve } from "path";
import { DefinePlugin } from "webpack";

const config: SnapConfig = {
  bundler: "webpack",
  input: resolve(__dirname, "src/index.ts"),
  server: {
    port: 8080,
  },
  output: {
    minimize: false,
  },
  polyfills: true,
  stats: {
    builtIns: {
      ignore: ["fs"],
    },
  },
  customizeWebpackConfig: (defaultConfig) =>
    merge(defaultConfig, {
      plugins: [
        new DefinePlugin({
          process: `(${JSON.stringify({
            browser: true,
            env: {},
            versions: {
              node: process.version,
            },
          })})`,
        }),
      ],
    }),
};

export default config;
