import { useProfileStore } from "@/store/useProfileStore";
import { generateThumbnail } from "@/utils/generateThumbnails";
import { pinata } from "@/utils/pinataConfig";
import { useWeb3Connection } from "@/hooks/useWeb3Connection";
import bs58 from "bs58";
import * as anchor from "@coral-xyz/anchor";
import axios from "axios";
import { useErrorStore } from "@/store/useErrorStore";

export const useUploadFiles = () => {
  const store = useProfileStore();
  const setGlobalError = useErrorStore((state) => state.setGlobalError);
  const {
    connection,
    program,
    anchorWallet,
    sendTransaction,
    signMessage,
    publicKey,
    PublicKey,
    Transaction,
  } = useWeb3Connection();

  const uploadFiles = async (slug: string) => {
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

      // Blockchain signing and metadata
      let batchInfo = {};

      if (signMessage && publicKey && program) {
        const unsignedMetadata = {
          author: { publicKey: publicKey.toBase58(), slug },
          createdAt: new Date().toISOString(),
          items: uploadedPhotos.map((p) => ({
            title: p.title,
            tags: p.tags,
            imageUrl: p.imageUrl,
            thumbnailUrl: p.thumbnailUrl,
            location: p.location,
            cameraDetails: p.cameraDetails,
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
            location: p.location || "",
            cameraDetails: p.cameraDetails || {
              cameraname: "",
              lens: "",
              aperture: "",
              iso: "",
              shutterspeed: "",
            },
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

        if (!portfolioExists) {
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

          const { blockhash, lastValidBlockHeight } =
            await connection.getLatestBlockhash("confirmed");
          const transaction = new Transaction({
            feePayer: anchorWallet.publicKey,
            blockhash,
            lastValidBlockHeight,
          }).add(initIx, addIx);

          const sig = await sendTransaction(transaction, connection, {
            skipPreflight: false,
            preflightCommitment: "confirmed",
          });
          console.log("Portfolio created and item added:", sig);
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
          await sendTransaction(transaction, connection, {
            skipPreflight: false,
            preflightCommitment: "confirmed",
          });
          console.log("Portfolio item added");
        }
      }

      // Save to database
      const response = await axios.post(
        `/api/u/photo/uploadPhotos`,
        { batchInfo },
        { withCredentials: true }
      );
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

  return { uploadFiles };
};
