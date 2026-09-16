import { createUserSocketRegistry, generationCreditsMessage } from "../userSocketRegistry";

function fakeSocket(readyState = 1) {
  return {
    readyState,
    sent: [] as string[],
    send(data: string) {
      this.sent.push(data);
    },
  };
}

describe("createUserSocketRegistry", () => {
  it("fans out to every open socket for that user", () => {
    const registry = createUserSocketRegistry();
    const tabA = fakeSocket();
    const tabB = fakeSocket();
    const other = fakeSocket();
    registry.subscribe("user-1", tabA);
    registry.subscribe("user-1", tabB);
    registry.subscribe("user-2", other);

    registry.sendToUser("user-1", generationCreditsMessage(12));

    const payload = JSON.stringify(generationCreditsMessage(12));
    expect(tabA.sent).toEqual([payload]);
    expect(tabB.sent).toEqual([payload]);
    expect(other.sent).toEqual([]);
  });
});
