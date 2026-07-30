import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  createStoredZip,
  normalizeReleaseTextFiles,
  sha256File,
  zipEntryNames
} from "./release-utils.js";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true }))
  );
});

describe("release utilities", () => {
  it("creates a deterministic, sorted runtime-only ZIP", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "sotc-release-"));
    temporaryDirectories.push(root);
    await mkdir(path.join(root, "assets"));
    await writeFile(path.join(root, "index.html"), "<main>Shadows of the City</main>\n");
    await writeFile(path.join(root, "assets", "app.js"), "console.log('0.1.0');\n");

    const first = await createStoredZip(root, "shadows-of-the-city-0.1.0");
    const second = await createStoredZip(root, "shadows-of-the-city-0.1.0");

    expect(first).toEqual(second);
    expect(zipEntryNames(first)).toEqual([
      "shadows-of-the-city-0.1.0/assets/app.js",
      "shadows-of-the-city-0.1.0/index.html"
    ]);

    const archivePath = path.join(root, "release.zip");
    await writeFile(archivePath, first);
    expect(await sha256File(archivePath)).toMatch(/^[a-f0-9]{64}$/);
  });

  it("normalizes text line endings without changing binary assets", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "sotc-release-text-"));
    temporaryDirectories.push(root);
    const binary = Buffer.from([0x00, 0x0d, 0x0a, 0xff]);
    await writeFile(path.join(root, "index.html"), "first\r\nsecond\rthird\n");
    await writeFile(path.join(root, "asset.png"), binary);

    await normalizeReleaseTextFiles(root);

    expect(await readFile(path.join(root, "index.html"), "utf8")).toBe("first\nsecond\nthird\n");
    expect(await readFile(path.join(root, "asset.png"))).toEqual(binary);
  });
});
