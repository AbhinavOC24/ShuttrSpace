import { Request, Response } from "express";
import nacl from "tweetnacl";
import bs58 from "bs58";

export const getNonce = (req: Request, res: Response) => {
  try {
    const { publicKey } = req.body;
    if (!publicKey) return res.status(400).json({ error: "Missing address" });

    const nonce = `Sign this message to login: ${Math.floor(
      Math.random() * 1000000
    )}`;

    req.session.nonce = nonce;
    req.session.publicKey = publicKey;
    req.session.authenticated = false;

    console.log(req.session.nonce);
    console.log(req.session.publicKey);

    res.json({ nonce });
  } catch (e) {
    res.json({ message: "Error from getNonce" });
  }
};

export const verifySign = (req: Request, res: Response) => {
  try {
    const { publicKey, signature } = req.body;
    console.log(publicKey, signature);
    if (publicKey != req.session.publicKey) {
      res.status(401).json({
        message: "The public key used to sign and connect doesnt match",
      });
      return;
    }

    const isValid = nacl.sign.detached.verify(
      new TextEncoder().encode(req.session.nonce),
      bs58.decode(signature),
      bs58.decode(publicKey)
    );
    if (!isValid) {
      res
        .status(401)
        .json({ error: "Invalid signature", authenticated: false });
    } else {
      res.status(200).json({ message: "Authenticated", authenticated: true });
    }
  } catch (error) {
    console.log("Error from verify User", error);
  }
};

export const verifyAuth = (req: Request, res: Response) => {
  res.status(201).json({ message: "Authenticated", authenticated: true });
  return;
};
