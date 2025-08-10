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
  // State to track whether the viewport is considered mobile
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    // Create a media query list for the mobile breakpoint
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Handler to update state based on current window width
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Listen for changes in the media query
    mql.addEventListener('change', onChange);

    // Set initial value on mount
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Cleanup listener on unmount
    return () => mql.removeEventListener('change', onChange);
  }, []);

  // Ensure the return value is always a boolean
  return !!isMobile;
}
