import { Request, Response, NextFunction } from "express";

export const debugSession = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("=== SESSION DEBUG ===");
  console.log("Session ID:", req.sessionID);
  console.log("Session data:", req.session);
  console.log("Session authenticated:", req.session?.authenticated);
  console.log("Cookies:", req.headers.cookie);
  console.log("===================");
  next();
};
export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.session?.authenticated) {
    return next();
  }

  res.status(401).json({
    message: "Not authenticated from checkAuth",
    authenticated: false,
  });
};
