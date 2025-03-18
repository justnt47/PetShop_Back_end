import express from 'express';

//NOTE: "../" is mean go back to the parent folder
import * as md from '../Controllers/masterDataController.js';


const router = express.Router();

router.get('/masterData/productType', md.getProductType);

export default router