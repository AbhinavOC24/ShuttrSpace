// types/express-session.d.ts
import "express-session";

declare module "express-session" {
  interface SessionData {
    nonce?: string;
    publicKey?: string;
    authenticated?: boolean;
    hasProfile?: boolean;
  }
}
