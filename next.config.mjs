import team from "./src/config/team.config.json" with { type: "json" };

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  basePath: process.env.CAPACITOR === "true" ? "" : team.basePath,
};

export default nextConfig;
