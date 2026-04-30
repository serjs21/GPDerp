import React from "react";
import { render, screen } from "@testing-library/react";
import { HaikuDisplay } from "./HaikuDisplay";
import type { ChatLog } from "./HaikuDisplay";

jest.mock("motion/react", () => ({
  motion: {
    div: (props: React.HTMLAttributes<HTMLDivElement>) => <div {...props} />,
  },
  useScroll: () => ({ scrollYProgress: { get: () => 0, on: () => () => {} } }),
  useTransform: () => ({ get: () => 0, on: () => () => {} }),
}));

jest.mock("../StreamText", () => ({
  StreamText: ({ text }: { text: string }) => <span data-testid="stream-text">{text}</span>,
}));

function makeLogs(
  entries: Array<{ id: string; subject: string; content: string; createdAt: string }>
): Record<string, ChatLog> {
  const logs: Record<string, ChatLog> = {};
  for (const e of entries) {
    logs[e.id] = { subject: e.subject, content: e.content, createdAt: e.createdAt };
  }
  return logs;
}

describe("HaikuDisplay", () => {
  it("renders nothing when chatLogs is empty", () => {
    const { container } = render(<HaikuDisplay chatLogs={{}} />);
    expect(container.querySelectorAll("[class*='entry']")).toHaveLength(0);
  });

  it("renders each chat log entry", () => {
    const logs = makeLogs([
      { id: "1", subject: "Cherry blossoms", content: "petals fall softly", createdAt: "02:30 PM" },
      { id: "2", subject: "Mountain stream", content: "water over stones", createdAt: "02:31 PM" },
    ]);

    render(<HaikuDisplay chatLogs={logs} />);

    expect(screen.getByText(/Cherry blossoms/)).toBeInTheDocument();
    expect(screen.getByText("petals fall softly")).toBeInTheDocument();
    expect(screen.getByText(/Mountain stream/)).toBeInTheDocument();
    expect(screen.getByText("water over stones")).toBeInTheDocument();
  });

  it("displays the createdAt timestamp for each entry", () => {
    const logs = makeLogs([
      { id: "1", subject: "Haiku", content: "text", createdAt: "02:30 PM" },
    ]);

    render(<HaikuDisplay chatLogs={logs} />);

    expect(screen.getByText(/02:30 PM/)).toBeInTheDocument();
  });

  it("orders entries newest-first (last inserted appears at top)", () => {
    const logs = makeLogs([
      { id: "a", subject: "First", content: "", createdAt: "01:00 PM" },
      { id: "b", subject: "Second", content: "", createdAt: "02:00 PM" },
      { id: "c", subject: "Third", content: "", createdAt: "03:00 PM" },
    ]);

    render(<HaikuDisplay chatLogs={logs} />);

    const streamTexts = screen.getAllByTestId("stream-text");
    expect(streamTexts[0]).toHaveTextContent("Third");
    expect(streamTexts[1]).toHaveTextContent("Second");
    expect(streamTexts[2]).toHaveTextContent("First");
  });

  it("passes createdAt and subject together to StreamText", () => {
    const logs = makeLogs([
      { id: "1", subject: "Autumn moon", content: "silver light", createdAt: "11:00 PM" },
    ]);

    render(<HaikuDisplay chatLogs={logs} />);

    const streamText = screen.getByTestId("stream-text");
    expect(streamText).toHaveTextContent("11:00 PM: Autumn moon");
  });

  it("renders content in a separate element from the stream text", () => {
    const logs = makeLogs([
      { id: "1", subject: "Autumn moon", content: "silver light", createdAt: "11:00 PM" },
    ]);

    render(<HaikuDisplay chatLogs={logs} />);

    const streamText = screen.getByTestId("stream-text");
    const content = screen.getByText("silver light");

    expect(streamText).not.toBe(content);
  });
});
