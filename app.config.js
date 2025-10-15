// Ensure .env is loaded for local development
try { require("dotenv").config(); } catch (_) {}

// Read from process.env at build time
module.exports = ({ config }) => {
  return {
    ...config,
    name: "JamStockAnalytics",
    slug: "jamstockanalytics",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./public/logo.svg",
    splash: {
      image: "./public/logo.svg",
      resizeMode: "contain",
      backgroundColor: "#000000"
    },
    web: {
      favicon: "./public/logo.svg",
      bundler: "metro",
    },
    extra: {
      SUPABASE_URL: process.env.SUPABASE_URL || "",
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
      eas: {
        projectId: config?.extra?.eas?.projectId,
      },
    },
  };
};


