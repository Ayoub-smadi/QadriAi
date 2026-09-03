export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const UNAUTHED_ERR_MSG = "Please login (10001)";
export const OAUTH_STATE_COOKIE = "__Host-oauth_state";

export type OAuthState = { redirectUri: string; nonce?: string };

export const encodeOAuthState = (state: OAuthState): string =>
  btoa(JSON.stringify(state));