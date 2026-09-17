"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { HaikuDto } from "@/api/haikus";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import { Button } from "@/components/StyledComponents";
import { ExitingPathLantern } from "@/components/SVGPath/ExitingPathLantern";
import pathStyles from "@/components/SVGPath/SVGPath.module.css";
import {
  isStopOnPath,
  lanternTransformAtStops,
  parseSplitPathSvg,
  splitPathSvgInnerMarkup,
  stopForHaikuIndex,
  type ParsedSplitPathSvg,
} from "@/components/SVGPath/utils";
import {
  composeDecorators,
  EXAMPLE_HAIKU_BODY,
  makeMockHaiku,
  STORY_CREATED_AT,
  WISDOM_FOREST_BODIES,
  withQueryClient,
  withThemedStoryStage,
} from "@/storybook";
import { Lantern } from "./Lantern";
import { LanternFrame } from "./LanternFrame";
import type { LanternTransform } from "./lanternTransform";
import demoStyles from "./LanternFlightExit.stories.module.css";

const LANTERN_COUNT = 20;
const FOCUS_INDEX = 0;
const SVG_PATH_SRC = "/path/split_path_colored_stops.svg";

const INITIAL_HAIKUS: HaikuDto[] = Array.from({ length: LANTERN_COUNT }, (_, i) =>
  makeMockHaiku({
    id: `flight-exit-demo-${i}`,
    title: `Night questions ${i + 1}`,
    body: WISDOM_FOREST_BODIES[i % WISDOM_FOREST_BODIES.length] ?? EXAMPLE_HAIKU_BODY,
    createdAt: STORY_CREATED_AT,
  }),
);

type ExitingLantern = {
  haiku: HaikuDto;
  transform: LanternTransform;
};

function useSplitPathSvg() {
  const [splitPath, setSplitPath] = useState<{
    parsed: ParsedSplitPathSvg;
    guideInner: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch(SVG_PATH_SRC)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load ${SVG_PATH_SRC}`);
        }
        return response.text();
      })
      .then((markup) => {
        if (!cancelled) {
          setSplitPath({
            parsed: parseSplitPathSvg(markup),
            guideInner: splitPathSvgInnerMarkup(markup),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return splitPath;
}

function LanternFlightExitDemo() {
  const splitPath = useSplitPathSvg();
  const parsed = splitPath?.parsed ?? null;
  const [haikus, setHaikus] = useState(INITIAL_HAIKUS);
  const [exiting, setExiting] = useState<ExitingLantern[]>([]);

  const pathLanterns = useMemo(() => {
    if (!parsed) return [];

    return haikus.flatMap((haiku, haikuIndex) => {
      const stop = stopForHaikuIndex(haikuIndex, FOCUS_INDEX);
      if (!isStopOnPath(stop)) return [];
      const transform = lanternTransformAtStops(parsed, stop, stop, 1);
      if (!transform) return [];
      return [{ haiku, transform }];
    });
  }, [haikus, parsed]);

  const exitingIds = useMemo(
    () => new Set(exiting.map((entry) => entry.haiku.id)),
    [exiting],
  );

  const triggerFlight = useCallback(() => {
    if (!parsed || haikus.length === 0) return;
    const haiku = haikus[0];
    const stop = stopForHaikuIndex(0, FOCUS_INDEX);
    const transform = lanternTransformAtStops(parsed, stop, stop, 1);
    if (!haiku || !transform) return;

    setExiting((prev) =>
      prev.some((entry) => entry.haiku.id === haiku.id)
        ? prev
        : [...prev, { haiku, transform }],
    );
    setHaikus((prev) => prev.filter((entry) => entry.id !== haiku.id));
  }, [haikus, parsed]);

  const resetList = useCallback(() => {
    setExiting([]);
    setHaikus(INITIAL_HAIKUS);
  }, []);

  const onExitComplete = useCallback((haiku: HaikuDto) => {
    setExiting((prev) => prev.filter((entry) => entry.haiku.id !== haiku.id));
  }, []);

  return (
    <div className={demoStyles.demo}>
      <div className={demoStyles.toolbar}>
        <Button type="primary" onClick={triggerFlight} disabled={haikus.length === 0}>
          Fly away focused
        </Button>
        <Button type="default" onClick={resetList}>
          Reset list
        </Button>
        <p className={demoStyles.readout}>
          {haikus.length} on path · {exiting.length} exiting
        </p>
      </div>
      <div className={pathStyles.viewport}>
        <div className={pathStyles.stage} aria-label="Lantern flight exit path demo">
          <div className={pathStyles.guideBox}>
            {splitPath ? (
              <svg
                className={pathStyles.guide}
                viewBox={`0 0 ${splitPath.parsed.viewBox.width} ${splitPath.parsed.viewBox.height}`}
                preserveAspectRatio="none"
                aria-hidden
                dangerouslySetInnerHTML={{ __html: splitPath.guideInner }}
              />
            ) : null}
            {pathLanterns
              .filter(({ haiku }) => !exitingIds.has(haiku.id))
              .map(({ haiku, transform }) => (
                <LanternFrame
                  key={haiku.id}
                  className={pathStyles.lantern}
                  ariaLabel={`Haiku lantern: ${haiku.title}`}
                  widthRem={19}
                  transform={transform}
                >
                  <Lantern haiku={haiku} showActions={false} />
                </LanternFrame>
              ))}
            {exiting.map(({ haiku, transform }) => (
              <ExitingPathLantern
                key={`exiting-${haiku.id}`}
                haiku={haiku}
                transform={transform}
                onComplete={onExitComplete}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const meta: Meta<typeof LanternFlightExitDemo> = {
  title: "Haiku/Lantern/Flight exit",
  component: LanternFlightExitDemo,
  parameters: {
    layout: "fullscreen",
    initialCelestialPreset: "blueNight" satisfies CelestialPresetName,
  },
  decorators: [composeDecorators(withQueryClient, withThemedStoryStage)],
};

export default meta;
type Story = StoryObj<typeof LanternFlightExitDemo>;

export const FlyAway: Story = {
  render: () => <LanternFlightExitDemo />,
};
