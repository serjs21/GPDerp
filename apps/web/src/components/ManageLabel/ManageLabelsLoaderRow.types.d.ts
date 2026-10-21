import type { ManageLabelsListLoaders, ManageLabelsListProps } from "./ManageLabelsList.types";

export type ManageLabelsLoaderRowProps = Pick<ManageLabelsListProps, "loaders"> & {
  /** Which of `loaders` this row shows. */
  kind: keyof ManageLabelsListLoaders;
};
