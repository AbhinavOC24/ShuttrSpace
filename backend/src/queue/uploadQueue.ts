import { Queue } from "bullmq"
import { redis } from "../lib/redis"

export const uploadQueue = new Queue('uploadQueue', {
    connection: redis,

})  