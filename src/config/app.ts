/** App-level configuration (per-deployment, not per-brand). */
export const APP = {
  /**
   * Deep link to the Telegram bot / Mini App, used by the outside-Telegram fallback
   * (QR + "Open in Telegram"). Set per-deploy via `VITE_BOT_URL` (e.g. Cloudflare Pages
   * env); falls back to a placeholder so the build still runs. Same kind of link the bot's
   * launch button and a `t.me/<bot>/<app>?startapp=…` deep link use (slice 8).
   */
  botUrl: import.meta.env.VITE_BOT_URL ?? 'https://t.me/your_storefront_bot',
};
