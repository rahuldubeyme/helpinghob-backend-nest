import * as crypto from "crypto";
import * as bcrypt from "bcrypt";

export const capitalizeFirstLetter = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') 
    .replace(/^-+|-+$/g, '');

export const randomString = (length: number = 30): string => {
  let result: string = "";
  while (result.length < length) {
    result += crypto
      .randomBytes(length)
      .toString("hex")
      .substring(2, length + 2);
  }
  return result;
};


export const hashPassword = async (password: string) => {
  const hash = await bcrypt.hash(password, 10);
  return hash;
};

export const comparePassword = async (
  enteredPassword: string,
  dbPassword: string
) => {
  const match = await bcrypt.compare(enteredPassword, dbPassword);
  return match;
};
