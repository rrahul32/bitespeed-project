import { Request, Response } from "express";
import { IdentifyContactParams } from "../lib/types/contact";
import { identifyContactService } from "../services/contact";

export const identifyContact = (req: Request, res: Response) => {
  const params: IdentifyContactParams = req.body;
  if (!(params.email || params.phoneNumber)) {
    res.status(422);
  } else {
    identifyContactService(params);
  }
};
