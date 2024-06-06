import { Request, Response } from "express";
import {
  Contact,
  IdentifyContactParams,
  IdentifyContactResponse,
} from "../lib/types/contact";
import db from "../config/db";

const findContacts = async (
  email: string | null,
  phoneNumber: string | null
): Promise<Contact[]> => {
  const query = `SELECT * from Contact WHERE email = ? OR phoneNumber = ? `;
  const [results] = await db.query(query, [email, phoneNumber]);
  return results as Contact[];
};

// const createContact = async (
//   email: string | null,
//   phoneNumber: string | null
// ): Promise<Contact[]> => {
//   const query = `I * from Contact WHERE email = ? OR phoneNumber = ? `;
//   const [results] = await db.query(query, [email, phoneNumber]);
//   return results as Contact[];
// };

export const identifyContactService = async (
  params: IdentifyContactParams
)=> {
  return findContacts(params.email, params.phoneNumber).then(results => {
    console.log("🚀 ~ returnfindContacts ~ results:", results)
    if(results && results.length){
      
    } else {
      return 
    }
  });
};
