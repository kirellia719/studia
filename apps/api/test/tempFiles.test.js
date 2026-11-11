import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
    removeStaleTempFiles,
} from "../src/utils/tempFiles.js";

test("removeStaleTempFiles: chỉ xoá file cũ hơn ngưỡng", async () => {
    const dir = await fs.mkdtemp(
        path.join(os.tmpdir(), "stady-tmp-")
    );

    const oldFile = path.join(dir, "old.mp4");
    const freshFile = path.join(dir, "fresh.mp4");

    await fs.writeFile(oldFile, "old");
    await fs.writeFile(freshFile, "fresh");

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    await fs.utimes(oldFile, twoHoursAgo, twoHoursAgo);

    const removed = await removeStaleTempFiles({
        dir,
        maxAgeMs: 60 * 60 * 1000,
    });

    const left = await fs.readdir(dir);

    assert.equal(removed, 1);
    assert.deepEqual(left, ["fresh.mp4"]);

    await fs.rm(dir, { recursive: true, force: true });
});

test("removeStaleTempFiles: thư mục chưa tồn tại thì trả 0", async () => {
    const removed = await removeStaleTempFiles({
        dir: path.join(os.tmpdir(), "stady-tmp-khong-ton-tai"),
    });

    assert.equal(removed, 0);
});
