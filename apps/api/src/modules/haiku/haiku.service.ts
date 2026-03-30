import type { FastifyRequest } from "fastify";
import { TAB_HEADER_KEY } from "../../consts/ids";
import { runHaikuAgentStream } from "../../agent";
import { runHaikuAgentStreamMock } from "../../mocks/textStream";

export const haikuService = {
  async createHaikuStream(subject: string, request: FastifyRequest, useRealAgent: boolean = false) {
    const uid = request.headers?.[TAB_HEADER_KEY]?.toString();

    // Default behavior: use the mock stream.
    // Enable the real agent by setting `USE_HAIKU_AGENT=true`.
    if (!useRealAgent) {
      // NOTE: keep the mock as the safe default for local dev/testing.
      return runHaikuAgentStreamMock();
    }

    // Real streaming (requires OpenAI agent setup + network access).
    return runHaikuAgentStream(subject, {
      context: {
        uid: uid ?? "anonymous",
        isProUser: true,
      },
    });
  },
};

