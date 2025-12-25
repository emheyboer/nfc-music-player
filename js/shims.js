import dotenv from 'dotenv'
dotenv.config({quiet: true})

export { DOMParser } from '@xmldom/xmldom';
export const exit = process.exit;
export const global = (key) => process.env[key];
export const setGlobal = (key, value) => {process.env[key] = value};
export const local = (key) => process.env[key];
export const flash = console.log;