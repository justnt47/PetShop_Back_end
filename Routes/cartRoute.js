import express from "express";
import * as cart from "../Controllers/cartController.js";

const router = express.Router();

router.post("/carts/chkcart", cart.checkCart);

router.post("/carts/addcart", cart.addCart);

router.post("/carts/addcartdtl", cart.addCartDtl);

router.post("/carts/getcartbycus", cart.getCartByCus);

router.post("/carts/getcarthistorybycus", cart.getCartHistoryByCus);

export default router;
