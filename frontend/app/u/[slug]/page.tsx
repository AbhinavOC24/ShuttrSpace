"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useErrorStore } from "@/store/useErrorStore";
import { pinata } from "@/utils/pinataConfig";
import Image from "next/image";
import { generateThumbnail } from "@/utils/generateThumbnails";
import { calculateAge } from "@/utils/dateUtils";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import idl from "../../../idl/portfolio_registry.json";
import type { Idl } from "@coral-xyz/anchor";
import {
  UserProfile,
  PhotoFromDB,
  PhotosFromUploadQueue,
} from "./_types/profile";
import { useProfileStore } from "@/store/useProfileStore";

function ProfilePage() {
  const PROGRAM_ID = "B5FqrhXbhsZtcF3u39zvcUkgTV5NWBSy63xjuMNnDsxv";
  const { slug } = useParams();
  const setGlobalError = useErrorStore((state) => state.setGlobalError);
  const { publicKey, signMessage, sendTransaction } = useWallet();
  const anchorWallet = useAnchorWallet();

  // const [uploadImageModalStatus, setuploadImageModalStatus] = useState(false);

  const store = useProfileStore();
  const connection = useMemo(
    () => new Connection("https://api.devnet.solana.com"),
    []
  );

  const program = useMemo(() => {
    if (!anchorWallet) return null;

    try {
      const provider = new anchor.AnchorProvider(connection, anchorWallet, {
        preflightCommitment: "processed",
      });
      anchor.setProvider(provider);

      const programId = new PublicKey(PROGRAM_ID);
      return new anchor.Program(idl as Idl, provider);
    } catch (error) {
      console.error("Failed to initialize Anchor program:", error);
      return null;
    }
  }, [connection, anchorWallet]);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/u/auth/getProfile`,
          { slug },
          { withCredentials: true }
        );
        if (
          res.data.authenticated &&
          res.data.sessionSlug === res.data.profile.slug
        ) {
          store.setCanEdit(true);
        }
        if (res.data.profile) {
          store.setUserProfile(res.data.profile);
          const photoRes = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/u/photo/getPhotos/${slug}`
          );

          store.setGallery(photoRes.data.photos);
        }
      } catch (err: any) {
        setGlobalError(
          err?.response?.data?.error ||
            err?.message ||
            "Failed to fetch profile"
        );
      }
    };
    getProfile();
  }, [slug, setGlobalError]);

  const uploadFiles = async () => {
    store.setUploading(true);
    if (store.uploading) {
      console.log("Upload already in progress, skipping...");
      return;
    }
    try {
      const uploadedPhotos = await Promise.all(
        store.uploadQueue.map(async (photo) => {
          const fullUrlRequest = await fetch("/api/url");
          const fullUrlResponse = await fullUrlRequest.json();
          const fullUpload = await pinata.upload.public
            .file(photo.file)
            .url(fullUrlResponse.url);
          const fileUrl = `https://gateway.pinata.cloud/ipfs/${fullUpload.cid}`;

          const thumbnail = await generateThumbnail(photo.file);
          const thumbUrlRequest = await fetch("/api/url");
          const thumbUrlResponse = await thumbUrlRequest.json();
          const thumbUpload = await pinata.upload.public
            .file(thumbnail)
            .url(thumbUrlResponse.url);
          const thumbnailUrl = `https://gateway.pinata.cloud/ipfs/${thumbUpload.cid}`;

          return { ...photo, imageUrl: fileUrl, thumbnailUrl };
        })
      );

      // Handle blockchain signing and metadata upload
      let batchInfo = {};

      if (signMessage && publicKey && program) {
        const unsignedMetadata = {
          author: {
            publicKey: publicKey.toBase58(),
            slug,
          },
          createdAt: new Date().toISOString(),
          items: uploadedPhotos.map((p) => ({
            title: p.title,
            tags: p.tags,
            imageUrl: p.imageUrl,
            thumbnailUrl: p.thumbnailUrl,
          })),
        };

        const encoded = new TextEncoder().encode(
          JSON.stringify(unsignedMetadata)
        );
        const signature = await signMessage(encoded);

        const signedMetadata = {
          ...unsignedMetadata,
          signature: bs58.encode(signature),
        };

        const metaBlob = new Blob([JSON.stringify(signedMetadata)], {
          type: "application/json",
        });
        const metaFile = new File([metaBlob], "metadata.json");

        const signedMetaDataRequest = await fetch("/api/url");
        const signedMetaDataResponse = await signedMetaDataRequest.json();

        const metaUpload = await pinata.upload.public
          .file(metaFile)
          .url(signedMetaDataResponse.url);

        const metadataCid = metaUpload.cid;

        console.log("Metadata CID:", metadataCid);

        if (!anchorWallet) {
          console.log("Cant find anchorWallet");
          return;
        }
        batchInfo = {
          items: uploadedPhotos.map((p) => ({
            title: p.title,
            tags: p.tags,
            imageUrl: p.imageUrl,
            thumbnailUrl: p.thumbnailUrl,
          })),
          metadataCid,
          signature: bs58.encode(signature),
        };
        const [portfolioPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("portfolio"), anchorWallet.publicKey.toBuffer()],
          program.programId
        );

        const accountInfo = await connection.getAccountInfo(portfolioPDA);

        const portfolioExists = !!accountInfo;
        try {
          if (!portfolioExists) {
            console.log("Upload triggered: create portfolio + add item");

            const initIx = await program.methods
              .initializePortfolio()
              .accounts({
                portfolio: portfolioPDA,
                owner: anchorWallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
              })
              .instruction();

            const addIx = await program.methods
              .addPortfolioItem(metadataCid)
              .accounts({
                portfolio: portfolioPDA,
                owner: anchorWallet.publicKey,
              })
              .instruction();
            console.log("Upload triggered");

            const { blockhash, lastValidBlockHeight } =
              await connection.getLatestBlockhash("confirmed");

            const transaction = new Transaction({
              feePayer: anchorWallet.publicKey,
              blockhash,
              lastValidBlockHeight,
            }).add(initIx, addIx);

            const signature = await sendTransaction(transaction, connection, {
              skipPreflight: false,
              preflightCommitment: "confirmed",
            });

            const confirmation = await connection.confirmTransaction(
              {
                signature,
                blockhash,
                lastValidBlockHeight,
              },
              "confirmed"
            );
            if (confirmation.value.err) {
              throw new Error(`Transaction failed: ${confirmation.value.err}`);
            }

            console.log("Portfolio created and item added:", signature);
            // const transaction = new Transaction().add(initIx, addIx);
            // await sendTransaction(transaction, connection);
          } else {
            const addIx = await program.methods
              .addPortfolioItem(metadataCid)
              .accounts({
                portfolio: portfolioPDA,
                owner: anchorWallet.publicKey,
              })
              .instruction();

            const { blockhash, lastValidBlockHeight } =
              await connection.getLatestBlockhash("confirmed");
            const transaction = new Transaction({
              feePayer: anchorWallet.publicKey,
              blockhash,
              lastValidBlockHeight,
            }).add(addIx);
            const sig = await sendTransaction(transaction, connection, {
              skipPreflight: false,
              preflightCommitment: "confirmed",
            });

            console.log("Portfolio item added:");
          }
        } catch (error) {
          console.log(error);
        }
      }
      // Save to database
      console.log(batchInfo);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/u/photo/uploadPhotos`,
        {
          batchInfo,
        },
        { withCredentials: true }
      );
      console.log(response.data);
      store.addToGallery(response.data.photos);
    } catch (error) {
      console.error("Upload error:", error);
      setGlobalError("Failed to upload photos. Please try again.");
    } finally {
      store.setuploadImageModalStatus(false);
      store.setUploading(false);
      store.setUploadQueue([]);
      store.setCurrentIndex(0);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newQueue = selectedFiles.map((file) => ({
      file,
      title: "",
      tags: [],
    }));
    store.setUploadQueue(newQueue);
    store.setCurrentIndex(0);
  };

  const nextPhoto = () => {
    if (store.currentIndex < store.uploadQueue.length - 1) {
      store.setCurrentIndex(store.currentIndex + 1);
    } else {
      uploadFiles();
    }
  };

  const prevPhoto = () => {
    if (store.currentIndex > 0) store.setCurrentIndex(store.currentIndex - 1);
  };

  if (!store.userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-[90px] pt-[60px] bg-black text-white">
      <div className="bg-black rounded-lg shadow-lg w-full h-[1000px] flex flex-col gap-[60px]">
        <div className="flex gap-[32px]">
          <div className="relative w-[250px] h-[252px] rounded-[20px] overflow-hidden">
            <img
              src={store.userProfile.profilePic}
              alt={store.userProfile.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-[2px]">
            <div className="flex flex-col gap-[10px]">
              <div className="flex flex-col">
                <div className="flex gap-[10px] items-center">
                  <div className="font-family-helvetica text-[32px]">
                    {store.userProfile.name}
                  </div>
                  <div className="w-2 h-2 rounded-full bg-[#d9d9d9]" />
                  <div className="text-[28px] font-family-helvetica font-medium">
                    {calculateAge(store.userProfile.birthDate)}
                  </div>
                </div>
                <div className="font-family-helvetica text-[16px] font-medium -translate-y-1">
                  Uttarakhand,Ind
                </div>
              </div>

              <div className="antialiased text-white w-[571px] h-[107px] font-family-neue font-medium text-[18px] leading-5">
                Emerging concert photographer... {store.userProfile.bio}
              </div>
            </div>

            <div className="flex flex-col gap-[6px]">
              <div className="text-[16px] font-family-neue font-medium text-[#8A8A8A]">
                Sort By
              </div>
              <div className="flex  items-center gap-[12px]">
                <div
                  key="collections"
                  onClick={() => store.toggleTag("collections")}
                  className={`${
                    store.selectedTags.includes("collections")
                      ? "bg-white text-black border-[0.5px] border-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.8)]"
                      : "border-[#4d4d4d] text-white border-[0.5px] shadow-[inset_2px_2px_4px_rgba(255,255,255,0.3)]"
                  } cursor-pointer gap-[6px] h-[30px] px-[12px] py-[2px] flex items-center rounded-[10px]`}
                >
                  <div
                    className={`w-[5px] h-[5px] rounded-full ${
                      store.selectedTags.includes("collections")
                        ? "bg-black"
                        : "bg-white"
                    }`}
                  ></div>
                  <span className="font-family-neue font-medium text-[14px]">
                    Collections
                  </span>
                </div>
                <div className="w-px h-[30px] bg-gray-400"></div>
                <div className="flex flex-wrap gap-[4px]">
                  {store.userProfile.tags.map((tag, idx) => {
                    const isSelected = store.selectedTags.includes(tag);
                    return (
                      <div
                        key={idx}
                        onClick={() => store.toggleTag(tag)}
                        className={`${
                          isSelected
                            ? "bg-white text-black border-[0.5px] border-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.8)]"
                            : "border-[#4d4d4d] text-white border-[0.5px] shadow-[inset_2px_2px_4px_rgba(255,255,255,0.3)]"
                        } cursor-pointer gap-[8px] px-[14px] py-[2px] flex items-center rounded-[10px]`}
                      >
                        <div
                          className={`w-[5px] h-[5px] rounded-full ${
                            isSelected ? "bg-black" : "bg-white"
                          }`}
                        ></div>
                        <span className="font-family-neue font-medium text-[14px]">
                          {tag}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-full w-full p-[32px] bg-[rgba(255,255,255,0.05)] rounded-[10px] border-[0.5px] border-[#999999]">
          {store.gallery.map((photo, index) => (
            <Image
              key={index}
              src={photo.thumbnailUrl || ""}
              alt={photo.title || `Uploaded ${index}`}
              width={100}
              height={100}
            />
          ))}
          {store.canEdit && (
            <button
              onClick={() => store.setuploadImageModalStatus(true)}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Upload Photos
            </button>
          )}
        </div>
      </div>

      {store.uploadImageModalStatus && store.canEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-auto mx-4">
            <h2 className="text-xl font-bold mb-4 text-black">Upload Image</h2>
            <input
              type="file"
              onChange={handleChange}
              multiple
              accept="image/*"
              className="mb-4 w-full text-black"
            />
            {store.uploadQueue[store.currentIndex] && (
              <div className="flex gap-4">
                <Image
                  src={URL.createObjectURL(
                    store.uploadQueue[store.currentIndex].file
                  )}
                  alt="Preview"
                  width={500}
                  height={500}
                  className="border rounded"
                />
                <div className="flex flex-col gap-4 text-black">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="title">Title</label>
                    <input
                      type="text"
                      id="title"
                      value={store.uploadQueue[store.currentIndex].title}
                      onChange={(e) => {
                        const updated = [...store.uploadQueue];
                        updated[store.currentIndex].title = e.target.value;
                        store.setUploadQueue(updated);
                      }}
                      className="border border-black p-2 rounded"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="tags">Tags</label>
                    <input
                      type="text"
                      id="tags"
                      value={store.uploadQueue[store.currentIndex].tags.join(
                        ", "
                      )}
                      onChange={(e) => {
                        const updated = [...store.uploadQueue];
                        updated[store.currentIndex].tags = e.target.value
                          .split(",")
                          .map((t) => t.trim());
                        store.setUploadQueue(updated);
                      }}
                      className="border border-black p-2 rounded"
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => store.setuploadImageModalStatus(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={prevPhoto}
                disabled={store.currentIndex === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Prev
              </button>
              {store.currentIndex !== store.uploadQueue.length - 1 ? (
                <button
                  onClick={nextPhoto}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={uploadFiles}
                  disabled={store.uploading || store.uploadQueue.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {store.uploading ? "Uploading..." : "Upload"}
                </button>
              )}
            </div>
            {store.uploadQueue.length > 1 && (
              <div className="mt-2 text-sm text-gray-600">
                Image {store.currentIndex + 1} of {store.uploadQueue.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
