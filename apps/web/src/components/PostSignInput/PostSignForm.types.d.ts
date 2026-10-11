import type { PostSignInputProps } from "./PostSignInput";

export type PostSignFormProps = Pick<
  PostSignInputProps,
  "subject" | "onSubjectChange" | "onSubmit" | "inputRef" | "placeholder" | "submitLabel"
> & {
  isLoading: boolean;
};
