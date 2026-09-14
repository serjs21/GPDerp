import type { InfiniteData } from "@tanstack/react-query";
import type { ShareLinkListItem } from "@/api/shareLinks";

export const SHARE_LINKS_QUERY_KEY = ["share-links"] as const;

export type ShareLinksPage = {
  items: ShareLinkListItem[];
  total: number;
  pageSize: number;
  offset: number;
};

export type ShareLinksInfiniteData = InfiniteData<ShareLinksPage, number>;

export function patchShareLinksCache(
  data: ShareLinksInfiniteData | undefined,
  patch: ShareLinkListItem,
): ShareLinksInfiniteData | undefined {
  if (!data) return data;

  let found = false;
  const pages = data.pages.map((page) => ({
    ...page,
    items: page.items.map((item) => {
      if (item.id !== patch.id) return item;
      found = true;
      return { ...item, ...patch };
    }),
  }));

  if (found) {
    return { ...data, pages };
  }

  const [first, ...rest] = pages;
  if (!first) {
    return {
      ...data,
      pages: [{ items: [patch], total: 1, pageSize: 50, offset: 0 }],
      pageParams: data.pageParams.length > 0 ? data.pageParams : [0],
    };
  }

  return {
    ...data,
    pages: [{ ...first, items: [patch, ...first.items], total: first.total + 1 }, ...rest],
  };
}

export function removeShareLinkFromCache(
  data: ShareLinksInfiniteData | undefined,
  id: string,
): ShareLinksInfiniteData | undefined {
  if (!data) return data;

  let removed = false;
  const pages = data.pages.map((page) => {
    const nextItems = page.items.filter((item) => {
      if (item.id !== id) return true;
      removed = true;
      return false;
    });
    if (nextItems.length === page.items.length) return page;
    return {
      ...page,
      items: nextItems,
      total: Math.max(0, page.total - 1),
    };
  });

  if (!removed) return data;
  return { ...data, pages };
}
