const KEY = "tab-id";

export const getTabId = (): string => {
  if (typeof window === "undefined") {
    return "server";
  }

  let id = sessionStorage.getItem(KEY);
  
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(KEY, id);
  }

  return id;
}