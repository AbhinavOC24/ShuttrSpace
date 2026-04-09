import ImageKit from "imagekit";
import dotenv from "dotenv";

dotenv.config();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLICKEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATEKEY || "",
  urlEndpoint: process.env.IMAGEKIT_URLENDPOINT || "",
});

export default imagekit;
