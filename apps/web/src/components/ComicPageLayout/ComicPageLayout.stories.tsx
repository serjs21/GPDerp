import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import {
  COMIC_PAGE_BLANK_TEMPLATE_ROWS,
  ComicPageCtaAction,
  ComicPageDialog,
  ComicPageLayout,
  ComicPagePanel,
  ComicPageRow,
  type ComicPanelBackground,
  type ComicPanelColor,
} from "./index";

function ComicPageLayoutStoryShell() {
  return null;
}

const meta = {
  title: "Haiku/ComicPageLayout",
  component: ComicPageLayoutStoryShell,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ComicPageLayoutStoryShell>;

export default meta;
type Story = StoryObj<typeof meta>;

const BACKGROUND_SAMPLES: Array<{
  background: ComicPanelBackground;
  color: ComicPanelColor;
  label: string;
}> = [
  { background: "sunburst", color: "magenta", label: "Sunburst" },
  { background: "halftone", color: "teal", label: "Halftone" },
  { background: "solid", color: "yellow", label: "Solid" },
  { background: "sunburst", color: "orange", label: "Sunburst" },
  { background: "halftone", color: "purple", label: "Halftone" },
  { background: "solid", color: "blue", label: "Solid" },
];

export const BlankTemplate: Story = {
  render: () => (
    <div style={{ padding: "2rem", background: "#222", minHeight: "100vh" }}>
      <ComicPageLayout title="Blank comic template">
        {COMIC_PAGE_BLANK_TEMPLATE_ROWS.map((columns, rowIndex) => (
          <ComicPageRow key={columns} columns={columns}>
            <ComicPagePanel
              background={rowIndex % 2 === 0 ? "sunburst" : "halftone"}
              color={rowIndex === 0 ? "magenta" : rowIndex === 1 ? "teal" : "yellow"}
              span="auto"
            />
            <ComicPagePanel background="solid" color="white" span="auto" />
          </ComicPageRow>
        ))}
      </ComicPageLayout>
    </div>
  ),
};

export const BackgroundGallery: Story = {
  render: () => (
    <div style={{ padding: "2rem", background: "#222", minHeight: "100vh" }}>
      <ComicPageLayout title="Panel backgrounds">
        <ComicPageRow columns="1fr-1fr">
          {BACKGROUND_SAMPLES.slice(0, 2).map((sample) => (
            <ComicPagePanel
              key={sample.label}
              background={sample.background}
              color={sample.color}
            >
              {sample.label}
            </ComicPagePanel>
          ))}
        </ComicPageRow>
        <ComicPageRow columns="1fr-1fr">
          {BACKGROUND_SAMPLES.slice(2, 4).map((sample) => (
            <ComicPagePanel
              key={sample.label}
              background={sample.background}
              color={sample.color}
            >
              {sample.label}
            </ComicPagePanel>
          ))}
        </ComicPageRow>
        <ComicPageRow columns="1fr-1fr">
          {BACKGROUND_SAMPLES.slice(4, 6).map((sample) => (
            <ComicPagePanel
              key={sample.label}
              background={sample.background}
              color={sample.color}
            >
              {sample.label}
            </ComicPagePanel>
          ))}
        </ComicPageRow>
      </ComicPageLayout>
    </div>
  ),
};

function SelectableRowDemo() {
  const [selected, setSelected] = useState<"link" | "email">("link");
  const selectedWeight = 1.25;
  const unselectedWeight = 0.75;

  return (
    <div style={{ padding: "2rem", background: "#222", minHeight: "100vh" }}>
      <ComicPageLayout title="Selectable row">
        <ComicPageRow>
          <ComicPagePanel
            selectable
            selected={selected === "link"}
            onSelect={() => setSelected("link")}
            background="sunburst"
            color="teal"
            flexWeight={selected === "link" ? selectedWeight : unselectedWeight}
            ariaLabel="Link"
          >
            <img src="/share_modal/link.svg" alt="" width={56} height={56} />
          </ComicPagePanel>
          <ComicPagePanel
            selectable
            selected={selected === "email"}
            onSelect={() => setSelected("email")}
            background="halftone"
            color="orange"
            flexWeight={selected === "email" ? selectedWeight : unselectedWeight}
            ariaLabel="Email"
          >
            <img src="/share_modal/email.svg" alt="" width={56} height={56} />
          </ComicPagePanel>
        </ComicPageRow>
        <ComicPageRow>
          <ComicPagePanel span="full" color="white" contentAlign="start">
            Content for: {selected}
          </ComicPagePanel>
        </ComicPageRow>
      </ComicPageLayout>
    </div>
  );
}

export const SelectableRow: Story = {
  render: () => <SelectableRowDemo />,
};

export const PanelWithTitle: Story = {
  render: () => (
    <div style={{ padding: "2rem", background: "#222", minHeight: "100vh" }}>
      <ComicPageLayout title="Caption panel">
        <ComicPageRow>
          <ComicPagePanel
            span="full"
            color="yellow"
            background="sunburst"
            title="Put a caption here"
            titleColor="white"
            footer="And a footer here"
            footerColor="info"
            contentAlign="start"
          >
            Panel body content sits between the title and footer captions.
          </ComicPagePanel>
        </ComicPageRow>
      </ComicPageLayout>
    </div>
  ),
};

const MOTION_SAMPLES: Array<{ color: ComicPanelColor; label: string }> = [
  { color: "purple", label: "Purple motion" },
  { color: "teal", label: "Teal motion" },
  { color: "blue", label: "Blue motion" },
];

export const SunburstShine: Story = {
  render: () => (
    <div style={{ padding: "2rem", background: "#222", minHeight: "100vh" }}>
      <ComicPageLayout title="Sunburst shine">
        <ComicPageRow columns="1fr-1fr">
          <ComicPagePanel background="sunburst" color="white">
            Inactive B/W
          </ComicPagePanel>
          <ComicPagePanel background="sunburst" color="teal">
            Active teal
          </ComicPagePanel>
        </ComicPageRow>
        <ComicPageRow>
          <ComicPagePanel span="full" background="sunburst" color="orange">
            Orange shine reference
          </ComicPagePanel>
        </ComicPageRow>
      </ComicPageLayout>
    </div>
  ),
};

export const MotionBackground: Story = {
  render: () => (
    <div style={{ padding: "2rem", background: "#222", minHeight: "100vh" }}>
      <ComicPageLayout title="Motion backgrounds">
        <ComicPageRow columns="1fr-1fr">
          {MOTION_SAMPLES.slice(0, 2).map((sample) => (
            <ComicPagePanel key={sample.label} background="motion" color={sample.color}>
              {sample.label}
            </ComicPagePanel>
          ))}
        </ComicPageRow>
        <ComicPageRow>
          <ComicPagePanel span="full" background="motion" color={MOTION_SAMPLES[2].color}>
            {MOTION_SAMPLES[2].label}
          </ComicPagePanel>
        </ComicPageRow>
      </ComicPageLayout>
    </div>
  ),
};

function LoadingTransitionDemo() {
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ padding: "2rem", background: "#222", minHeight: "100vh" }}>
      <ComicPageLayout title="Halftone → motion loading">
        <ComicPageRow>
          <ComicPagePanel
            span="full"
            background="halftone"
            color="purple"
            loading={loading}
            contentAlign="center"
          >
            <button type="button" onClick={() => setLoading((v) => !v)}>
              {loading ? "Stop loading" : "Start loading"}
            </button>
          </ComicPagePanel>
        </ComicPageRow>
      </ComicPageLayout>
    </div>
  );
}

export const LoadingTransition: Story = {
  render: () => <LoadingTransitionDemo />,
};

function CtaFooterDemo() {
  const [open, setOpen] = useState(true);
  const [lastAction, setLastAction] = useState("—");

  return (
    <div style={{ padding: "2rem", background: "#222", minHeight: "100vh" }}>
      <button type="button" onClick={() => setOpen(true)}>
        Open dialog
      </button>
      <p style={{ color: "#eee" }}>Last action: {lastAction}</p>
      <ComicPageDialog
        open={open}
        showClose
        title="CTA footer demo"
        onOpenChange={setOpen}
        ctaFooter={
          <>
            <ComicPageCtaAction label="Cancel" onClick={() => setLastAction("Cancel")} />
            <ComicPageCtaAction label="Save" fill="#2f6fed" onClick={() => setLastAction("Save")} />
          </>
        }
      >
        {Array.from({ length: 12 }, (_, index) => (
          <ComicPageRow key={index}>
            <ComicPagePanel
              span="full"
              background={index % 2 === 0 ? "halftone" : "solid"}
              color={index % 2 === 0 ? "teal" : "white"}
            >
              Scroll panel {index + 1} — footer stays sticky at the bottom center.
            </ComicPagePanel>
          </ComicPageRow>
        ))}
      </ComicPageDialog>
    </div>
  );
}

export const DialogCtaFooter: Story = {
  render: () => <CtaFooterDemo />,
};
