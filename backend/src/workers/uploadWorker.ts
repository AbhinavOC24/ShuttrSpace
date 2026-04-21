import { Worker } from "bullmq";
import { redis } from "../lib/redis";

import { generateThumbnail, savePhoto } from "../utils/image";



const worker = new Worker("uploadQueue", async (job) => {
    const { userId, imageUrl, metadata } = job.data;

    await savePhoto({
        userId,
        imageUrl,
        thumbnailUrl: generateThumbnail(imageUrl),
        metadata
    })
    return { success: true }
}, { connection: redis });


worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
    console.error(`Job failed:`, err);
});