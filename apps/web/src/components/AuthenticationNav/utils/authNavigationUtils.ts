import { FOOTER_PAGE_PATHS, SHARE_PAGE_PREFIX } from "../consts/authNavigationConsts";

/** Logged-out visitors get the guest menu on share links and footer pages. */
export function showsGuestMenu(pathname: string): boolean {
  if (pathname.startsWith(SHARE_PAGE_PREFIX)) return true;
  return (FOOTER_PAGE_PATHS as readonly string[]).includes(pathname);
}
