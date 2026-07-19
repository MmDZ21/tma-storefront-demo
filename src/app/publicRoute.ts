interface OutsideTelegramFallbackInput {
  inTelegram: boolean;
  hash: string;
  previewFallback: boolean;
}

function isPublicSalesRoute(hash: string): boolean {
  return (
    hash === '#/build-yours' ||
    hash.startsWith('#/build-yours/') ||
    hash.startsWith('#/build-yours?')
  );
}

export function shouldShowOutsideTelegramFallback({
  inTelegram,
  hash,
  previewFallback,
}: OutsideTelegramFallbackInput): boolean {
  return previewFallback || (!inTelegram && !isPublicSalesRoute(hash));
}

/**
 * Some browsers / automation apply `location.hash` one task after navigation to
 * `https://host/#/route`. Waiting briefly prevents misclassifying `#/build-yours`
 * as the outside-Telegram fallback when the hash is still empty at bootstrap.
 */
export function waitForBootstrapHash(timeoutMs = 50): Promise<string> {
  if (typeof window === 'undefined') return Promise.resolve('');
  if (window.location.hash) return Promise.resolve(window.location.hash);

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.removeEventListener('hashchange', onHash);
      window.clearTimeout(timer);
      resolve(window.location.hash);
    };
    const onHash = () => finish();
    window.addEventListener('hashchange', onHash);
    const timer = window.setTimeout(finish, timeoutMs);
  });
}
