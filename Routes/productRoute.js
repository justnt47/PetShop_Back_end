import express from 'express';

//NOTE: "../" is mean go back to the parent folder
import * as pd from '../Controllers/productController.js';


const router = express.Router();


router.post('/addProducts', pd.addProduct);
export default router;
