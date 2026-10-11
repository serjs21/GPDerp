import type { ShareLinksSortCategory, ShareLinksSortValue } from "./consts/shareLinksSortConsts";

export type ShareLinksSortCoinProps = {
  category: ShareLinksSortCategory;
  value: ShareLinksSortValue;
  onChange: (next: ShareLinksSortValue) => void;
  titleFontSizeRem: number;
  sizeRem: number;
  disabled: boolean;
};
