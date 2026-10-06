import axios from "axios";

export type ServerPostcardBackParams = {
  message: string;
  senderName: string;
  recipient: string;
};

/** Dev-only API route (disabled in production) returning the server-rendered postcard back PNG. */
export const fetchServerPostcardBack = async (params: ServerPostcardBackParams): Promise<Blob> => {
  const { data } = await axios.get<Blob>("/dev/postcard_back.png", { params, responseType: "blob" });
  return data;
};
