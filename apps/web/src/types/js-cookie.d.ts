declare module "js-cookie" {
  interface CookiesStatic {
    get(name: string): string | undefined;
  }

  const Cookies: CookiesStatic;
  export default Cookies;
}

