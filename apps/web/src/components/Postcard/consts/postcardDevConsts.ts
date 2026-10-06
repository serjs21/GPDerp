import type { HaikuDto } from "@/api/haikus";

export const POSTCARD_DEV_SAMPLE_HAIKU: HaikuDto = {
  id: "postcard-dev-sample",
  title: "Lantern night",
  titleSuffix: 0,
  body: "Paper lantern glows\nabove the sleeping pagoda\nthe moon leans closer\n— Indra's Nest",
  createdAt: "2026-10-06T12:00:00.000Z",
  accountId: "postcard-dev-account",
  createdById: "postcard-dev-user",
  labels: [],
};

export const POSTCARD_DEV_SAMPLE_MESSAGE =
  "I saw this lantern & had to send it to you!\nRemember our trip to Kyoto?\nWish you were here.";

export const POSTCARD_DEV_SAMPLE_RECIPIENTS = ["tony.kim@example.com", "mei.lin@example.com"];
