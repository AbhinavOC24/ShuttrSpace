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

    const result = createPhotosArraySchema.safeParse(req.body.batchInfo);
    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() });
    }

    const { metadataCid, signature, items } = result.data;

    const newPhotos = await Promise.all(
      items.map((p) =>
        prismaClient.photo.create({
          data: {
            title: p.title,
            tags: p.tags,
            thumbnailUrl: p.thumbnailUrl,
            imageUrl: p.imageUrl,
            userId: userExists.id,
            metadataCid,
            signature,
          },
          select: {
            id: true,
            title: true,
            tags: true,
            thumbnailUrl: true,
            imageUrl: true,
            createdAt: true,
          },
        })
      )
    );

    res
      .status(201)
      .json({ photos: newPhotos, message: "Uploaded Succesfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to upload photos from uploadPhotos" });
  }
};

export const getPhotos = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    console.log(slug);
    if (!slug) return;
    const userExists = await prismaClient.user.findUnique({
      where: { slug: slug },
      select: { id: true },
    });

    if (!userExists) {
      return res.status(403).json({ error: "Profile not found" });
    }

    const photos = await prismaClient.photo.findMany({
      where: { userId: userExists.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        tags: true,
        thumbnailUrl: true,
        imageUrl: true,
        createdAt: true,
      },
    });

    res.status(200).json({ photos });
  } catch (error) {
    console.error("Error in getPhotos:", error);
    res.status(500).json({ error: "Failed to fetch photos" });
  }
};
