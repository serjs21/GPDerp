"use client";

import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import {
  createLabelForAccount,
  deleteLabel,
  fetchLabelsForAccountPaged,
  fetchLabelsForAccount,
  labelQueryKeys,
  resolveManageLabelsAccountId,
  setLabelsForHaiku,
  updateLabel,
  type LabelDto,
} from "@/api/labels";

export type UseAccountLabelsOptions = {
  accountId: string;
  autofetch?: boolean;
  /** Page size for infinite paged query (default 50). */
  pageSize?: number;
  /** Optional name substring filter for paged query. */
  q?: string;
  /** Embed connected haiku previews on each paged label (manage-labels strip). */
  includeConnectedHaikus?: boolean;
  /** Preview limit when `includeConnectedHaikus` is set (default 3). */
  connectedHaikuLimit?: number;
};

export type UseAccountLabelsResult = {
  labels: LabelDto[];
  fetch: (force: boolean) => Promise<void>;
  createLabel: (
    options: {
      name: string;
      color: string;
      shape: string;
      onSuccess?: (label: LabelDto) => void | Promise<void>;
      onError?: () => void | Promise<void>;
    },
  ) => Promise<void>;
  setHaikuLabels: (
    options: {
      haikuId: string;
      labelIds: string[];
      onSuccess?: (
        labels: Array<{
          id: string;
          name: string;
          color: string;
          shape: string;
          connectionPointId: string;
          rotateDeg: number;
        }>,
      ) => void | Promise<void>;
      onError?: () => void | Promise<void>;
    },
  ) => Promise<void>;
  updateLabel: (
    options: {
      labelId: string;
      name: string;
      color: string;
      shape: string;
      onSuccess?: (label: LabelDto) => void | Promise<void>;
      onError?: () => void | Promise<void>;
    },
  ) => Promise<void>;
  deleteLabel: (
    options: {
      labelId: string;
      onSuccess?: () => void | Promise<void>;
      onError?: () => void | Promise<void>;
    },
  ) => Promise<void>;
  pagedLabels: LabelDto[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isPagedLoading: boolean;
  fetchNextPage: () => Promise<void>;
  isCreating: boolean;
  isSettingLabels: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isLoading: boolean;
};

function invalidatePagedQueries(queryClient: ReturnType<typeof useQueryClient>, accountId: string) {
  return queryClient.invalidateQueries({
    queryKey: [...labelQueryKeys.all, "account", accountId, "paged"],
  });
}

export function useManageLabelsAccount() {
  return useQuery({
    queryKey: labelQueryKeys.manageAccount,
    queryFn: resolveManageLabelsAccountId,
    staleTime: 60_000,
  });
}

export function useAccountLabels(options: UseAccountLabelsOptions): UseAccountLabelsResult {
  const {
    accountId,
    autofetch = true,
    pageSize = 50,
    q = "",
    includeConnectedHaikus = false,
    connectedHaikuLimit = 3,
  } = options;
  const queryClient = useQueryClient();
  const searchQ = q.trim();

  const query = useQuery({
    queryKey: labelQueryKeys.byAccount(accountId),
    queryFn: () => fetchLabelsForAccount(accountId),
    enabled: autofetch,
    staleTime: 5 * 60_000,
  });

  const labels = query.data ?? queryClient.getQueryData<LabelDto[]>(labelQueryKeys.byAccount(accountId)) ?? [];

  const fetch = async (force: boolean) => {
    if (force) {
      await queryClient.invalidateQueries({ queryKey: labelQueryKeys.byAccount(accountId) });
    }
    await queryClient.fetchQuery({
      queryKey: labelQueryKeys.byAccount(accountId),
      queryFn: () => fetchLabelsForAccount(accountId),
      staleTime: force ? 0 : 5 * 60_000,
    });
  };

  const createLabelMutation = useMutation({
    mutationFn: async (input: { name: string; color: string; shape: string }) => {
      const created = await createLabelForAccount({
        accountId,
        name: input.name,
        color: input.color,
        shape: input.shape,
        createdAt: new Date().toISOString(),
      });
      queryClient.setQueryData<LabelDto[]>(labelQueryKeys.byAccount(accountId), (prev) => {
        const current = prev ?? [];
        if (current.some((l) => l.id === created.id)) return current;
        return [...current, created].sort((a, b) => a.name.localeCompare(b.name));
      });
      await invalidatePagedQueries(queryClient, accountId);
      return created;
    },
  });

  const createLabel: UseAccountLabelsResult["createLabel"] = async (options) => {
    try {
      const created = await createLabelMutation.mutateAsync({
        name: options.name,
        color: options.color,
        shape: options.shape,
      });
      await options.onSuccess?.(created);
    } catch {
      await options.onError?.();
      throw new Error("create_label_failed");
    }
  };

  const setLabelsMutation = useMutation({
    mutationFn: (input: { haikuId: string; labelIds: string[] }) =>
      setLabelsForHaiku(input.haikuId, input.labelIds),
  });

  const setHaikuLabels: UseAccountLabelsResult["setHaikuLabels"] = async (options) => {
    try {
      const labels = await setLabelsMutation.mutateAsync({
        haikuId: options.haikuId,
        labelIds: options.labelIds,
      });
      await options.onSuccess?.(labels);
    } catch {
      await options.onError?.();
      throw new Error("set_haiku_labels_failed");
    }
  };

  const updateMutation = useMutation({
    mutationFn: (input: { labelId: string; name: string; color: string; shape: string }) =>
      updateLabel(input),
  });

  const updateLabelFromHook: UseAccountLabelsResult["updateLabel"] = async (options) => {
    try {
      const updated = await updateMutation.mutateAsync({
        labelId: options.labelId,
        name: options.name,
        color: options.color,
        shape: options.shape,
      });
      queryClient.setQueryData<LabelDto[]>(labelQueryKeys.byAccount(accountId), (prev) =>
        (prev ?? []).map((l) => (l.id === updated.id ? updated : l)),
      );
      await invalidatePagedQueries(queryClient, accountId);
      await options.onSuccess?.(updated);
    } catch {
      await options.onError?.();
      throw new Error("update_label_failed");
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (labelId: string) => deleteLabel(labelId),
  });

  const deleteLabelFromHook: UseAccountLabelsResult["deleteLabel"] = async (options) => {
    try {
      await deleteMutation.mutateAsync(options.labelId);
      queryClient.setQueryData<LabelDto[]>(labelQueryKeys.byAccount(accountId), (prev) =>
        (prev ?? []).filter((l) => l.id !== options.labelId),
      );
      await invalidatePagedQueries(queryClient, accountId);
      await options.onSuccess?.();
    } catch {
      await options.onError?.();
      throw new Error("delete_label_failed");
    }
  };

  const pagedQuery = useInfiniteQuery({
    queryKey: labelQueryKeys.pagedByAccount(
      accountId,
      pageSize,
      searchQ,
      includeConnectedHaikus,
    ),
    queryFn: ({ pageParam }) =>
      fetchLabelsForAccountPaged(accountId, {
        pageSize,
        offset: pageParam as number,
        q: searchQ || undefined,
        includeConnectedHaikus,
        connectedHaikuLimit: includeConnectedHaikus ? connectedHaikuLimit : undefined,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.offset + lastPage.labels.length;
      return loaded < lastPage.total ? loaded : undefined;
    },
    enabled: autofetch,
  });

  const pagedLabels = pagedQuery.data?.pages.flatMap((p) => p.labels) ?? [];

  return {
    labels,
    fetch,
    createLabel,
    setHaikuLabels,
    updateLabel: updateLabelFromHook,
    deleteLabel: deleteLabelFromHook,
    pagedLabels,
    hasNextPage: pagedQuery.hasNextPage ?? false,
    isFetchingNextPage: pagedQuery.isFetchingNextPage,
    isPagedLoading: pagedQuery.isPending,
    fetchNextPage: async () => {
      await pagedQuery.fetchNextPage();
    },
    isCreating: createLabelMutation.isPending,
    isSettingLabels: setLabelsMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isLoading: query.isPending,
  };
}
