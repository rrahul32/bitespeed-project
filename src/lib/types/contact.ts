import { LinkPrecedenceEnum } from "../enums/contact";

export type Contact = {
  id: number;
  phoneNumber: string | null;
  email: string | null;
  linkedId: string | null;
  linkPrecedence: LinkPrecedenceEnum;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type IdentifyContactParams = {
  phoneNumber: string | null;
  email: string | null;
};

export type IdentifyContactResponse = {
  primaryContactId: number;
  emails: string[];
  phoneNumbers: string[];
  secondaryContactIds: number[];
};
