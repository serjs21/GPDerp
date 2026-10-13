import {
  isImageDecoded,
  preloadAndDecodeImage,
  resetImageReadinessCache,
} from "./imageReadiness";

type Behavior = "ok" | "error" | "decode-reject-loaded";

const behaviors = new Map<string, Behavior>();
const created: FakeImage[] = [];

class FakeImage {
  decoding = "auto";
  crossOrigin: string | null = null;
  srcset = "";
  sizes = "";
  complete = false;
  naturalWidth = 0;
  private url = "";

  constructor() {
    created.push(this);
  }

  set src(value: string) {
    this.url = new URL(value, document.baseURI).href;
  }

  get src() {
    return this.url;
  }

  decode(): Promise<void> {
    const behavior = behaviors.get(this.url) ?? "ok";
    this.complete = true;
    if (behavior === "ok") {
      this.naturalWidth = 100;
      return Promise.resolve();
    }
    if (behavior === "decode-reject-loaded") {
      this.naturalWidth = 100;
      return Promise.reject(new Error("EncodingError"));
    }
    return Promise.reject(new Error("load failed"));
  }
}

const abs = (path: string) => new URL(path, document.baseURI).href;

describe("preloadAndDecodeImage", () => {
  const OriginalImage = global.Image;

  beforeEach(() => {
    resetImageReadinessCache();
    behaviors.clear();
    created.length = 0;
    global.Image = FakeImage as unknown as typeof Image;
  });

  afterAll(() => {
    global.Image = OriginalImage;
  });

  it("resolves ready after decode and marks the image decoded", async () => {
    expect(isImageDecoded({ src: "/a.png" })).toBe(false);
    await expect(preloadAndDecodeImage({ src: "/a.png" })).resolves.toBe("ready");
    expect(isImageDecoded({ src: "/a.png" })).toBe(true);
  });

  it("dedupes concurrent and later requests for the same absolute URL", async () => {
    const first = preloadAndDecodeImage({ src: "/b.png" });
    const second = preloadAndDecodeImage({ src: abs("/b.png") });
    expect(second).toBe(first);
    await first;
    await preloadAndDecodeImage({ src: "/b.png" });
    expect(created).toHaveLength(1);
  });

  it("keeps CORS and no-CORS fetches of the same URL separate, matching the browser", async () => {
    await preloadAndDecodeImage({ src: "/mask.png" });
    await preloadAndDecodeImage({ src: "/mask.png", crossOrigin: "anonymous" });
    expect(created).toHaveLength(2);
    expect(created[1]!.crossOrigin).toBe("anonymous");
    expect(isImageDecoded({ src: "/mask.png", crossOrigin: "anonymous" })).toBe(true);
  });

  it("applies srcSet/sizes so the loader picks the same candidate as the <img>", async () => {
    const asset = { src: "/bg.webp", srcSet: "/bg-1x.webp 800w, /bg.webp 1600w", sizes: "100vw" };
    await preloadAndDecodeImage(asset);
    expect(created[0]).toMatchObject({ srcset: asset.srcSet, sizes: asset.sizes });
    expect(isImageDecoded(asset)).toBe(true);
    expect(isImageDecoded({ src: "/bg.webp" })).toBe(false);
  });

  it("resolves failed on load error, never marks decoded, and retries later", async () => {
    behaviors.set(abs("/broken.png"), "error");
    await expect(preloadAndDecodeImage({ src: "/broken.png" })).resolves.toBe("failed");
    expect(isImageDecoded({ src: "/broken.png" })).toBe(false);

    behaviors.set(abs("/broken.png"), "ok");
    await expect(preloadAndDecodeImage({ src: "/broken.png" })).resolves.toBe("ready");
    expect(created).toHaveLength(2);
  });

  it("treats a decode rejection on a loaded image (naturalWidth > 0) as ready", async () => {
    behaviors.set(abs("/huge.png"), "decode-reject-loaded");
    await expect(preloadAndDecodeImage({ src: "/huge.png" })).resolves.toBe("ready");
  });
});
