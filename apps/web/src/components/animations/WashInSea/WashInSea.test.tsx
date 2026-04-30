import { render } from "@testing-library/react";
import { WashInSea } from "./WashInSea";

describe("WashInSea", () => {
  it("renders root and animated character spans", () => {
    const { container } = render(<WashInSea direction="right" duration={1200}>Login Register</WashInSea>);
    expect(container.querySelector(".wash-sea-root")).toBeInTheDocument();
    expect(container.querySelectorAll(".wash-sea-char").length).toBeGreaterThan(0);
  });
});
