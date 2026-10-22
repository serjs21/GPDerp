jest.mock("../../../env", () => ({ env: { HAIKU_GENERATION_API: "dev" } }));
jest.mock("../../../agent", () => ({ runHaikuAgentStream: jest.fn() }));
jest.mock("../../../mocks/textStream", () => ({ runHaikuAgentStreamMock: jest.fn() }));
jest.mock("../haiku.repository", () => ({ haikuRepository: {} }));
jest.mock("../../auth/repository", () => ({ authRepository: {} }));
jest.mock("../../label/label.repository", () => ({ labelRepository: {} }));
jest.mock("../../postcard/postcardBatch.repository", () => ({ postcardBatchRepository: {} }));
jest.mock("../../postcard/postcardQueue", () => ({ enqueuePostcardEmails: jest.fn() }));
jest.mock("../../postcard/postcardTextWrap", () => ({ postcardMessageFits: jest.fn() }));

import type { FastifyRequest } from "fastify";
import { haikuService } from "../haiku.service";

const { env } = jest.requireMock("../../../env") as { env: { HAIKU_GENERATION_API: "dev" | "prod" } };
const { runHaikuAgentStream } = jest.requireMock("../../../agent") as { runHaikuAgentStream: jest.Mock };
const { runHaikuAgentStreamMock } = jest.requireMock("../../../mocks/textStream") as {
  runHaikuAgentStreamMock: jest.Mock;
};

const request = { headers: { "x-tab-id": "tab-1" } } as unknown as FastifyRequest;
const context = { accountId: "acc-1", createdById: "user-1" };

describe("haikuService.createHaikuStream generation backend", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    runHaikuAgentStream.mockResolvedValue([]);
    runHaikuAgentStreamMock.mockReturnValue([]);
  });

  it("streams the local mock when HAIKU_GENERATION_API=dev", async () => {
    env.HAIKU_GENERATION_API = "dev";
    await haikuService.createHaikuStream("rain", request, context);
    expect(runHaikuAgentStreamMock).toHaveBeenCalledTimes(1);
    expect(runHaikuAgentStream).not.toHaveBeenCalled();
  });

  it("streams the real agent when HAIKU_GENERATION_API=prod", async () => {
    env.HAIKU_GENERATION_API = "prod";
    await haikuService.createHaikuStream("rain", request, context);
    expect(runHaikuAgentStream).toHaveBeenCalledWith("rain", expect.objectContaining({ context: expect.anything() }));
    expect(runHaikuAgentStreamMock).not.toHaveBeenCalled();
  });
});
