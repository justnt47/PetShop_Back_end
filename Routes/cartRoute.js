import express from "express";
import * as cart from "../Controllers/cartController.js";

const router = express.Router();

router.post("/carts/chkcart", cart.checkCart);

router.post("/carts/addcart", cart.addCart);

router.post("/carts/addcartdtl", cart.addCartDtl);

router.post("/carts/getcartbycus", cart.getCartByCus);

router.post("/carts/getcarthistorybycus", cart.getCartHistoryByCus);

router.post("/carts/updateCartItemQty", cart.updateCartItemQty);

router.post("/carts/delCartItem", cart.delCartItem);

router.post("/carts/delCart", cart.delCart);

router.post("/carts/confirmCart", cart.confirmCart);

export default router;
