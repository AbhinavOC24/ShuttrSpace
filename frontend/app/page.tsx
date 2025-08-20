"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { usePhotoGalleryStore } from "@/store/usePhotoGalleryStore";
import axios from "axios";
import Image from "next/image";
import Masonry from "react-masonry-css";

export default function InfiniteScrollGallery() {
  const { photos, setPhotos, resetPhotos } = usePhotoGalleryStore();
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  const fetchMore = useCallback(async () => {
    try {
      if (loading || !hasMore) return;

      setLoading(true);
      console.log(`Fetching page ${page}...`);

      const res = await axios.get(
        `/api/u/photo/getInfinitePhotos?skip=${page * 20}&take=20`
      );

      const newBatch = res.data;
      console.log(`Received ${newBatch.length} photos`);

      if (newBatch.length === 0) {
        const dummy = Array.from({ length: 20 }).map((_, i) => ({
          id: page * 20 + i,
          title: `Dummy ${i}`,
          thumbnailUrl: `https://picsum.photos/seed/${page * 20 + i}/400/300`,
          imageUrl: `https://picsum.photos/seed/${page * 20 + i}/800/600`,
          tags: [],
          createdAt: new Date().toISOString(),
        }));

        setPhotos([...photos, ...dummy]);
        setPage((prev) => prev + 1);
        return;
      }

      // Use functional update to avoid dependency on photos
      setPhotos([...photos, ...newBatch]);

      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("fetch error", error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, setPhotos]);

  useEffect(() => {
    resetPhotos();
    setPage(0);
    setHasMore(true);
  }, [resetPhotos]);

  useEffect(() => {
    const currentLoader = loaderRef.current;
    if (!currentLoader) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        console.log("Intersection:", {
          isIntersecting: target.isIntersecting,
          hasMore,
          loading,
        });

        if (target.isIntersecting && hasMore && !loading) {
          fetchMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px", // Increased to trigger earlier
      }
    );

    observer.observe(currentLoader);

    return () => {
      observer.disconnect();
    };
  }, [fetchMore, hasMore, loading]); // Added hasMore and loading as dependencies

  // Masonry breakpoint configuration
  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  return (
    <div className="px-8">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex w-auto -ml-4"
        columnClassName="pl-4 bg-clip-padding"
      >
        {photos.map((photo, index) => (
          <div key={`${photo.id}-${index}`} className="mb-4">
            <Image
              src={photo.thumbnailUrl}
              alt={photo.title}
              width={400}
              height={400}
              unoptimized
              className="w-full rounded-lg"
            />
          </div>
        ))}
      </Masonry>

      {hasMore ? (
        <div ref={loaderRef} className="py-6 text-center text-gray-400">
          {loading ? "Loading more..." : "Load more"}
        </div>
      ) : (
        <div className="py-6 text-center text-gray-500">
          {"🎉 You've reached the end!"}
        </div>
      )}
    </div>
  );
}
