import { useState } from "react";
import { AuthDualityToggle } from "../AuthDualityToggle/AuthDualityToggle";

type ModalType = "login" | "register" | null;

type AuthDualityToggleDemoProps = {
  loginLabel?: string;
  registerLabel?: string;
  width?: number;
  height?: number;
  borderRadius?: number;
};

export function AuthDualityToggleDemo({
  loginLabel = "Login",
  registerLabel = "Register",
  width,
  height,
  borderRadius,
}: AuthDualityToggleDemoProps) {
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [closeToken, setCloseToken] = useState(0);

  const handleModalClose = () => {
    setOpenModal(null);
    setCloseToken((previous) => previous + 1);
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <AuthDualityToggle
        loginLabel={loginLabel}
        registerLabel={registerLabel}
        onLoginClick={() => setOpenModal("login")}
        onRegisterClick={() => setOpenModal("register")}
        onClose={closeToken}
        width={width}
        height={height}
        borderRadius={borderRadius}
      />

      {openModal ? (
        <div
          style={{
            border: "1px solid color-mix(in srgb, var(--text-color) 18%, transparent)",
            borderRadius: 12,
            padding: "12px 14px",
            background: "color-mix(in srgb, var(--surface-glass-strong) 90%, var(--background) 10%)",
            color: "var(--text-color)",
          }}
        >
          <div style={{ marginBottom: 8, fontWeight: 700 }}>
            Mock {openModal === "login" ? loginLabel : registerLabel} Modal
          </div>
          <button type="button" onClick={handleModalClose}>
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}
