import { Worker } from "bullmq";
import { redis } from "../lib/redis";

import { generateThumbnail, savePhoto } from "../utils/image";



const worker = new Worker("uploadQueue", async (job) => {
    const { userId, imageUrl, metadata } = job.data;
    console.log(`[Worker] 🛠️ Processing job ${job.id} for userId: ${userId}...`);

    try {
        await savePhoto({
            userId,
            imageUrl,
            thumbnailUrl: generateThumbnail(imageUrl),
            metadata
        });
        return { success: true };
    } catch (error) {
        console.error(`[Worker] ❌ Error in job ${job.id}:`, error);
        throw error;
    }
}, { connection: redis });

worker.on("completed", (job) => {
    console.log(`[Worker] ✅ Job ${job.id} (Image: ${job.data.metadata?.title || 'Untitled'}) completed successfully.`);
});

worker.on("failed", (job, err) => {
    console.error(`[Worker] 💀 Job ${job?.id} failed definitely:`, err.message);
});