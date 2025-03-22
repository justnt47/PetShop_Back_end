import express from 'express';

//NOTE: "../" is mean go back to the parent folder
import * as pd from '../Controllers/productController.js';


const router = express.Router();


router.post('/getProducts', pd.getProduct);
router.post('/addProducts', pd.addProduct);
router.post('/updateProducts', pd.updateProduct);
router.post('/delProducts', pd.delProduct);
export default router;
