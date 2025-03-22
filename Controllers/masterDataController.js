import { query } from "express";
import db from "../Service/database.js";

export async function getProductType(req, res) {
    console.log("getProductType Requested");
     try {
        const sqlQuery = 'SELECT * FROM public."product_types"';
        const result = await db.query(sqlQuery);
        // console.log(result.rows);
        return res.json(result.rows);
     } catch (error) {
        console.log(error);
        return res.json({
            error: error.message
     })
 }};