import dotenv from 'dotenv'
dotenv.config({quiet: true})

export const exit = process.exit;
export const global = (key) => process.env[key];
export const local = (key) => process.env[key];
export const flash = console.log;