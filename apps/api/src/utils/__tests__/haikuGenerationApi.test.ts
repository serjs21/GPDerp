import { parseHaikuGenerationApi } from "../haikuGenerationApi";

describe("parseHaikuGenerationApi", () => {
  it("defaults to the dev mock when unset or blank", () => {
    expect(parseHaikuGenerationApi({} as NodeJS.ProcessEnv)).toBe("dev");
    expect(parseHaikuGenerationApi({ HAIKU_GENERATION_API: "  " } as NodeJS.ProcessEnv)).toBe("dev");
  });

  it("accepts dev and prod", () => {
    expect(parseHaikuGenerationApi({ HAIKU_GENERATION_API: "dev" } as NodeJS.ProcessEnv)).toBe("dev");
    expect(
      parseHaikuGenerationApi({ HAIKU_GENERATION_API: "prod", OPENAI_API_KEY: "sk-test" } as NodeJS.ProcessEnv),
    ).toBe("prod");
  });

  it("rejects unknown values", () => {
    expect(() => parseHaikuGenerationApi({ HAIKU_GENERATION_API: "production" } as NodeJS.ProcessEnv)).toThrow(
      /expected dev or prod/,
    );
  });

  it("requires OPENAI_API_KEY for prod", () => {
    expect(() => parseHaikuGenerationApi({ HAIKU_GENERATION_API: "prod" } as NodeJS.ProcessEnv)).toThrow(
      /requires OPENAI_API_KEY/,
    );
  });
});
