import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// When deployed to GitHub Pages as a project site the app is served from
// https://<owner>.github.io/<repo>, so it needs a base path. The Pages
// workflow sets NEXT_PUBLIC_BASE_PATH (e.g. "/stackdeck"); locally it is empty.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath,
  // Static export cannot use the Next.js image optimizer.
  images: { unoptimized: true },
  // Emit folder-style URLs (about/index.html) so they work as static files.
  trailingSlash: true,
  outputFileTracingRoot: path.join(__dirname, "../../"),
  transpilePackages: [
    "@cloudscape-design/components",
    "@cloudscape-design/board-components",
    "@cloudscape-design/collection-hooks",
    "@cloudscape-design/global-styles",
    "@cloudscape-design/component-toolkit",
  ],
};

export default nextConfig;
