"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { usePhotoGalleryStore } from "@/store/usePhotoGalleryStore";
import axios from "axios";
import Image from "next/image";

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
        setHasMore(false);
        return;
      }

      setPhotos([...photos, ...newBatch]);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("fetch error", error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, photos, setPhotos]);

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
        rootMargin: "20px",
      }
    );

    observer.observe(currentLoader);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loading, fetchMore]); // Include all dependencies

  return (
    <div className="px-8">
      <div className="columns-[320px] gap-4">
        {photos.map((photo, index) => (
          <div key={`${photo.id}-${index}`} className="mb-4 break-inside-avoid">
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
      </div>

      {hasMore ? (
        <div ref={loaderRef} className="py-6 text-center text-gray-400">
          {loading ? "Loading more..." : "Load more"}
        </div>
      ) : (
        <div className="py-6 text-center text-gray-500">
          🎉 You've reached the end!
        </div>
      )}
    </div>
  );
}
