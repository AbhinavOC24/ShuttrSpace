"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { usePhotoGalleryStore } from "@/store/usePhotoGalleryStore";
import api from "@/lib/api";
import Image from "next/image";
import Masonry from "react-masonry-css";
import ImageDetails from "./u/[slug]/_components/ImageDetails";
import { useProfileStore } from "@/store/useProfileStore";

export default function InfiniteScrollGallery() {
  const photos = usePhotoGalleryStore((state) => state.photos);
  const addPhotos = usePhotoGalleryStore((state) => state.addPhotos);
  const resetPhotos = usePhotoGalleryStore((state) => state.resetPhotos);
  const store = useProfileStore();

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  const fetchMore = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      const res = await api.get(
        `/u/photo/getInfinitePhotos?skip=${page * 20}&take=20`
      );

      const newBatch = res.data;
      if (newBatch.length === 0) {
        setHasMore(false);
        return;
      }

      addPhotos(newBatch);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("fetch error", error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, addPhotos]);

  // Initial reset - ONLY on mount
  useEffect(() => {
    resetPhotos();
    setPage(0);
    setHasMore(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const currentLoader = loaderRef.current;
    if (!currentLoader) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loading) {
          fetchMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      }
    );

    observer.observe(currentLoader);
    return () => observer.disconnect();
  }, [fetchMore, hasMore, loading]);

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  return (
    <div className="px-8 pb-24">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex w-auto -ml-4"
        columnClassName="pl-4 bg-clip-padding"
      >
        {photos.map((photo, index) => (
          <div
            key={`${photo.id}-${index}`}
            className="mb-4 relative rounded-xl overflow-hidden cursor-pointer group border border-white/5 opacity-0 animate-fade-in-up"
            style={{ animationDelay: `${(index % 12) * 60}ms` }}
            onClick={() => {
              store.setSelectedImage(photo);
              store.setImageDetailModalStatus(true);
            }}
          >
            <Image
              src={photo.thumbnailUrl}
              alt={photo.title}
              width={500}
              height={500}
              unoptimized
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <div className="text-white">
                <p className="font-family-helvetica font-medium text-sm">{photo.title || "Untitled"}</p>
                <p className="text-white/60 text-[10px] uppercase tracking-widest mt-1">{photo.uploaderName || "Photographer"}</p>
              </div>
            </div>
          </div>
        ))}
      </Masonry>

      {hasMore ? (
        <div ref={loaderRef} className="py-6 text-center text-gray-400">
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Discovering more...</span>
            </div>
          ) : "Scroll for more"}
        </div>
      ) : (
        <div className="py-6 text-center text-gray-500">
          {"🎉 You've seen the whole orbit."}
        </div>
      )}

      {/* Global Image Detail Modal */}
      {store.imageDetailModalStatus && <ImageDetails />}
    </div>
  );
}
