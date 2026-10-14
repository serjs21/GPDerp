jest.mock("../../../env", () => ({
  env: {
    R2_REGION: "auto",
    R2_S3_ENDPOINT: "https://example.r2.cloudflarestorage.com",
    R2_ACCESS_KEY_ID: "test-access-key",
    R2_SECRET_ACCESS_KEY: "test-secret",
    R2_BUCKET_NAME: "icons-bucket",
    R2_PUBLIC_BASE_URL: "https://cdn.example.com/",
  },
}));

const mockSend = jest.fn();
jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn().mockImplementation(() => ({ send: mockSend })),
  PutObjectCommand: jest.fn().mockImplementation((input: unknown) => ({ input })),
}));

jest.mock("@aws-sdk/s3-request-presigner", () => ({ getSignedUrl: jest.fn() }));

import { iconUploadService } from "../iconUpload.service";

describe("iconUploadService.uploadIconBuffer", () => {
  beforeEach(() => {
    mockSend.mockReset();
    mockSend.mockResolvedValue({});
  });

  it("stores icons with a long-lived immutable Cache-Control (keys are unique per upload)", async () => {
    const result = await iconUploadService.uploadIconBuffer({
      buffer: Buffer.from([1, 2, 3]),
      contentType: "image/webp",
    });

    expect(result).toMatchObject({ ok: true });
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend.mock.calls[0][0].input).toMatchObject({
      Bucket: "icons-bucket",
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    });
    expect(mockSend.mock.calls[0][0].input.Key).toMatch(/^icons\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.webp$/);
  });

  it("rejects unsupported types without uploading", async () => {
    const result = await iconUploadService.uploadIconBuffer({
      buffer: Buffer.from([1]),
      contentType: "image/gif",
    });
    expect(result).toEqual({ ok: false, error: "invalid_mime_type" });
    expect(mockSend).not.toHaveBeenCalled();
  });
});
