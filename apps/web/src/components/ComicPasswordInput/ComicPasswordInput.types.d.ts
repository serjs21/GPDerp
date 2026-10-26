import type { ComicModalInputProps } from "@/components/ComicModalInput";

/** Same props as ComicModalInput; `type` is owned by the show/hide toggle. */
export type ComicPasswordInputProps = Omit<ComicModalInputProps, "type">;
