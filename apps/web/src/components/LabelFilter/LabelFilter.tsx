"use client";

import { useState } from "react";
import { Select } from "@/components/StyledComponents";
import { SakuraPetalLoader } from "@/components/Loaders";
import { useAccountLabels, useManageLabelsAccount } from "@/hooks/useAccountLabels";
import styles from "./LabelFilter.module.css";

export type LabelFilterProps = {
  selectedLabelIds: string[];
  onChange: (selectedIds: string[]) => void;
  className?: string;
};

export function LabelFilter({ selectedLabelIds, onChange, className }: LabelFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: accountId } = useManageLabelsAccount();

  const { labels: availableLabels, isLoading } = useAccountLabels({
    accountId: accountId || "",
    autofetch: isOpen && !!accountId,
  });

  const selectOptions = availableLabels.map((label) => ({
    label: label.name,
    value: label.id,
    color: label.color,
  }));

  return (
    <Select
      mode="multiple"
      className={`${styles.labelFilter} ${className || ""}`}
      placeholder="Filter by label"
      options={selectOptions}
      value={selectedLabelIds}
      onChange={(next) => onChange(next)}
      onDropdownVisibleChange={(visible) => setIsOpen(visible)}
      notFoundContent={
        isLoading ? (
          <div className={styles.loaderRow}>
            <SakuraPetalLoader />
          </div>
        ) : undefined
      }
      allowClear
    />
  );
}
