import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState, type CSSProperties } from "react";
import type { ThemeName } from "@/config/userConfiguration";
import { getPersistedThemeFromScale, getThemeScaleVars } from "@/theme/themeScale";
import { Kasagi, Nuki, Pillars, Shimaki } from "@/components/Dividers";
import { BeamMeUpScotty } from "@/components/BeamMeUpScotty/BeamMeUpScotty";
import { SiteFooter } from "@/components/SiteFooter/SiteFooter";
import authNavStyles from "@/components/AuthenticationNav/style.module.css";
import {
  AUTH_NAV_YIN_HOVER_DUR_S,
  AUTH_NAV_YIN_HOVER_DUR_REDUCED_S,
  YinYangSegmentBackground,
  authNavYinHitOpacity,
  authNavYinSegmentFlex,
  type AuthNavYinHovered,
} from "@/components/AuthenticationNav/LoggedOutAuthLinks";
import { motion, useReducedMotion } from "motion/react";

const authNavEase = [0.33, 1, 0.68, 1] as const;
import { ThemeSelector } from "./ThemeSelector";
import styles from "./ThemeSelector.stories.module.css";
import pageStyles from "@/app/page.module.css";
import chatStyles from "@/components/HaikuGenerationChat/style.module.css";
import headerStyles from "@/app/providers/headerStyles.module.css";
import layoutStyles from "@/app/providers/layoutProviders.module.css";

const meta: Meta<typeof ThemeSelector> = {
  title: "Auth/ThemeSelector",
  component: ThemeSelector,
  args: {
    ariaLabel: "Theme",
  },
};

export default meta;
type Story = StoryObj<typeof ThemeSelector>;

const InteractiveSelector = ({ initialTheme }: { initialTheme: ThemeName }) => {
  const [theme, setTheme] = useState<ThemeName>(initialTheme);
  const [preview, setPreview] = useState<number | null>(null);
  const activeScale = preview ?? (theme === "night-sky" ? 100 : theme === "tokyo-dusk" ? 50 : 0);
  const themeVars = getThemeScaleVars(activeScale);

  return (
    <div
      className={styles.stage}
      style={
        {
          "--story-background": themeVars["--background"],
          "--story-text": themeVars["--text-color"],
          "--story-border": themeVars["--border-color"],
          "--story-gradient-start": themeVars["--gradientStart"],
          "--story-gradient-mid": themeVars["--gradientMid"],
          "--story-surface": themeVars["--surface-glass"],
          "--story-surface-strong": themeVars["--surface-glass-strong"],
          "--story-accent-soft": themeVars["--shrine-accent-soft"],
        } as CSSProperties
      }
    >
      <div className={styles.triangleBack} aria-hidden />
      <div className={styles.triangleMid} aria-hidden />
      <div className={styles.triangleFront} aria-hidden />
      <div className={styles.card}>
      <ThemeSelector
        value={theme}
        onChange={setTheme}
        onPreviewChange={setPreview}
        onScaleCommit={(progress) => {
          setPreview(progress);
          setTheme(getPersistedThemeFromScale(progress));
        }}
      />
      <p className={styles.title}>Theme: {theme}</p>
      <p className={styles.scaleLabel}>
        Scale: {activeScale}% (night to twilight to sunset to day)
      </p>
      </div>
    </div>
  );
};

const SelectorControlCard = ({
  theme,
  setTheme,
  setPreview,
  activeScale,
}: {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  setPreview: (progress: number | null) => void;
  activeScale: number;
}) => (
  <div className={styles.card}>
    <ThemeSelector
      value={theme}
      onChange={setTheme}
      onPreviewChange={setPreview}
      onScaleCommit={(progress) => {
        setPreview(progress);
        setTheme(getPersistedThemeFromScale(progress));
      }}
    />
    <p className={styles.title}>Theme: {theme}</p>
    <p className={styles.scaleLabel}>Scale: {activeScale}% (night to twilight to sunset to day)</p>
  </div>
);

const LayoutShellPreview = ({ initialTheme }: { initialTheme: ThemeName }) => {
  const [theme, setTheme] = useState<ThemeName>(initialTheme);
  const [preview, setPreview] = useState<number | null>(null);
  const activeScale = preview ?? (theme === "night-sky" ? 100 : theme === "tokyo-dusk" ? 50 : 0);
  const themeVars = getThemeScaleVars(activeScale);

  return (
    <div className={styles.storyPageRoot} style={themeVars as CSSProperties}>
      <div className={`${pageStyles.page} ${styles.layoutStageInShell}`}>
        <div className={pageStyles.vgBg} aria-hidden>
          <div className={pageStyles.vgArt} />
          <div className={pageStyles.vgMountains} />
        </div>
        <main className={pageStyles.main}>
          <div className={styles.layoutControls}>
            <SelectorControlCard
              theme={theme}
              setTheme={setTheme}
              setPreview={setPreview}
              activeScale={activeScale}
            />
          </div>
          <div className={styles.pageComponentShell}>
            <form className={chatStyles.shrine} onSubmit={(event) => event.preventDefault()}>
              <Kasagi />
              <Shimaki />
              <Nuki />
              <Pillars>
                <input className={chatStyles.shrineInput} value="Moonlit pine branch" readOnly />
                <button type="button" className={chatStyles.shrineButton}>
                  詠む Compose
                </button>
              </Pillars>
              <Nuki />
            </form>
          </div>
          <footer className={pageStyles.footerText}>
            {"Stars blink, I wonder—\nAm I just dust in the void,\nOr meaning’s whisper?"}
          </footer>
        </main>
      </div>
    </div>
  );
};

/** Mirrors `LayoutProviders` chrome: real header + footer, mock auth row (no session). */
const FullChromePreview = ({ initialTheme }: { initialTheme: ThemeName }) => {
  const [theme, setTheme] = useState<ThemeName>(initialTheme);
  const [preview, setPreview] = useState<number | null>(null);
  const [authHovered, setAuthHovered] = useState<AuthNavYinHovered>(null);
  const reduceMotion = useReducedMotion();
  const activeScale = preview ?? (theme === "night-sky" ? 100 : theme === "tokyo-dusk" ? 50 : 0);
  const themeVars = getThemeScaleVars(activeScale);
  const authNavTransition = reduceMotion
    ? { duration: AUTH_NAV_YIN_HOVER_DUR_REDUCED_S }
    : {
        type: "tween" as const,
        duration: authHovered !== null ? AUTH_NAV_YIN_HOVER_DUR_S : 0.2,
        ease: authNavEase,
      };
  const authNavTap = reduceMotion ? undefined : { scale: 0.97 };

  return (
    <div style={themeVars as CSSProperties}>
      <div className={layoutStyles.shell}>
        <header className={headerStyles.header}>
          <div className={headerStyles.headerBar}>
            <BeamMeUpScotty />
            <div className={`${headerStyles.headerAuth} ${styles.storyHeaderAuth}`}>
              <ThemeSelector
                value={theme}
                onChange={setTheme}
                onPreviewChange={setPreview}
                onScaleCommit={(progress) => {
                  setPreview(progress);
                  setTheme(getPersistedThemeFromScale(progress));
                }}
              />
              <div className={styles.mockAuthRow}>
                <div
                  className={authNavStyles.authNavYinYang}
                  data-testid="auth-yin-pill"
                  data-auth-yin-phase={authHovered ? "split" : "seam"}
                  onPointerLeave={() => setAuthHovered(null)}
                >
                  <div className={authNavStyles.authNavYinBackgroundWrap}>
                    <YinYangSegmentBackground hovered={authHovered} reduceMotion={!!reduceMotion} />
                  </div>
                  <div className={authNavStyles.authNavYinLinks}>
                    <motion.div
                      className={authNavStyles.authNavYinSegment}
                      initial={false}
                      animate={{ flexGrow: authNavYinSegmentFlex(authHovered, "login") }}
                      transition={authNavTransition}
                      onPointerEnter={() => setAuthHovered("login")}
                    >
                      <motion.button
                        type="button"
                        className={`${authNavStyles.authNavYinHitButton} ${authNavStyles.authNavYinLinkLogin}`}
                        initial={false}
                        animate={{ opacity: authNavYinHitOpacity(authHovered, "login") }}
                        transition={authNavTransition}
                        whileTap={authNavTap}
                        style={{ pointerEvents: authHovered === "register" ? "none" : "auto" }}
                        onClick={(event) => event.preventDefault()}
                        tabIndex={authHovered === "register" ? -1 : 0}
                      >
                        Login
                      </motion.button>
                    </motion.div>
                    <motion.div
                      className={authNavStyles.authNavYinSegment}
                      initial={false}
                      animate={{ flexGrow: authNavYinSegmentFlex(authHovered, "register") }}
                      transition={authNavTransition}
                      onPointerEnter={() => setAuthHovered("register")}
                    >
                      <motion.button
                        type="button"
                        className={`${authNavStyles.authNavYinHitButton} ${authNavStyles.authNavYinLinkRegister}`}
                        initial={false}
                        animate={{ opacity: authNavYinHitOpacity(authHovered, "register") }}
                        transition={authNavTransition}
                        whileTap={authNavTap}
                        style={{ pointerEvents: authHovered === "login" ? "none" : "auto" }}
                        onClick={(event) => event.preventDefault()}
                        tabIndex={authHovered === "login" ? -1 : 0}
                      >
                        Register
                      </motion.button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className={layoutStyles.contentMain}>
          <div className={layoutStyles.contentStretch}>
            <div className={`${pageStyles.page} ${styles.layoutStageInShell}`}>
              <div className={pageStyles.vgBg} aria-hidden>
                <div className={pageStyles.vgArt} />
                <div className={pageStyles.vgMountains} />
              </div>
              <main className={pageStyles.main}>
                <div className={styles.pageComponentShell}>
                  <form className={chatStyles.shrine} onSubmit={(event) => event.preventDefault()}>
                    <Kasagi />
                    <Shimaki />
                    <Nuki />
                    <Pillars>
                      <input className={chatStyles.shrineInput} value="Moonlit pine branch" readOnly />
                      <button type="button" className={chatStyles.shrineButton}>
                        詠む Compose
                      </button>
                    </Pillars>
                    <Nuki />
                  </form>
                </div>
                <footer className={pageStyles.footerText}>
                  {"Stars blink, I wonder—\nAm I just dust in the void,\nOr meaning’s whisper?"}
                </footer>
              </main>
            </div>
          </div>
        </main>
        <footer className={layoutStyles.footerSlot}>
          <SiteFooter />
        </footer>
      </div>
    </div>
  );
};

export const Bright: Story = {
  render: () => <InteractiveSelector initialTheme="sumie" />,
};

export const Mid: Story = {
  render: () => <InteractiveSelector initialTheme="tokyo-dusk" />,
};

export const Dark: Story = {
  render: () => <InteractiveSelector initialTheme="night-sky" />,
};

export const ScaleProgression: Story = {
  render: () => <InteractiveSelector initialTheme="tokyo-dusk" />,
};

export const WithLayoutComponents: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => <LayoutShellPreview initialTheme="tokyo-dusk" />,
};

export const WithHeaderAndFooter: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => <FullChromePreview initialTheme="tokyo-dusk" />,
};
