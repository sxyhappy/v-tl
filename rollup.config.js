import vue from "rollup-plugin-vue";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "./src/index.js",
  output: {
    format: "cjs",
    file: "dist/v-tl.js",
  },
  external: ["vue"],
  plugins: [nodeResolve({ extensions: [".vue", ".js"] }), vue()],
};
