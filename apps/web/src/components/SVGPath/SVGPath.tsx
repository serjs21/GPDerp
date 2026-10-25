"use client";

import { forwardRef, useImperativeHandle, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { HaikuDto } from "@/api/haikus";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { PathNavigationProvider } from "@/components/PathNavigation";
import { useScrollBlocking } from "@/hooks/useScrollBlocking";
import { withDefaults } from "@/utils/props/withDefaults";
import { CreationPathLantern } from "./CreationPathLantern";
import { CREATION_ENTER_MS } from "./consts/creationPathLanternConsts";
import type { EmptyPathPlaceholderVariant } from "./consts/emptyPathPlaceholderConsts";
import { EmptyPathPlaceholder } from "./EmptyPathPlaceholder";
import { ExitingPathLantern } from "./ExitingPathLantern";
import { SvgPathGuide } from "./SvgPathGuide";
import { SvgPathListLantern } from "./SvgPathListLantern";
import { usePathCatchUp } from "./usePathCatchUp";
import { usePathCreationLayer } from "./usePathCreationLayer";
import { usePathDeletePack } from "./usePathDeletePack";
import { usePathNavigationValue } from "./usePathNavigationValue";
import { useSplitPathSvg } from "./useSplitPathSvg";
import { useSvgPathInput } from "./useSvgPathInput";
import { useSvgPathScroll } from "./useSvgPathScroll";
import { useSvgPathVisibleLanterns } from "./useSvgPathVisibleLanterns";
import { useVacantQueueSlotFetch } from "./useVacantQueueSlotFetch";
import {
  isQueueLoaderShown,
  svgPathCreationFly,
  svgPathLanternKey,
  svgPathQueue,
} from "./utils/svgPathViewUtils";
import styles from "./SVGPath.module.css";

/** Adjacent focus steps tween continuously along the path (matches TweenedStops story). */
const SVG_PATH_STEP_MS = 300;

export type SVGPathHandle = {
  scrollToTop: () => boolean;
  scrollToCreationSlot: () => boolean;
  /** Instantly set focus to 0 (no scroll animation). */
  snapToTop: () => boolean;
  getFocusIndex: () => number;
};

export type SVGPathProps = {
  haikus: HaikuDto[];
  generatingDraft?: GeneratingDraft | null;
  /**
   * Far-path CreationModal chrome is open — park creation lantern on guideBox stop-20
   * (do not render a second lantern in the modal).
   */
  creationChromeOpen?: boolean;
  initialFocusIndex?: number;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onVacantQueueSlot?: () => void;
  onFocusChange?: (focusIndex: number) => void;
  onHaikuDeleted?: (haiku: HaikuDto) => void;
  onHaikuDeleteFailed?: (haiku: HaikuDto) => void;
  onHaikuChanged?: () => void;
  /** Label ids to omit from lantern belts (e.g. active filters). */
  excludeLabelIds?: string[];
  /** Placeholder lantern shown while `haikus` is empty; omit for none (e.g. filtered lists with no matches). */
  emptyPlaceholder?: EmptyPathPlaceholderVariant;
  /** Shown 5rem under the parked placeholder lantern (e.g. the resend-verification button). */
  emptyPlaceholderAction?: ReactNode;
  className?: string;
  showGuides?: boolean;
};

const SVG_PATH_DEFAULTS = {
  creationChromeOpen: false,
  hasNextPage: false,
  isFetchingNextPage: false,
  showGuides: false,
};

export const SVGPath = forwardRef<SVGPathHandle, SVGPathProps>(function SVGPath(props, ref) {
  const { creationChromeOpen, hasNextPage, isFetchingNextPage, showGuides, className } = withDefaults(
    props,
    SVG_PATH_DEFAULTS,
  );
  const { emptyPlaceholder, emptyPlaceholderAction } = props;
  const { initialFocusIndex } = props;
  const { haikus, generatingDraft, excludeLabelIds, onHaikuDeleteFailed, onHaikuChanged } = props;
  const t = useTranslations("SVGPath.svgPath");
  const { splitPath, parsed } = useSplitPathSvg();
  const stageRef = useRef<HTMLDivElement>(null);
  const svgAreaRef = useRef<HTMLDivElement>(null);
  const haikusRef = useRef(haikus);
  haikusRef.current = haikus;

  const {
    exitingLanterns,
    exitingIds,
    deletePack,
    deletePackT,
    packingActive,
    handleLanternDeleted,
    handleExitPoseHold,
    handleLanternExitComplete,
  } = usePathDeletePack(haikusRef, props.onHaikuDeleted);

  const { morePages, scrollCount } = svgPathQueue(haikus.length, hasNextPage, isFetchingNextPage);

  const {
    focusIndex,
    fromFocusIndex,
    tweenProgress,
    isAnimating,
    stepForward,
    stepBack,
    scrollToTop,
    scrollToCreationSlot,
    snapToTop,
    getFocusIndex,
  } = useSvgPathScroll(scrollCount, SVG_PATH_STEP_MS, {
    initialFocusIndex,
    onFocusChange: props.onFocusChange,
    creationSlotDurationMs: CREATION_ENTER_MS,
  });

  const creationLayer = usePathCreationLayer({
    generatingDraft,
    haikus,
    haikusRef,
    focusIndex,
    creationChromeOpen,
  });

  useImperativeHandle(
    ref,
    () => ({
      scrollToTop,
      scrollToCreationSlot,
      snapToTop,
      getFocusIndex,
    }),
    [getFocusIndex, scrollToCreationSlot, scrollToTop, snapToTop],
  );

  const loaderShown = isQueueLoaderShown(morePages, haikus.length, focusIndex);

  useSvgPathInput(stageRef, stepForward, stepBack, !generatingDraft);
  useScrollBlocking(svgAreaRef);
  useVacantQueueSlotFetch({
    onVacantQueueSlot: props.onVacantQueueSlot,
    hasNextPage,
    isFetchingNextPage,
    haikuCount: haikus.length,
    focusIndex,
  });

  const { catchUpStartRef, displayCatchUpT } = usePathCatchUp(haikus.length, loaderShown);

  const visibleLanterns = useSvgPathVisibleLanterns({
    parsed,
    haikus,
    focusIndex,
    fromFocusIndex,
    tweenProgress,
    catchUpStartRef,
    displayCatchUpT,
    deletePack,
    deletePackT,
    packingActive,
    loaderShown,
  });

  const { creation, hideListFocusStop } = svgPathCreationFly({
    creationLayer,
    parsed,
    focusIndex,
    fromFocusIndex,
    tweenProgress,
    isAnimating,
    creationChromeOpen,
  });

  const pathNavigation = usePathNavigationValue({
    enabled: !generatingDraft,
    focusIndex,
    scrollCount,
    stepBack,
    stepForward,
  });

  const viewportClass = [styles.viewport, className].filter(Boolean).join(" ");

  return (
    <PathNavigationProvider value={pathNavigation}>
      <div ref={stageRef} className={viewportClass}>
        <div className={styles.stage} aria-label={t("stageAriaLabel")}>
          <div ref={svgAreaRef} className={styles.guideBox}>
            {showGuides ? <SvgPathGuide splitPath={splitPath} /> : null}
            {visibleLanterns
              .filter(({ haiku }) => !haiku || !exitingIds.has(haiku.id))
              .map((entry) => (
                <SvgPathListLantern
                  key={svgPathLanternKey(entry.loading, entry.haiku, entry.haikuIndex)}
                  entry={entry}
                  focusIndex={focusIndex}
                  hideListFocusStop={hideListFocusStop}
                  isAnimating={isAnimating || packingActive}
                  excludeLabelIds={excludeLabelIds}
                  onLanternDeleted={handleLanternDeleted}
                  onHaikuDeleteFailed={onHaikuDeleteFailed}
                  onHaikuChanged={onHaikuChanged}
                />
              ))}
            <EmptyPathPlaceholder
              parsed={parsed}
              variant={emptyPlaceholder ?? "createFirst"}
              eligible={Boolean(emptyPlaceholder) && haikus.length === 0}
              generating={Boolean(generatingDraft)}
              action={emptyPlaceholderAction}
            />
            {exitingLanterns.map(({ haiku, transform }) => (
              <ExitingPathLantern
                key={`exiting-${haiku.id}`}
                haiku={haiku}
                transform={transform}
                excludeLabelIds={excludeLabelIds}
                onPoseHold={handleExitPoseHold}
                onComplete={handleLanternExitComplete}
              />
            ))}
            {creation ? (
              <CreationPathLantern
                transform={creation.transform}
                overlayOpacity={creation.layer.overlayOpacity}
                generatingDraft={creation.layer.draft}
                handoffHaiku={creation.layer.handoffHaiku}
                excludeLabelIds={excludeLabelIds}
                elevateAboveChrome={creationChromeOpen}
                guideBoxRef={svgAreaRef}
              />
            ) : null}
          </div>
        </div>
      </div>
    </PathNavigationProvider>
  );
});
