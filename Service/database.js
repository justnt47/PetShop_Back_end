import pkg from 'pg';
import dotenv from 'dotenv';

const {Pool} = pkg;
dotenv.config();


const DBSERVER = process.env.DBSERVER;
const DBUSER = process.env.DBUSER;
const DBPWD = process.env.DBPWD;
const DBHOST = process.env.DBHOST;
const DBPORT = process.env.DBPORT;
const DB = process.env.DB;


const db =  new Pool({
    connectionString : `${DBSERVER}://${DBUSER}:${encodeURIComponent(DBPWD)}@${DBHOST}:${DBPORT}/${DB}`
});


export default db;