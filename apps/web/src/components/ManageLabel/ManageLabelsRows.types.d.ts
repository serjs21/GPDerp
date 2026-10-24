import type { ManageLabelsListProps } from "./ManageLabelsList.types";

export type ManageLabelsRowsProps = Omit<ManageLabelsListProps, "loading" | "onScroll">;
