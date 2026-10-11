"use client";

import { useCallback, useId } from "react";
import { useTranslations } from "next-intl";
import { withDefaults } from "@/utils/props/withDefaults";
import { TEXT_BUBBLE_DROPDOWN_DEFAULTS } from "./consts/textBubbleConsts";
import { TextBubbleOptionList } from "./TextBubbleOptionList";
import { TextBubbleStage } from "./TextBubbleStage";
import { TextBubbleTrigger } from "./TextBubbleTrigger";
import type { TextBubbleDropdownProps } from "./TextBubbleDropdown.types";
import { useTextBubblePanel } from "./useTextBubblePanel";
import { textBubbleRootClassName, textBubbleTriggerLabel } from "./utils/textBubbleUtils";
import styles from "./TextBubbleDropdown.module.css";

export type {
  TextBubbleDropdownProps,
  TextBubbleOption,
  TextBubbleTailDirection,
  TextBubbleDropDirection,
} from "./TextBubbleDropdown.types";

/**
 * Comic speech-bubble dropdown with scrollable options and a checkmarked selection.
 */
export function TextBubbleDropdown(props: TextBubbleDropdownProps) {
  const t = useTranslations("TextBubbleDropdown");
  const { value, defaultOpen, disabled, tailDirection, dropDirection } = withDefaults(
    props,
    TEXT_BUBBLE_DROPDOWN_DEFAULTS,
  );
  const {
    options,
    onChange,
    open: openProp,
    onOpenChange,
    className,
    renderTrigger,
    renderOption,
    panelHeader,
    emptyMessage,
  } = props;
  const placeholder = props.placeholder ?? t("placeholder");
  const listId = useId();
  const { rootRef, shellRef, open, close, toggle, stageMounted, panelPresent, bubbleReady, handleBubblesReady } =
    useTextBubblePanel({ openProp, defaultOpen, onOpenChange, disabled });

  const selectOption = useCallback(
    (nextValue: string) => {
      onChange?.(nextValue);
      close();
    },
    [onChange, close],
  );

  return (
    <div ref={rootRef} className={textBubbleRootClassName(open, className)}>
      <TextBubbleTrigger
        open={open}
        label={textBubbleTriggerLabel(options, value, placeholder)}
        value={value}
        renderTrigger={renderTrigger}
        controlsId={panelPresent ? listId : undefined}
        disabled={disabled}
        onToggle={toggle}
      />

      {stageMounted ? (
        <TextBubbleStage
          dropDirection={dropDirection}
          tailDirection={tailDirection}
          shellRef={shellRef}
          open={open}
          bubbleReady={bubbleReady}
          onBubblesReady={handleBubblesReady}
        >
          {panelHeader ? <div className={styles.panelHeader}>{panelHeader}</div> : null}
          <TextBubbleOptionList
            listId={listId}
            options={options}
            value={value}
            placeholder={placeholder}
            emptyMessage={emptyMessage}
            renderOption={renderOption}
            onSelect={selectOption}
          />
        </TextBubbleStage>
      ) : null}
    </div>
  );
}
