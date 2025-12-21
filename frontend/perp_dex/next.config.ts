import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    outputFileTracingRoot: path.join(__dirname),
    optimizePackageImports: ["lucide-react"],
  },
  webpack: (config) => {
    // Alias module React Native bị lỗi sang file rỗng
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@react-native-async-storage/async-storage": path.resolve(
        __dirname,
        "emptyModule.js",
      ),
      "supports-color": path.resolve(__dirname, "emptyModule.js"),
    };

    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      path: false,
    };

    return config;
  },
};

export default nextConfig;
