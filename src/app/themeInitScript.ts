/**
 * Runs in <head> before first paint and sets `data-theme` on <html>, so a
 * light-theme visitor never sees the dark server render first.
 *
 * Static and parameter-free: the edge HTML cache requires the page to depend
 * only on the URL, so the choice happens client-side, never from a cookie.
 * Same precedence as `ThemeContext`: saved choice, then the OS preference.
 * Wrapped in try/catch because localStorage throws in some privacy modes.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){}})();`;
