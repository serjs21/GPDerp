import { parseClientMessage, pongMessage } from "../clientMessages";

describe("parseClientMessage", () => {
  it("parses the app-level ping from strings and buffers", () => {
    expect(parseClientMessage('{"type":"ping"}')).toEqual({ type: "ping" });
    expect(parseClientMessage(Buffer.from('{"type":"ping"}'))).toEqual({ type: "ping" });
    expect(parseClientMessage([Buffer.from('{"type":'), Buffer.from('"ping"}')])).toEqual({ type: "ping" });
  });

  it("keeps the existing share-links channel messages", () => {
    expect(parseClientMessage('{"type":"subscribe","channel":"share-links"}')).toEqual({
      type: "subscribe",
      channel: "share-links",
    });
    expect(parseClientMessage(Buffer.from('{"type":"unsubscribe","channel":"share-links"}'))).toEqual({
      type: "unsubscribe",
      channel: "share-links",
    });
  });

  it("ignores malformed or unknown messages", () => {
    expect(parseClientMessage("not json")).toBeNull();
    expect(parseClientMessage('{"type":"subscribe","channel":"other"}')).toBeNull();
    expect(parseClientMessage('{"type":"generate"}')).toBeNull();
  });
});

describe("pongMessage", () => {
  it("reports whether the socket is authenticated", () => {
    expect(pongMessage(true, 123)).toEqual({ kind: "pong", data: { authenticated: true, serverTime: 123 } });
  });
});
