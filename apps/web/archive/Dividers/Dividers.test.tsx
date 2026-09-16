import { render, screen } from "@testing-library/react";
import { Kasagi } from "./Kasagi";
import { Shimaki } from "./Shimaki";
import { Nuki } from "./Nuki";
import { Pillars } from "./Pillars";

describe("Kasagi", () => {
  it("renders a div with the kasagi class", () => {
    const { container } = render(<Kasagi />);
    const el = container.firstElementChild!;
    expect(el.tagName).toBe("DIV");
    expect(el.className).toContain("kasagi");
  });

  it("includes the dividers token class for self-contained variables", () => {
    const { container } = render(<Kasagi />);
    expect(container.firstElementChild!.className).toContain("dividers");
  });

  it("forwards an additional className", () => {
    const { container } = render(<Kasagi className="custom" />);
    expect(container.firstElementChild!.className).toContain("custom");
  });

  it("applies inline style to the element", () => {
    const { container } = render(<Kasagi style={{ marginTop: "10px" }} />);
    expect(container.firstElementChild).toHaveStyle({ marginTop: "10px" });
  });
});

describe("Shimaki", () => {
  it("renders a div with the shimaki class", () => {
    const { container } = render(<Shimaki />);
    const el = container.firstElementChild!;
    expect(el.tagName).toBe("DIV");
    expect(el.className).toContain("shimaki");
  });

  it("includes the dividers token class for self-contained variables", () => {
    const { container } = render(<Shimaki />);
    expect(container.firstElementChild!.className).toContain("dividers");
  });

  it("forwards an additional className", () => {
    const { container } = render(<Shimaki className="custom" />);
    expect(container.firstElementChild!.className).toContain("custom");
  });

  it("applies inline style to the element", () => {
    const { container } = render(<Shimaki style={{ height: "8px" }} />);
    expect(container.firstElementChild).toHaveStyle({ height: "8px" });
  });
});

describe("Nuki", () => {
  it("renders a div with the nuki class", () => {
    const { container } = render(<Nuki />);
    const el = container.firstElementChild!;
    expect(el.tagName).toBe("DIV");
    expect(el.className).toContain("nuki");
  });

  it("includes the dividers token class for self-contained variables", () => {
    const { container } = render(<Nuki />);
    expect(container.firstElementChild!.className).toContain("dividers");
  });

  it("forwards an additional className", () => {
    const { container } = render(<Nuki className="extra" />);
    expect(container.firstElementChild!.className).toContain("extra");
  });

  it("applies inline style to the element", () => {
    const { container } = render(<Nuki style={{ width: "50%" }} />);
    expect(container.firstElementChild).toHaveStyle({ width: "50%" });
  });
});

describe("Pillars", () => {
  it("renders children between two pillar divs", () => {
    render(
      <Pillars>
        <span>inner content</span>
      </Pillars>
    );
    expect(screen.getByText("inner content")).toBeInTheDocument();
  });

  it("renders exactly two pillar elements flanking the children", () => {
    const { container } = render(
      <Pillars>
        <span>middle</span>
      </Pillars>
    );
    const wrapper = container.firstElementChild!;
    const children = Array.from(wrapper.children);

    expect(children).toHaveLength(3);
    expect(children[0].className).toContain("pillar");
    expect(children[1].tagName).toBe("SPAN");
    expect(children[2].className).toContain("pillar");
  });

  it("includes the dividers token class on the wrapper", () => {
    const { container } = render(
      <Pillars>
        <div />
      </Pillars>
    );
    expect(container.firstElementChild!.className).toContain("dividers");
  });

  it("includes the pillars class on the wrapper", () => {
    const { container } = render(
      <Pillars>
        <div />
      </Pillars>
    );
    expect(container.firstElementChild!.className).toContain("pillars");
  });

  it("forwards an additional className to the wrapper", () => {
    const { container } = render(
      <Pillars className="custom-pillars">
        <div />
      </Pillars>
    );
    expect(container.firstElementChild!.className).toContain("custom-pillars");
  });

  it("applies inline style to the wrapper", () => {
    const { container } = render(
      <Pillars style={{ gap: "4px" }}>
        <div />
      </Pillars>
    );
    expect(container.firstElementChild).toHaveStyle({ gap: "4px" });
  });
});
