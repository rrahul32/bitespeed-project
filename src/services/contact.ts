import { Request, Response } from "express";
import {
  Contact,
  IdentifyContactParams,
  IdentifyContactResponse,
} from "../lib/types/contact";
import db from "../config/db";
import { ResultSetHeader } from "mysql2";

const findContact = async (
  email: string | null,
  phoneNumber: string | null
): Promise<Contact> => {
  const query = `SELECT * from Contact WHERE email = ? AND phoneNumber = ? `;
  const [results] = await db.query(query, [email, phoneNumber]);
  return (results as Contact[])[0];
};

const getContact = async (id: number): Promise<Contact> => {
  const query = `SELECT * from Contact WHERE id = ?`;
  const [results] = await db.query(query, [id]);
  console.log("🚀 ~ getContact ~ results:", results);
  return (results as Contact[])[0];
};

const createContact = async (
  email: string | null,
  phoneNumber: string | null
): Promise<Contact> => {
  const query = `INSERT INTO Contact (email, phoneNumber) VALUES (?, ?) `;
  const [results] = await db.query(query, [email, phoneNumber]);
  console.log("🚀 ~ results:", results);
  return getContact((results as ResultSetHeader).insertId);
};

export const identifyContactService = async (params: IdentifyContactParams) => {
  return findContact(params.email, params.phoneNumber).then((contact) => {});
};
