"use client";

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LoginLantern } from "./LoginLantern";
import { RegisterLantern } from "./RegisterLantern";

const meta = {
  title: "Auth/AuthLanterns",
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Side-by-side Login (light) and Register (mirrored dark) lanterns.
 */
export const SideBySide: Story = {
  render: function SideBySideRender() {
    const [mode, setMode] = useState<"login" | "register">("login");

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "2.5rem",
          padding: "2rem",
          background:
            "linear-gradient(160deg, #e8e0d4 0%, #c9b8a4 45%, #9a8b7a 100%)",
          borderRadius: 12,
        }}
      >
        <LoginLantern
          selected={mode === "login"}
          onClick={() => setMode("login")}
        />
        <RegisterLantern
          selected={mode === "register"}
          onClick={() => setMode("register")}
        />
      </div>
    );
  },
};

export const LoginIdle: Story = {
  render: () => <LoginLantern selected={false} onClick={() => undefined} />,
};

export const LoginSelected: Story = {
  render: () => <LoginLantern selected onClick={() => undefined} />,
};

export const RegisterIdle: Story = {
  render: () => <RegisterLantern selected={false} onClick={() => undefined} />,
};

export const RegisterSelected: Story = {
  render: () => <RegisterLantern selected onClick={() => undefined} />,
};
