"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useHaikuFilters } from "@/app/providers/HaikuFiltersProvider";
import { useAccountLabels, useManageLabelsAccount } from "@/hooks/useAccountLabels";

export function useHeaderHaikuLabelManage() {
  const pathname = usePathname();
  const { selectedLabelIds, setSelectedLabelIds, removeLabelId } =
    useHaikuFilters();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: manageAccountId } = useManageLabelsAccount();
  const accountId = manageAccountId ?? "";
  const { labels } = useAccountLabels({
    accountId,
    autofetch: Boolean(accountId) && (modalOpen || selectedLabelIds.length > 0),
  });

  const labelById = useMemo(() => {
    const map = new Map(labels.map((label) => [label.id, label]));
    return map;
  }, [labels]);

  const chips = selectedLabelIds
    .map((id) => labelById.get(id))
    .filter((label): label is NonNullable<typeof label> => Boolean(label));

  return {
    enabled: pathname === "/",
    accountId,
    modalOpen,
    setModalOpen,
    chips,
    selectedLabelIds,
    setSelectedLabelIds,
    removeLabelId,
    canOpen: Boolean(accountId),
  };
}
