import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Custom React hook that determines if the current viewport width
 * is below the mobile breakpoint.
 *
 * @returns `true` if the viewport width is less than 768 pixels, otherwise `false`.
 *
 * @remarks
 * - The hook uses `window.matchMedia` to listen for changes in viewport width.
 * - It initializes `isMobile` as `undefined` to avoid false positives during SSR.
 * - The return value is always a boolean (`true` or `false`), never `undefined`.
 *
 * @example
 * ```tsx
 * const isMobile = useIsMobile();
 * if (isMobile) {
 *   // Render mobile layout
 * } else {
 *   // Render desktop layout
 * }
 * ```
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}
