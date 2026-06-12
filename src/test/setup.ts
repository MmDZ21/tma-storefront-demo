import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup, configure } from '@testing-library/react';

// The async screens here chain two fetches (brand → products). Under heavy
// parallel jsdom load the default 1s findBy timeout can flake, so give async
// queries more headroom (isolated runs resolve in well under 300ms).
configure({ asyncUtilTimeout: 3000 });

// Unmount React trees and reset jsdom between tests.
afterEach(() => {
  cleanup();
});
