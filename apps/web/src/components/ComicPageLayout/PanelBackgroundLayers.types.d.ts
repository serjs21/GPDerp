import type { ComicPanelBackgroundMode } from "./ComicPagePanel.types";

export type PanelBackgroundLayersProps = {
  mode: ComicPanelBackgroundMode;
  fineBands: { visible: boolean; exiting: boolean };
  shine: boolean;
  loading: boolean;
};
