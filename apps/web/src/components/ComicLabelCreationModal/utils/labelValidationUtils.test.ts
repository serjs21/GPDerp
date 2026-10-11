import type { LabelDto } from "@/api/labels";
import { labelSaveBlockReason } from "./labelValidationUtils";

const t = (key: string) => key;
const existing = { id: "1", name: "Joy" } as LabelDto;

describe("labelSaveBlockReason", () => {
  const base = { isLoading: false, labels: [existing] };

  it("blocks while loading, empty, too short, or duplicate", () => {
    expect(labelSaveBlockReason(t, { ...base, isLoading: true, trimmedName: "Hope" })).toBe("loadingLabels");
    expect(labelSaveBlockReason(t, { ...base, trimmedName: "" })).toBe("enterName");
    expect(labelSaveBlockReason(t, { ...base, trimmedName: "J" })).toBe("nameTooShort");
    expect(labelSaveBlockReason(t, { ...base, trimmedName: "joy" })).toBe("alreadyExists");
  });

  it("allows keeping the same name while editing that label", () => {
    expect(labelSaveBlockReason(t, { ...base, trimmedName: "Joy", editing: existing })).toBeNull();
  });
});
