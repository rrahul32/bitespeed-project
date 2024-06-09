import { Request, Response } from "express";
import {
  Contact,
  IdentifyContactParams,
  IdentifyContactResponse,
} from "../lib/types/contact";
import db from "../config/db";
import { ResultSetHeader } from "mysql2";
import { LinkPrecedenceEnum } from "../lib/enums/contact";

const findContact = async (
  email: string | null,
  phoneNumber: string | null
): Promise<Contact | undefined> => {
  const query = `SELECT * from Contact WHERE email = ? AND phoneNumber = ? `;
  const [results] = await db.query(query, [email, phoneNumber]);
  return (results as Contact[])[0];
};

const searchContacts = async (
  email: string | null,
  phoneNumber: string | null
): Promise<Contact[]> => {
  //query with only non nullable values in WHERE clause
  const query = `SELECT * from Contact WHERE (email = ? AND email IS NOT NULL) OR (phoneNumber = ? AND phoneNumber IS NOT NULL)ORDER BY createdAt ASC`;

  const [results] = await db.query(query, [email, phoneNumber]);
  return results as Contact[];
};

const getContact = async (id: number): Promise<Contact> => {
  const query = `SELECT * from Contact WHERE id = ?`;
  const [results] = await db.query(query, [id]);
  return (results as Contact[])[0];
};

const getContacts = async (ids: number[]): Promise<Contact[]> => {
  const idsInput = ids.map(() => "?").join(",");
  const query = `SELECT * from Contact WHERE id IN (${idsInput}) ORDER BY createdAt ASC`;
  const [results] = await db.query(query, [...ids]);
  return results as Contact[];
};

const updateToSecondaryContacts = async (
  ids: number[],
  linkedId: number
): Promise<number> => {
  const idsInput = ids.map(() => "?").join(",");
  const query = `UPDATE Contact SET linkedId = ?, linkPrecedence = ? WHERE id IN (${idsInput}) OR linkedId IN (${idsInput})`;
  const [result] = await db.query(query, [
    linkedId,
    LinkPrecedenceEnum.secondary,
    ...ids,
    ...ids,
  ]);
  return (result as ResultSetHeader).affectedRows;
};

const getPrimaryContact = async (
  email: string | null,
  phoneNumber: string | null
): Promise<Contact | null> => {
  //find all conatcts with given params
  const contacts = await searchContacts(email, phoneNumber);
  if (!(contacts && contacts.length)) {
    return null;
  }

  //if contacts found in list have linked ids not in list fetch their details and add to list
  const linkedIds = new Set<number>();
  contacts.forEach((contact) => {
    if (
      contact.linkedId &&
      !contacts.some((item) => item.id === contact.linkedId)
    ) {
      linkedIds.add(contact.linkedId);
    }
  });
  if (linkedIds.size) {
    await getContacts(Array.from(linkedIds.values())).then((res) =>
      contacts.push(...res)
    );

    //sort contacts based on createdAt time
    contacts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  //take the first contact as primary and then update the rest to secondary
  const [primaryContact, ...secondaryContacts] = contacts;
  const updateIds: number[] = [];
  secondaryContacts.forEach((contact) => {
    if (contact.linkedId !== primaryContact.id) {
      updateIds.push(contact.id);
    }
  });
  if (updateIds && updateIds.length) {
    await updateToSecondaryContacts(updateIds, primaryContact.id);
  }
  return primaryContact;
};

const getSecondaryContacts = async (linkedId: number): Promise<Contact[]> => {
  const query = `SELECT * from Contact WHERE linkedId = ?`;
  const [results] = await db.query(query, [linkedId]);
  return results as Contact[];
};

const createContact = async (
  email: string | null,
  phoneNumber: string | null,
  linkedId: number | null
): Promise<Contact> => {
  const query = `INSERT INTO Contact (email, phoneNumber, linkedId, linkPrecedence) VALUES (?, ?, ?, ?) `;
  const [result] = await db.query(query, [
    email,
    phoneNumber,
    linkedId,
    linkedId ? LinkPrecedenceEnum.secondary : LinkPrecedenceEnum.primary,
  ]);

  return getContact((result as ResultSetHeader).insertId) as Promise<Contact>;
};

export const identifyContactService = async (
  params: IdentifyContactParams
): Promise<IdentifyContactResponse> => {
  return findContact(params.email, params.phoneNumber).then(async (contact) => {
    const emails: Set<string> = new Set();
    const phoneNumbers: Set<string> = new Set();
    const secondaryContactIds: number[] = [];
    let primaryContactId: number;

    if (contact) {
      // Get primary and secondary contacts
      const primaryContact = contact.linkedId
        ? ((await getContact(contact.linkedId)) as Contact)
        : contact;

      primaryContactId = primaryContact.id;
      const secondaryContacts = await getSecondaryContacts(primaryContactId);
      secondaryContactIds.push(
        ...secondaryContacts.map((contact) => contact.id)
      );

      // Push primary contact details to response
      if (primaryContact.email) {
        emails.add(primaryContact.email);
      }
      if (primaryContact.phoneNumber) {
        phoneNumbers.add(primaryContact.phoneNumber);
      }

      // Push secondary contacts' details to response
      secondaryContacts.forEach((contact) => {
        if (contact.email) {
          emails.add(contact.email);
        }
        if (contact.phoneNumber) {
          phoneNumbers.add(contact.phoneNumber);
        }
      });
    } else {
      let primaryContact = await getPrimaryContact(
        params.email,
        params.phoneNumber
      );

      let secondaryContacts: Contact[];

      if (primaryContact) {
        //if primary contact is available then create contact with linkedId
        primaryContactId = primaryContact.id;
        await createContact(
          params.email,
          params.phoneNumber,
          primaryContact.id
        );

        //find secondary contacts and push details to result
        secondaryContacts = await getSecondaryContacts(primaryContact.id);
        secondaryContactIds.push(...secondaryContacts.map((item) => item.id));
        if (primaryContact.email) {
          emails.add(primaryContact.email);
        }
        secondaryContacts.forEach(
          (contact) => contact.email && emails.add(contact.email)
        );
        if (primaryContact.phoneNumber) {
          phoneNumbers.add(primaryContact.phoneNumber);
        }
        secondaryContacts.forEach(
          (contact) =>
            contact.phoneNumber && phoneNumbers.add(contact.phoneNumber)
        );
      } else {
        //if primary contact isn't available create new contact with linkedId null
        const contact = await createContact(
          params.email,
          params.phoneNumber,
          null
        );
        primaryContactId = contact.id;

        if (contact.email) {
          emails.add(contact.email);
        }
        if (contact.phoneNumber) {
          phoneNumbers.add(contact.phoneNumber);
        }
      }
    }

    return {
      primaryContactId,
      emails: Array.from(emails.values()),
      phoneNumbers: Array.from(phoneNumbers.values()),
      secondaryContactIds,
    };
  });
};
