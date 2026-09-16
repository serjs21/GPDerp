import type { HaikuDto } from "@/api/haikus";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { getWisdomForestCardCount } from "./wisdomForestStackScroll";

type ControlledFields = {
  haikus: HaikuDto[];
  isInitialLoading?: boolean;
  isFetchingNextPage?: boolean;
  isError?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  onRetry?: () => void;
  onHaikuDeleted?: () => void;
};

type QueriedFields = {
  ready: boolean;
  haikus: HaikuDto[];
  isInitialLoading: boolean;
  isFetchingNextPage: boolean;
  isError: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  onHaikuDeleted: () => void;
};

export type WisdomForestResolvedState = {
  ready: boolean;
  haikus: HaikuDto[];
  isInitialLoading: boolean;
  isFetchingNextPage: boolean;
  isError: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  onHaikuDeleted?: () => void;
  cardCount: number;
  showEmpty: boolean;
};

function fromControlled(controlled: ControlledFields): Omit<WisdomForestResolvedState, "ready" | "cardCount" | "showEmpty"> {
  return {
    haikus: controlled.haikus,
    isInitialLoading: controlled.isInitialLoading ?? false,
    isFetchingNextPage: controlled.isFetchingNextPage ?? false,
    isError: controlled.isError ?? false,
    hasNextPage: controlled.hasNextPage ?? false,
    onLoadMore: controlled.onLoadMore ?? (() => {}),
    onRetry: controlled.onRetry ?? (() => {}),
    onHaikuDeleted: controlled.onHaikuDeleted,
  };
}

function fromQueried(queried: QueriedFields): Omit<WisdomForestResolvedState, "ready" | "cardCount" | "showEmpty"> {
  return {
    haikus: queried.haikus,
    isInitialLoading: queried.isInitialLoading,
    isFetchingNextPage: queried.isFetchingNextPage,
    isError: queried.isError,
    hasNextPage: queried.hasNextPage,
    onLoadMore: queried.onLoadMore,
    onRetry: queried.onRetry,
    onHaikuDeleted: queried.onHaikuDeleted,
  };
}

export function resolveWisdomForestFields(
  isControlled: boolean,
  controlled: ControlledFields,
  queried: QueriedFields,
  generatingDraft: GeneratingDraft | null,
): WisdomForestResolvedState {
  const fields = isControlled ? fromControlled(controlled) : fromQueried(queried);
  const cardCount = getWisdomForestCardCount(fields.haikus, generatingDraft);

  return {
    ...fields,
    ready: isControlled || queried.ready,
    cardCount,
    showEmpty: cardCount === 0 && !fields.isError && !generatingDraft,
  };
}
