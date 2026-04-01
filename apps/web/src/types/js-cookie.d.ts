declare module "js-cookie" {
  type CookieAttributes = {
    path?: string;
  };

  interface CookiesStatic {
    get(name: string): string | undefined;
    remove(name: string, attributes?: CookieAttributes): void;
  }

  const Cookies: CookiesStatic;
  export default Cookies;
}

