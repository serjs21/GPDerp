import axios from "axios";
import { getTabId } from "./utils/tabId";

export const TAB_HEADER_KEY = "x-tab-id";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
axios.defaults.timeout = 15_000;

axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers[TAB_HEADER_KEY] = getTabId();


axios.interceptors.request.use((config) => {
config.headers[TAB_HEADER_KEY] = getTabId();
console.log('Setting header', TAB_HEADER_KEY, config.headers[TAB_HEADER_KEY]);
  const token = process.env.NEXT_PUBLIC_API_KEY;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


console.log("Axios iniailized with base URL:", axios.defaults.baseURL);