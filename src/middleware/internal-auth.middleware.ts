import { Request, Response, NextFunction } from "express";
import { timingSafeEqual } from "crypto";
import { config } from "../config";

export function internalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const apiKey = req.headers["x-internal-api-key"];

  if (typeof apiKey !== "string") {
    res.status(401).json({ message: "Missing internal API key header" });
    return;
  }

  try {
    const isValid = timingSafeEqual(
      Buffer.from(apiKey, "utf8"),
      Buffer.from(config.internalApiKey, "utf8")
    );

    if (!isValid) {
      res.status(401).json({ message: "Invalid internal API key value" });
      return;
    }
  } catch (error) {
    res.status(401).json({ message: "Internal API key format error" });
    return;
  }

  next();
}
