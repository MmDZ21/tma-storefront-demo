interface OutsideTelegramFallbackInput {
  inTelegram: boolean;
  hash: string;
  previewFallback: boolean;
}

function isPublicSalesRoute(hash: string): boolean {
  return hash === '#/build-yours' || hash.startsWith('#/build-yours/') || hash.startsWith('#/build-yours?');
}

export function shouldShowOutsideTelegramFallback({
  inTelegram,
  hash,
  previewFallback,
}: OutsideTelegramFallbackInput): boolean {
  return previewFallback || (!inTelegram && !isPublicSalesRoute(hash));
}
