import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Emit each route as <route>/index.html instead of <route>.html so the
  // static host (nginx `try_files $uri $uri/`) resolves /blog and /cookies on
  // direct load and refresh. Without this, flat .html files only worked via
  // client-side navigation and 404'd on a hard request.
  trailingSlash: true,
};

export default nextConfig;
