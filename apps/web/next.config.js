import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  transpilePackages: [
    "@cloudscape-design/components",
    "@cloudscape-design/board-components",
    "@cloudscape-design/global-styles",
    "@cloudscape-design/component-toolkit",
  ],
};

export default nextConfig;
