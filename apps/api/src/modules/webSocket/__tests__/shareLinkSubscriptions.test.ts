import {
  createShareLinkSubscriberRegistry,
  parseShareLinkChannelMessage,
  SHARE_LINKS_CHANNEL,
} from "../shareLinkSubscriptions";

function fakeSocket(readyState = 1) {
  return {
    readyState,
    sent: [] as string[],
    send(data: string) {
      this.sent.push(data);
    },
  };
}

describe("parseShareLinkChannelMessage", () => {
  it("parses subscribe and unsubscribe for share-links", () => {
    expect(parseShareLinkChannelMessage(JSON.stringify({ type: "subscribe", channel: SHARE_LINKS_CHANNEL }))).toEqual({
      type: "subscribe",
      channel: SHARE_LINKS_CHANNEL,
    });
    expect(
      parseShareLinkChannelMessage(Buffer.from(JSON.stringify({ type: "unsubscribe", channel: SHARE_LINKS_CHANNEL }))),
    ).toEqual({
      type: "unsubscribe",
      channel: SHARE_LINKS_CHANNEL,
    });
  });

  it("ignores other channels and malformed payloads", () => {
    expect(parseShareLinkChannelMessage(JSON.stringify({ type: "subscribe", channel: "haiku" }))).toBeNull();
    expect(parseShareLinkChannelMessage("not-json")).toBeNull();
  });
});

describe("createShareLinkSubscriberRegistry", () => {
  it("sends only to subscribed open sockets for that user", () => {
    const registry = createShareLinkSubscriberRegistry();
    const ownerA = fakeSocket();
    const ownerB = fakeSocket();
    const closed = fakeSocket(3);
    registry.subscribe("user-1", ownerA);
    registry.subscribe("user-1", closed);
    registry.subscribe("user-2", ownerB);

    registry.sendToUser("user-1", { kind: "share_link", data: { id: "link-1" } });

    expect(ownerA.sent).toEqual([JSON.stringify({ kind: "share_link", data: { id: "link-1" } })]);
    expect(ownerB.sent).toEqual([]);
    expect(closed.sent).toEqual([]);
  });

  it("unsubscribe stops further fan-out", () => {
    const registry = createShareLinkSubscriberRegistry();
    const ws = fakeSocket();
    registry.subscribe("user-1", ws);
    registry.unsubscribe(ws);
    registry.sendToUser("user-1", { kind: "share_link_deleted", data: { id: "x" } });
    expect(ws.sent).toEqual([]);
  });
});
