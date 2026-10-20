"use client";

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import { withThemedStoryStage } from "@/storybook";
import { EmailChangeRevertView } from "./EmailChangeRevertView";
import type { EmailChangeRevertViewState } from "./EmailChangeRevertView.types";

const OWNER = "owner@example.com";
const CHANGED_TO = "definitely-not-a-hacker@example.com";

const meta = {
  title: "Auth/EmailChangeRevert",
  component: EmailChangeRevertView,
  parameters: {
    layout: "fullscreen",
    initialCelestialPreset: "blueNight" satisfies CelestialPresetName,
  },
  decorators: [withThemedStoryStage],
  args: {
    state: { kind: "loading" },
    onConfirm: fn(),
    onKeep: fn(),
    onSubmitPassword: fn(),
    onSignIn: fn(),
  },
} satisfies Meta<typeof EmailChangeRevertView>;

export default meta;
type Story = StoryObj<typeof meta>;

const story = (state: EmailChangeRevertViewState): Story => ({ args: { state } });

export const Loading = story({ kind: "loading" });
export const Confirm = story({ kind: "confirm", restoreEmail: OWNER, changedToEmail: CHANGED_TO, busy: false });
export const Reverting = story({ kind: "confirm", restoreEmail: OWNER, changedToEmail: CHANGED_TO, busy: true });
export const SetPassword = story({ kind: "setPassword", restoredEmail: OWNER, emailTaken: false, busy: false, error: null });
export const SavingPassword = story({ kind: "setPassword", restoredEmail: OWNER, emailTaken: false, busy: true, error: null });
export const PasswordRejected = story({
  kind: "setPassword",
  restoredEmail: OWNER,
  emailTaken: false,
  busy: false,
  error: "Password must include at least one number.",
});
export const EmailTaken = story({ kind: "setPassword", restoredEmail: OWNER, emailTaken: true, busy: false, error: null });
export const PasswordSaved = story({ kind: "passwordSaved", restoredEmail: OWNER });
export const RevertedNoPassword = story({ kind: "revertedNoPassword", restoredEmail: OWNER, emailTaken: false });
export const EmailTakenNoPassword = story({ kind: "revertedNoPassword", restoredEmail: OWNER, emailTaken: true });
export const InvalidLink = story({ kind: "invalid" });
export const ExpiredLink = story({ kind: "expired" });
export const UsedLink = story({ kind: "used" });
export const ServerUnreachable = story({ kind: "failed" });

const FAKE_LATENCY_MS = 700;

/** Local stand-in for useEmailChangeRevert: confirm, then the forced password step, then done. */
function InteractiveRevertFlow() {
  const [state, setState] = useState<EmailChangeRevertViewState>({
    kind: "confirm",
    restoreEmail: OWNER,
    changedToEmail: CHANGED_TO,
    busy: false,
  });
  const later = (next: EmailChangeRevertViewState) => window.setTimeout(() => setState(next), FAKE_LATENCY_MS);

  return (
    <EmailChangeRevertView
      state={state}
      onConfirm={() => {
        if (state.kind !== "confirm") return;
        setState({ ...state, busy: true });
        later({ kind: "setPassword", restoredEmail: OWNER, emailTaken: false, busy: false, error: null });
      }}
      onKeep={() => setState({ kind: "confirm", restoreEmail: OWNER, changedToEmail: CHANGED_TO, busy: false })}
      onSubmitPassword={() => {
        if (state.kind !== "setPassword") return;
        setState({ ...state, busy: true });
        later({ kind: "passwordSaved", restoredEmail: OWNER });
      }}
      onSignIn={() => setState({ kind: "confirm", restoreEmail: OWNER, changedToEmail: CHANGED_TO, busy: false })}
    />
  );
}

export const InteractiveFlow: Story = {
  render: () => <InteractiveRevertFlow />,
};
