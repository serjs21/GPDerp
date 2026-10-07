import { invertBlackWhiteSvg } from "./invertBlackWhiteSvg";

describe("invertBlackWhiteSvg", () => {
  it("swaps pure black and white in style blocks and attributes", () => {
    const svg =
      '<svg fill="none"><style>.a{fill:#FFFFFF;stroke:#000000}.b{fill: #fff}</style>' +
      '<path stroke="#000" fill="white"/></svg>';
    expect(invertBlackWhiteSvg(svg)).toBe(
      '<svg fill="none"><style>.a{fill:#000000;stroke:#ffffff}.b{fill: #000000}</style>' +
        '<path stroke="#ffffff" fill="#000000"/></svg>',
    );
  });

  it("keeps other colors, including near-black and longer hex values", () => {
    const svg = '<svg fill="none"><path fill="#231f20"/><path fill="#fffabc"/><path fill="#e1eaf2"/></svg>';
    expect(invertBlackWhiteSvg(svg)).toBe(svg);
  });

  it("gives the root a white fill when it has none so default-black shapes invert", () => {
    expect(invertBlackWhiteSvg('<svg viewBox="0 0 1 1"><path d="M0 0"/></svg>')).toBe(
      '<svg fill="#ffffff" viewBox="0 0 1 1"><path d="M0 0"/></svg>',
    );
  });
});
