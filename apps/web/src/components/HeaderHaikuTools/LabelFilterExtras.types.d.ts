import type { useHeaderHaikuLabelManage } from "./useHeaderHaikuLabelManage";

export type LabelFilterExtrasProps = {
  labels: ReturnType<typeof useHeaderHaikuLabelManage>;
  onModalClose: () => void;
};
