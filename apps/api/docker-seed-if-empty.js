import { execFileSync } from "node:child_process";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const waitForDatabase = async (attempts = 30) => {
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            await prisma.$connect();
            return;
        } catch (error) {
            if (attempt === attempts) {
                throw error;
            }

            await new Promise((resolve) => {
                setTimeout(resolve, 2000);
            });
        }
    }
};

await waitForDatabase();

const userCount = await prisma.user.count();

await prisma.$disconnect();

if (userCount === 0) {
    execFileSync(process.execPath, ["prisma/seed.js"], {
        stdio: "inherit",
    });
}
