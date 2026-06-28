"use client";

import type { CelestialPresetName } from "@/theme/celestialPresets";
import { CELESTIAL_PRESET_LABELS } from "@/theme/celestialPresets";
import { dateToSlot, slotToDate } from "@/theme/celestialTime";
import type { CelestialProjectionOptions, GeoCoordinates } from "@/theme/celestialTheme";
import { CelestialThemeClock } from "@/components/CelestialThemeClock";
import styles from "./CelestialStoryControls.module.css";

export type CelestialStoryControlState = {
  useCelestialMode: boolean;
  selectedDate: Date;
  coordinates: GeoCoordinates;
  projection: CelestialProjectionOptions;
  showCelestialBodies: boolean;
};

export type CelestialStoryControlsProps = {
  state: CelestialStoryControlState;
  onChange: (next: CelestialStoryControlState) => void;
  onPreset: (preset: CelestialPresetName) => void;
  themeSelectorSlot?: React.ReactNode;
  celestialModeNote?: string;
};

type CelestialFieldsProps = {
  state: CelestialStoryControlState;
  onChange: (next: CelestialStoryControlState) => void;
  onPreset: (preset: CelestialPresetName) => void;
};

function CelestialFields({ state, onChange, onPreset }: CelestialFieldsProps) {
  const update = (patch: Partial<CelestialStoryControlState>) => {
    onChange({ ...state, ...patch });
  };

  return (
    <div className={styles.celestialFields}>
      <CelestialThemeClock
        value={dateToSlot(state.selectedDate)}
        onChange={(slot) => update({ selectedDate: slotToDate(slot) })}
        coordinates={state.coordinates}
        ariaLabel="Time of day"
      />

      <div className={styles.row}>
        <label className={styles.field}>
          <span>Latitude</span>
          <input
            type="number"
            step="0.0001"
            value={state.coordinates.latitude}
            onChange={(event) =>
              update({
                coordinates: { ...state.coordinates, latitude: Number(event.target.value) },
              })
            }
          />
        </label>
        <label className={styles.field}>
          <span>Longitude</span>
          <input
            type="number"
            step="0.0001"
            value={state.coordinates.longitude}
            onChange={(event) =>
              update({
                coordinates: { ...state.coordinates, longitude: Number(event.target.value) },
              })
            }
          />
        </label>
      </div>

      <div className={styles.row}>
        <label className={styles.field}>
          <span>Camera azimuth</span>
          <input
            type="number"
            value={state.projection.cameraAzimuthDeg ?? 180}
            onChange={(event) =>
              update({
                projection: {
                  ...state.projection,
                  cameraAzimuthDeg: Number(event.target.value),
                },
              })
            }
          />
        </label>
        <label className={styles.toggleRow}>
          <input
            type="checkbox"
            checked={state.projection.mirrorScene ?? false}
            onChange={(event) =>
              update({
                projection: { ...state.projection, mirrorScene: event.target.checked },
              })
            }
          />
          <span>Mirror scene</span>
        </label>
      </div>

      <label className={styles.toggleRow}>
        <input
          type="checkbox"
          checked={state.showCelestialBodies}
          onChange={(event) => update({ showCelestialBodies: event.target.checked })}
        />
        <span>Show sun & moon</span>
      </label>

      <div className={styles.presets}>
        {(Object.keys(CELESTIAL_PRESET_LABELS) as CelestialPresetName[]).map((preset) => (
          <button key={preset} type="button" onClick={() => onPreset(preset)}>
            {CELESTIAL_PRESET_LABELS[preset]}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CelestialStoryControls({
  state,
  onChange,
  onPreset,
  themeSelectorSlot,
  celestialModeNote,
}: CelestialStoryControlsProps) {
  return (
    <div className={styles.panel}>
      <label className={styles.toggleRow}>
        <input
          type="checkbox"
          checked={state.useCelestialMode}
          onChange={(event) => onChange({ ...state, useCelestialMode: event.target.checked })}
        />
        <span>Celestial mode (date/geo)</span>
      </label>

      {themeSelectorSlot ? (
        <div className={state.useCelestialMode ? styles.dimmed : undefined}>{themeSelectorSlot}</div>
      ) : null}

      {state.useCelestialMode && celestialModeNote ? (
        <p className={styles.note}>{celestialModeNote}</p>
      ) : null}

      {state.useCelestialMode ? (
        <CelestialFields state={state} onChange={onChange} onPreset={onPreset} />
      ) : null}
    </div>
  );
}
