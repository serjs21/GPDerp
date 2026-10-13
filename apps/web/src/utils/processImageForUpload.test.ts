import { ImageProcessingError, processImageForUpload } from "./processImageForUpload";

let nextNaturalSize = { width: 0, height: 0 };

class FakeImage {
  naturalWidth = 0;
  naturalHeight = 0;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  set src(_value: string) {
    this.naturalWidth = nextNaturalSize.width;
    this.naturalHeight = nextNaturalSize.height;
    queueMicrotask(() => this.onload?.());
  }
}

const drawnSizes: { width: number; height: number }[] = [];

describe("processImageForUpload", () => {
  const OriginalImage = global.Image;
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeAll(() => {
    global.Image = FakeImage as unknown as typeof Image;
    URL.createObjectURL = () => "blob:fake";
    URL.revokeObjectURL = () => undefined;
    jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(function (this: HTMLCanvasElement) {
      const { width, height } = this;
      return {
        clearRect: () => undefined,
        drawImage: () => drawnSizes.push({ width, height }),
        getImageData: (_x: number, _y: number, w: number, h: number) => ({
          data: new Uint8ClampedArray(w * h * 4).fill(255),
        }),
      } as unknown as CanvasRenderingContext2D;
    });
    HTMLCanvasElement.prototype.toBlob = function (callback: BlobCallback, type?: string) {
      callback(new Blob(["x"], { type }));
    };
  });

  afterAll(() => {
    global.Image = OriginalImage;
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    drawnSizes.length = 0;
  });

  const file = (type = "image/jpeg", size = 4 * 1024 * 1024) =>
    new File([new Uint8Array(size)], "avatar", { type });

  it("accepts a large photo and saves it at most 256px on the longest side, keeping aspect", async () => {
    nextNaturalSize = { width: 2000, height: 1500 };
    const result = await processImageForUpload(file());
    expect(result).toMatchObject({ width: 256, height: 192, mimeType: "image/webp" });
    expect(drawnSizes.every(({ width, height }) => width <= 256 && height <= 256)).toBe(true);
  });

  it("does not upscale images already smaller than the saved size", async () => {
    nextNaturalSize = { width: 120, height: 90 };
    const result = await processImageForUpload(file("image/png", 1024));
    expect(result).toMatchObject({ width: 120, height: 90 });
  });

  it("still rejects unsupported types", async () => {
    nextNaturalSize = { width: 500, height: 500 };
    await expect(processImageForUpload(file("image/gif"))).rejects.toBeInstanceOf(ImageProcessingError);
  });
});
