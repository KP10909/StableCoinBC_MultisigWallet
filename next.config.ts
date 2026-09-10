import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Local development can be opened through either loopback hostname.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
