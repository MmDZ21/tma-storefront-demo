import { Bot, InlineKeyboard } from 'grammy';

/**
 * Minimal Telegram bot (grammY · Node 20) — SPEC §6/§8. Its ONLY job is to launch the
 * Mini App. It runs via long-polling and exposes NO HTTP endpoint, NO authenticated
 * route, and NO payment / on-chain logic — so it consumes no Telegram `initData` and
 * needs no server-side validation here. (When a real backend is added, validate initData
 * per `server-notes.md` §1; the payment trust boundary is documented there too.)
 *
 * Config via env — never committed (see `.env.example`):
 *   BOT_TOKEN    @BotFather token
 *   WEB_APP_URL  deployed Mini App URL (https), e.g. the Cloudflare Pages origin
 *
 * Run: `npm run bot` (after exporting the env, or via a local .env loaded by your process
 * manager). Deploy: pm2 on the VPS (SPEC §8) — pm2 config is deploy-specific, not in git.
 */
const token = process.env.BOT_TOKEN;
const webAppUrl = process.env.WEB_APP_URL;

if (!token) throw new Error('BOT_TOKEN is required — see .env.example');
if (!webAppUrl) throw new Error('WEB_APP_URL is required — see .env.example');

const bot = new Bot(token);

// /start → an inline keyboard with a web_app button that opens the Mini App (SPEC §6).
const openStore = new InlineKeyboard().webApp('🛍️ Open the store', webAppUrl);
bot.command('start', async (ctx) => {
  await ctx.reply('Welcome! Tap below to open the storefront — it runs right here in Telegram.', {
    reply_markup: openStore,
  });
});

bot.catch((error) => console.error('[bot] update error:', error));

async function main(menuUrl: string): Promise<void> {
  // Persistent menu button (next to the input) also launches the app.
  await bot.api.setChatMenuButton({
    menu_button: { type: 'web_app', text: 'Store', web_app: { url: menuUrl } },
  });
  console.log('[bot] launcher online (long-polling).');
  await bot.start();
}

// `webAppUrl` is narrowed to string here (after the guard); passing it as a typed param
// keeps that type inside the async function.
main(webAppUrl).catch((error) => {
  console.error('[bot] fatal:', error);
  process.exitCode = 1;
});
