import { Worker } from "bullmq";
import { redis } from "../lib/redis";

import { generateThumbnail, savePhoto, failPhoto } from "../utils/image";



const worker = new Worker("uploadQueue", async (job) => {
    const { userId, photoId, imageUrl, metadata } = job.data;
    console.log(`[Worker] 🛠️ Processing job ${job.id} for userId: ${userId}...`);

    try {
        await savePhoto({
            photoId,
            userId,
            imageUrl,
            thumbnailUrl: generateThumbnail(imageUrl),
            metadata
        });
        return { success: true };
    } catch (error) {
        console.error(`[Worker] ❌ Error in job ${job.id}:`, error);
        if (photoId) await failPhoto(photoId);
        throw error;
    }
}, { connection: redis });

worker.on("completed", (job) => {
    console.log(`[Worker] ✅ Job ${job.id} (Image: ${job.data.metadata?.title || 'Untitled'}) completed successfully.`);
});

worker.on("failed", (job, err) => {
    console.error(`[Worker] 💀 Job ${job?.id} failed definitely:`, err.message);
});