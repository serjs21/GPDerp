"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { useHaikuFilters } from "@/app/providers/HaikuFiltersProvider";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import { ComicLabelSelectionModal } from "@/components/ComicLabelSelectionModal";
import { useAccountLabels, useManageLabelsAccount } from "@/hooks/useAccountLabels";
import styles from "./HeaderHaikuTools.module.css";

export function HeaderHaikuLabelFilter() {
  const pathname = usePathname();
  const { initialized, isLoggedIn } = useAuthenticationState();
  const { selectedLabelIds, setSelectedLabelIds, removeLabelId } = useHaikuFilters();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: manageAccountId } = useManageLabelsAccount();
  const accountId = manageAccountId ?? "";
  const { labels } = useAccountLabels({
    accountId,
    autofetch: Boolean(accountId) && (modalOpen || selectedLabelIds.length > 0),
  });

  const labelById = useMemo(() => {
    const map = new Map(labels.map((l) => [l.id, l]));
    return map;
  }, [labels]);

  const visible = initialized && isLoggedIn && pathname === "/";
  if (!visible) return null;

  const chips = selectedLabelIds
    .map((id) => labelById.get(id))
    .filter((label): label is NonNullable<typeof label> => Boolean(label));

  return (
    <>
      <div className={styles.filterRoot}>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="Filter by labels"
          aria-expanded={modalOpen}
          onClick={() => setModalOpen(true)}
          disabled={!accountId}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/tag_white_fill.svg"
            alt=""
            className={styles.iconImg}
            width={22}
            height={28}
          />
        </button>
      </div>

      {chips.length > 0 ? (
        <div className={styles.filterChips} aria-label="Active label filters">
          {chips.map((label) => {
            const shape = resolveComicLabelShapePreset(label.shape);
            return (
              <div key={label.id} className={styles.filterChip}>
                <ComicBurstLabel
                  className={styles.filterChipBurst}
                  text={formatComicLabelText(label.name)}
                  fill={label.color || "#888888"}
                  shapeKind={shape.kind}
                  spikeCount={shape.spikeCount}
                  randomness={shape.randomness}
                  seed={shape.id}
                  fontSize={14}
                />
                <button
                  type="button"
                  className={styles.filterChipRemove}
                  aria-label={`Remove filter ${label.name}`}
                  onClick={() => removeLabelId(label.id)}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      ) : null}

      {accountId ? (
        <ComicLabelSelectionModal
          mode="filter"
          open={modalOpen}
          accountId={accountId}
          selectedIds={selectedLabelIds}
          onApply={setSelectedLabelIds}
          onClose={() => setModalOpen(false)}
        />
      ) : null}
    </>
  );
}
