import { withDefaults } from "./withDefaults";

type Props = { size?: number; label?: string | null; flag?: boolean; id: string };

describe("withDefaults", () => {
  it("fills only undefined props", () => {
    const props: Props = { id: "a", size: undefined, label: null, flag: false };
    expect(withDefaults(props, { size: 36, label: "x", flag: true })).toEqual({
      id: "a",
      size: 36,
      label: null,
      flag: false,
    });
  });

  it("fills missing keys and keeps provided values", () => {
    expect(withDefaults<Props, { size: number }>({ id: "b", size: 0 }, { size: 36 })).toEqual({
      id: "b",
      size: 0,
    });
    expect(withDefaults<Props, { size: number }>({ id: "c" }, { size: 36 })).toEqual({ id: "c", size: 36 });
  });

  it("does not mutate the input props", () => {
    const props: Props = { id: "d" };
    withDefaults(props, { size: 1 });
    expect(props).toEqual({ id: "d" });
  });
});
