import fs from "fs/promises";
import path from "path";

const defaultDir = path.join(
    process.cwd(),
    "tmp",
    "uploads"
);

const defaultMaxAgeMs = 24 * 60 * 60 * 1000;
const sweepIntervalMs = 6 * 60 * 60 * 1000;

export const removeStaleTempFiles = async ({
    dir = defaultDir,
    maxAgeMs = defaultMaxAgeMs,
    now = Date.now(),
} = {}) => {
    let entries;

    try {
        entries = await fs.readdir(dir, {
            withFileTypes: true,
        });
    } catch (error) {
        if (error.code === "ENOENT") {
            return 0;
        }

        throw error;
    }

    let removed = 0;

    for (const entry of entries) {
        if (!entry.isFile()) {
            continue;
        }

        const filePath = path.join(dir, entry.name);

        try {
            const stat = await fs.stat(filePath);

            if (now - stat.mtimeMs < maxAgeMs) {
                continue;
            }

            await fs.unlink(filePath);
            removed++;
        } catch (error) {
            console.error(
                `Không thể dọn file tạm ${entry.name}:`,
                error.message
            );
        }
    }

    return removed;
};

export const startTempUploadsCleanup = ({
    dir,
    maxAgeMs,
    intervalMs = sweepIntervalMs,
} = {}) => {
    const sweep = async () => {
        try {
            const removed = await removeStaleTempFiles({
                dir,
                maxAgeMs,
            });

            if (removed > 0) {
                console.log(
                    `🧹 Đã dọn ${removed} file tạm trong tmp/uploads`
                );
            }
        } catch (error) {
            console.error("Dọn tmp/uploads thất bại:", error);
        }
    };

    sweep();

    const timer = setInterval(sweep, intervalMs);

    // Không giữ process sống chỉ vì hẹn giờ dọn dẹp
    timer.unref?.();

    return timer;
};
