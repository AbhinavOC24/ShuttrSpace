import { Request, Response } from "express";

import prismaClient from "../lib/prisma";

import { createPhotosArraySchema } from "../zod/userType";

export const uploadPhotos = async (req: Request, res: Response) => {
  try {
    if (!req.session?.hasProfile || !req.session?.slug) {
      return res
        .status(403)
        .json({ error: "Profile required to upload photos" });
    }
    const userExists = await prismaClient.user.findUnique({
      where: { slug: req.session.slug },
      select: { id: true },
    });

    if (!userExists) {
      return res.status(403).json({ error: "Profile not found" });
    }

    const result = createPhotosArraySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() });
    }

    const { uploadedPhotos } = result.data;

    console.log(uploadPhotos);

    const response = await prismaClient.photo.createMany({
      data: uploadedPhotos.map((p) => ({
        title: p.title,
        tags: p.tags,
        thumbnailUrl: p.thumbnailUrl,
        photoUrl: p.imageUrl,
        userId: userExists.id,
      })),
    });

    res.status(201).json({ response });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to upload photos from uploadPhotos" });
  }
};
