export const localCookieSecret = "al-qadri-local-session-secret-v1";

const configuredForgeUrl = process.env.BUILT_IN_FORGE_API_URL?.trim() || process.env.OPENAI_API_BASE?.trim() || "";
const configuredForgeKey = process.env.BUILT_IN_FORGE_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim() || "";

export const ENV = {
  appId: process.env.VITE_APP_ID?.trim() || "al-qadri-local",
  cookieSecret: process.env.JWT_SECRET?.trim() || (process.env.NODE_ENV === "production" ? "" : localCookieSecret),
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: configuredForgeUrl.replace(/\/v1\/?$/, ""),
  forgeApiKey: configuredForgeKey,
  shopifyStoreDomain: process.env.SHOPIFY_STORE_DOMAIN ?? "",
  shopifyStorefrontApiAccessToken: process.env.SHOPIFY_STOREFRONT_API_ACCESS_TOKEN ?? "",
};
