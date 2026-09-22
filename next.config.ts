import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {},
};

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  // Les médias lourds restent disponibles via le cache à la demande. Les précacher
  // faisait télécharger toutes les anciennes illustrations à chaque mise à jour PWA.
  publicExcludes: [
    "!illustrations/**/*",
    "!formation/**/*",
    "!specialisation/**/*",
  ],
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

export default withPWA(nextConfig);
