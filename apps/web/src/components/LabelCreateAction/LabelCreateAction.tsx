"use client";

import { useState } from "react";
import { Button } from "@/components/StyledComponents";
import type { LabelDto } from "@/api/labels";
import { CreateLabelModal } from "@/components/CreateLabelModal/CreateLabelModal";
import { PlusOutlined } from "@ant-design/icons";

export type LabelCreateActionProps = {
  accountId: string;
  buttonText?: string;
  className?: string;
  onCreated?: (label: LabelDto) => void | Promise<void>;
};

export function LabelCreateAction({
  accountId,
  buttonText = "Create a new label",
  className,
  onCreated,
}: LabelCreateActionProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="link" className={className} onClick={() => setOpen(true)}>
        <PlusOutlined />
        {buttonText}
      </Button>
      <CreateLabelModal
        open={open}
        accountId={accountId}
        onClose={() => setOpen(false)}
        onCreated={async (label) => {
          await onCreated?.(label);
        }}
      />
    </>
  );
}
