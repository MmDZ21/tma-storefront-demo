import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Back-navigation for subpages. Normally `navigate(-1)` — but when the current entry is
 * the FIRST in the session history (a `startapp` deep link straight into a product/cart,
 * slice 8, or a fresh reload on a subpage), there is nothing to go back to and
 * `navigate(-1)` would silently no-op, leaving the native BackButton visibly dead.
 * Fall back to the catalog instead, so "back" always goes somewhere.
 */
export function useGoBack(): () => void {
  const navigate = useNavigate();
  const location = useLocation();
  // React Router keys a session's first location 'default'; any pushed entry gets a
  // generated key. That distinguishes "deep-linked straight here" from "navigated here".
  const isFirstEntry = location.key === 'default';

  return () => {
    if (isFirstEntry) {
      navigate('/', { replace: true });
    } else {
      navigate(-1);
    }
  };
}
