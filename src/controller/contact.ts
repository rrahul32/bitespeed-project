import { Request, Response } from "express";
import { IdentifyContactParams } from "../lib/types/contact";
import { identifyContactService } from "../services/contact";

export const identifyContact = async (req: Request, res: Response) => {
  const params: IdentifyContactParams = req.body;
  if (
    !(params.email && params.phoneNumber) ||
    (params.email && typeof params.email !== "string") ||
    (params.phoneNumber && typeof params.phoneNumber !== "string")
  ) {
    res.status(422);
  } else {
    try {
      const result = await identifyContactService({
        email: params.email ?? null,
        phoneNumber: params.phoneNumber ?? null,
      });
      res.status(200).json({
        contact: result,
      });
    } catch (e) {
      res.status(500);
    }
  }
};
