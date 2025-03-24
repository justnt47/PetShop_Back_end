import db from "../Service/database.js";
import jwt from "jsonwebtoken";

export async function checkCart(req, res) {
  console.log(`POST CART customer  is requested`);
  // ก่อนจะ Excuese Query ทำการ Validate Data ก่อน
  const authHeader = req.headers["authorization"];
  const token = authHeader.split(" ")[1];
  console.log(token);
  if (!token) {
    return res.status(401).json({
      error: "Unauthorized - No token provided",
    });
  }
  const secret_key = process.env.SECRET_KEY;
  console.log(secret_key);
  let decoded;
  try {
    console.log(`decoded`);
    decoded = jwt.verify(token, secret_key);
    console.log(decoded);
  } catch (err) {
    return res.status(401).json({
      error: "Unauthorized - Invalid token",
    });
  }

  const result = await db.query({
    text: `SELECT * FROM carts WHERE "userId" = $1 AND "is_succ" != true `,
    values: [decoded.userId],
  });
  if (result.rows[0] != null) {
    return res.json({
      status: 200,
      cartExist: true,
      cartId: result.rows[0].cart_id,
    });
  } else {
    return res.json({ cartExist: false });
  }
}

export async function addCart(req, res) {
  console.log(`POST /CART is requested `);
  // const bodyData=req.body
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader.split(" ")[1];
    console.log(token);
    if (!token) {
      return res.status(401).json({
        error: "Unauthorized - No token provided",
      });
    }
    const secret_key = process.env.SECRET_KEY;
    console.log(secret_key);
    let decoded;
    try {
      console.log(`decoded`);
      decoded = jwt.verify(token, secret_key);
      console.log(decoded);
    } catch (err) {
      return res.status(401).json({
        error: "Unauthorized - Invalid token",
      });
    }
    // Gen ID
    // จัดรูปแบบวันที่ YYYYMMDD
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // เดือนเริ่มจาก 0 ดังนั้นต้องบวก 1
    const day = String(now.getDate()).padStart(2, "0");
    const currentDate = `${year}${month}${day}`;
    const queryGenId = `SELECT CONCAT(TO_CHAR(NOW(), 'YYYYMMDD'), '-', LPAD(COALESCE(MAX(SUBSTRING(cart_id, 10)), '1')::text, 4, '0'))
                          FROM carts 
                          WHERE cart_id LIKE CONCAT(TO_CHAR(NOW(), 'YYYYMMDD'), '-%')`;
    const resultGen = await db.query(queryGenId);
    console.log(`resultGen=${resultGen.rows[0].concat}`);

    if (req.body.cart_id == null) {
    }
    // ได้ id แล้ว ทำการบันทึกข้อมูลลงตะกร้า
    const result = await db.query(
      `INSERT INTO carts ("id","cart_id", "userId", "create_date") VALUES (nextval('cart_id_seq'),$1,$2,$3) `,
      [
        resultGen.rows[0].concat, //$1 รหัสที่ Gen มา
        decoded.userId, //$2 รหัสที่ส่งมาจาก Frontend
        now, //$3 วันปัจจุบัน
      ]
    );

    return res.json({ cartOK: true, cartId: resultGen.rows[0].concat });
  } catch (err) {
    return res.json({ cartOK: false, messageAddCart: err.message });
  }
}

export async function addCartDtl(req, res) {
  console.log(`POST /CARTDETAIL is requested `);
  try {
    // ก่อนจะ Excuese Query ทำการ Validate Data ก่อน
    if (req.body.cart_id == null || req.body.product_id == null) {
      return res.json({
        cartDtlOK: false,
        messageAddCartDtl: "CartId && ProductID  && Price  is required",
      });
    }
    // ดูว่ามี Product เดิมอยู่หรือไม่
    const pdResult = await db.query(
      `  SELECT * FROM "cart_items" ctd WHERE ctd."cart_id" = $1 AND ctd."product_id" = $2 `,
      [req.body.cart_id, req.body.product_id] //ค่า Parameter ที่ส่งมา
    );
    console.log(`pdResult.rowCount=${pdResult.rowCount}`);
    if (pdResult.rowCount == 0) {
      // ถ้าไม่มีให้ INSERT
      try {
        const result = await db.query(
          ` INSERT INTO "cart_items" ("item_id","cart_id", "product_id", "quantity")
                              VALUES (nextval('item_id_seq'),$1,$2,$3) `,
          [req.body.cart_id, req.body.product_id, 1]
        );
        return res.json({ cartDtlOK: true, messageAddCart: req.body.cart_id });
      } catch (err) {
        return res.json({
          cartDtlOK: false,
          messageAddCartDtl: "INSERT DETAIL ERROR",
        });
      }
    } else {
      // ถ้ามีแล้วให้ UPDATE
      try {
        const result = await db.query(
          ` UPDATE "cart_items" SET "quantity" = $1
                              WHERE "cart_id" = $2
                              AND "product_id" = $3 `,
          [pdResult.rows[0].quantity + 1, req.body.cart_id, req.body.product_id]
        );
        return res.json({ cartDtlOK: true, messageAddCart: req.body.cart_id });
      } catch (err) {
        return res.json({
          cartDtlOK: false,
          messageAddCartDtl: "INSERT DETAIL ERROR",
        });
      }
    }
  } catch (err) {
    return res.json({
      cartDtlOK: false,
      messageAddCartDtl: "INSERT DETAIL ERROR",
    });
  }
}

export async function getCart(req, res) {
  console.log(`GET Cart is Requested`);
  try {
    const result = await db.query(
      `  SELECT ct.*, SUM(ctd.qty) AS sqty,SUM(ctd.price*ctd.qty) AS sprice
                  FROM carts ct LEFT JOIN "cartDtl" ctd ON ct."cartId" = ctd."cartId"
                  WHERE ct."cartId"=$1
                  GROUP BY ct."cartId" `,
      [req.params.id]
    );
    console.log(`id=${req.params.id} \n` + result.rows[0]);
    return res.json(result.rows);
  } catch (err) {
    return res.json({
      error: err.message,
    });
  }
}


export async function getCartByCus(req, res) {
  console.log(`POST Cart By Customer is Requested`);
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized - No token provided",
      });
    }

    const secret_key = process.env.SECRET_KEY;
    console.log(secret_key);
    let decoded;
    try {
      console.log(`decoded`);
      decoded = jwt.verify(token, secret_key);
      console.log(decoded);
    } catch (err) {
      return res.status(401).json({
        error: "Unauthorized - Invalid token",
      });
    }

    const queryUserData = `SELECT "id", "memEmail" FROM members WHERE "id" = $1`;
    const resultUser = await db.query(queryUserData, [decoded.userId]);
    if (resultUser.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = resultUser.rows[0];

    // ดึงข้อมูลตะกร้าสินค้าที่ยังไม่สมบูรณ์
    const queryListCart = `SELECT ct."cart_id" 
                           FROM carts ct 
                           WHERE ct."userId" = $1 AND ct."is_succ" != true 
                           ORDER BY ct."id" DESC`;
    const resultCart = await db.query(queryListCart, [decoded.userId]);

    const cartList = {};

    // สำหรับแต่ละตะกร้า
    for (const cart of resultCart.rows) {
      const cartId = cart.cart_id;

      // ดึงข้อมูลสรุปตะกร้า
      const queryCartSum = `SELECT SUM(ctd."quantity") AS qty, 
                                   SUM(ctd."quantity" * pd."product_price") AS money
                            FROM "cart_items" ctd 
                            LEFT JOIN "products" pd ON ctd."product_id" = pd."product_id"
                            WHERE ctd."cart_id" = $1
                            GROUP BY ctd."cart_id"`;
      const resultCartSum = await db.query(queryCartSum, [cartId]);

      // ดึงข้อมูลสินค้าในตะกร้า
      const queryCartItems = `SELECT ctd."product_id", 
                                     pd."product_name", 
                                     ctd."quantity" AS qty, 
                                     pd."product_price" AS price, 
                                     (ctd."quantity" * pd."product_price") AS total
                              FROM "cart_items" ctd 
                              LEFT JOIN "products" pd ON ctd."product_id" = pd."product_id"
                              WHERE ctd."cart_id" = $1`;
      const resultCartItems = await db.query(queryCartItems, [cartId]);

      const productList = {};
      resultCartItems.rows.forEach((item) => {
        productList[item.product_id] = {
          product_id: item.product_id,
          product_name: item.product_name,
          qty: item.qty,
          price: item.price,
          Total: item.total,
        };
      });

      // ตรวจสอบว่ามีสินค้าในตะกร้าหรือไม่
      if (resultCartSum.rows.length > 0 && resultCartItems.rows.length > 0) {
        cartList[cartId] = {
          qty: resultCartSum.rows[0].qty,
          total: resultCartSum.rows[0].money,
          productList: productList,
        };
      } else {
        // หากตะกร้าว่างเปล่า
        cartList[cartId] = {
          qty: 0,
          total: 0,
          productList: {},
        };
      }
    }

    // ส่งผลลัพธ์กลับ
    return res.json({
      status: 200,
      data: {
        cartList: cartList,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getCartHistoryByCus(req, res) {
  console.log(`POST Cart By Customer is Requested`);
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized - No token provided",
      });
    }
    const secret_key = process.env.SECRET_KEY;
    console.log(secret_key);
    let decoded;
    try {
      console.log(`decoded`);
      decoded = jwt.verify(token, secret_key);
      console.log(decoded);
    } catch (err) {
      return res.status(401).json({
        error: "Unauthorized - Invalid token",
      });
    }

    const queryUserData = `SELECT "id", "memEmail" FROM members WHERE "id" = $1`;
    const resultUser = await db.query(queryUserData, [decoded.userId]);
    if (resultUser.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = resultUser.rows[0];

    // ดึงข้อมูลตะกร้าสินค้าที่ยังไม่สมบูรณ์
    const queryListCart = `SELECT ct."cart_id" 
                           FROM carts ct 
                           WHERE ct."userId" = $1 AND ct."is_succ" == true 
                           ORDER BY ct."id" DESC`;
    const resultCart = await db.query(queryListCart, [decoded.userId]);

    const cartList = {};

    // สำหรับแต่ละตะกร้า
    for (const cart of resultCart.rows) {
      const cartId = cart.cart_id;

      // ดึงข้อมูลสรุปตะกร้า
      const queryCartSum = `SELECT SUM(ctd."quantity") AS qty, 
                                   SUM(ctd."quantity" * pd."product_price") AS money
                            FROM "cart_items" ctd 
                            LEFT JOIN "products" pd ON ctd."product_id" = pd."product_id"
                            WHERE ctd."cart_id" = $1
                            GROUP BY ctd."cart_id"`;
      const resultCartSum = await db.query(queryCartSum, [cartId]);

      // ดึงข้อมูลสินค้าในตะกร้า
      const queryCartItems = `SELECT ctd."product_id", 
                                     pd."product_name", 
                                     ctd."quantity" AS qty, 
                                     pd."product_price" AS price, 
                                     (ctd."quantity" * pd."product_price") AS total
                              FROM "cart_items" ctd 
                              LEFT JOIN "products" pd ON ctd."product_id" = pd."product_id"
                              WHERE ctd."cart_id" = $1`;
      const resultCartItems = await db.query(queryCartItems, [cartId]);

      const productList = {};
      resultCartItems.rows.forEach((item) => {
        productList[item.product_id] = {
          product_id: item.product_id,
          product_name: item.product_name,
          qty: item.qty,
          price: item.price,
          Total: item.total,
        };
      });

      cartList[cartId] = {
        qty: resultCartSum.rows[0].qty,
        total: resultCartSum.rows[0].money,
        productList: productList,
      };
    }

    // ส่งผลลัพธ์กลับ
    return res.json({
      status: 200,
      data: {
        // id: userData.id,
        // email: userData.memEmail,
        cartList: cartList,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function updateCartItemQty(req, res) {
  console.log(`POST Update Cart Item Qty is Requested`);
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized - No token provided",
      });
    }
    const secret_key = process.env.SECRET_KEY;
    console.log(secret_key);
    let decoded;
    try {
      console.log(`decoded`);
      decoded = jwt.verify(token, secret_key);
      console.log(decoded);
    } catch (err) {
      return res.status(401).json({
        error: "Unauthorized - Invalid token",
      });
    }

    const queryCheckCart = `SELECT * FROM carts WHERE "cart_id" = $1 AND "userId" = $2 AND "is_succ" != true`;
    const resultCheckCart = await db.query(queryCheckCart, [
      req.body.cart_id,
      decoded.userId,
    ]);

    if (resultCheckCart.rows.length === 0) {
      return res.status(400).json({ error: "Cart or items not found" });
    }

    const queryUpdateQty = `UPDATE "cart_items" ci
                            SET "quantity" = $1
                            FROM "carts" ct
                            WHERE ci."cart_id" = ct."cart_id"
                              AND ci."cart_id" = $2
                              AND ci."product_id" = $3
                              AND ct."userId" = $4
                              AND ct."is_succ" != true;
                            `;
    const resultUpdateQty = await db.query(queryUpdateQty, [
      req.body.qty,
      req.body.cart_id,
      req.body.product_id,
      decoded.userId,
    ]);

    return res.json({ status: 200 });
  } catch (error) {
    console.log(error);
    return res.json({
      error: error.message,
    });
  }
}
export async function delCartItem(req, res) {
  console.log(`POST Delete Cart Item Qty is Requested`);
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized - No token provided",
      });
    }
    const secret_key = process.env.SECRET_KEY;
    console.log(secret_key);
    let decoded;
    try {
      console.log(`decoded`);
      decoded = jwt.verify(token, secret_key);
      console.log(decoded);
    } catch (err) {
      return res.status(401).json({
        error: "Unauthorized - Invalid token",
      });
    }

    const queryCheckCart = `SELECT * FROM carts WHERE "cart_id" = $1 AND "userId" = $2 AND "is_succ" != true`;
    const resultCheckCart = await db.query(queryCheckCart, [
      req.body.cart_id,
      decoded.userId,
    ]);

    if (resultCheckCart.rows.length === 0) {
      return res.status(400).json({ error: "Cart or items not found" });
    }

    const queryDelItem = `DELETE FROM "cart_items" ci
                          USING "carts" ct
                          WHERE ci."cart_id" = ct."cart_id"
                            AND ci."cart_id" = $1
                            AND ci."product_id" = $2
                            AND ct."userId" = $3
                            AND ct."is_succ" != true;`;
    const resultDelItem = await db.query(queryDelItem, [
      req.body.cart_id,
      req.body.product_id,
      decoded.userId,
    ]);

    return res.json({ status: 200 });
  } catch (error) {
    console.log(error);
    return res.json({
      error: error.message,
    });
  }
}

export async function delCart(req, res) {
  console.log(`POST Delete Cart is Requested`);
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized - No token provided",
      });
    }
    const secret_key = process.env.SECRET_KEY;
    console.log(secret_key);
    let decoded;
    try {
      console.log(`decoded`);
      decoded = jwt.verify(token, secret_key);
      console.log(decoded);
    } catch (err) {
      return res.status(401).json({
        error: "Unauthorized - Invalid token",
      });
    }

    const queryCheckCart = `SELECT * FROM carts WHERE "cart_id" = $1 AND "userId" = $2 AND "is_succ" != true`;
    const resultCheckCart = await db.query(queryCheckCart, [
      req.body.cart_id,
      decoded.userId,
    ]);

    if (resultCheckCart.rows.length === 0) {
      return res.status(400).json({ error: "Cart or items not found" });
    }

    const queryDelCart = `DELETE FROM carts WHERE "cart_id" = $1 AND "userId" = $2 AND "is_succ" != true`;
    const resultDelCart = await db.query(queryDelCart, [
      req.body.cart_id,
      decoded.userId,
    ]);

    return res.json({ status: 200 });
  } catch (error) {
    console.log(error);
    return res.json({
      error: error.message,
    });
  }
}

export async function confirmCart(req, res) {
  console.log(`POST Confirm Cart is Requested`);
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized - No token provided",
      });
    }

    const secret_key = process.env.SECRET_KEY;
    console.log(secret_key);
    let decoded;
    try {
      console.log(`decoded`);
      decoded = jwt.verify(token, secret_key);
      console.log(decoded);
    } catch (err) {
      return res.status(401).json({
        error: "Unauthorized - Invalid token",
      });
    }

    // ตรวจสอบว่าตะกร้ามีอยู่และยังไม่สมบูรณ์
    const queryCheckCart = `SELECT * FROM carts WHERE "cart_id" = $1 AND "userId" = $2 AND "is_succ" != true`;
    const resultCheckCart = await db.query(queryCheckCart, [
      req.body.cart_id,
      decoded.userId,
    ]);

    if (resultCheckCart.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "Cart not found or already confirmed" });
    }

    // ตรวจสอบว่าตะกร้ามีสินค้าหรือไม่
    const queryCheckCartItems = `SELECT * FROM cart_items WHERE "cart_id" = $1`;
    const resultCheckCartItems = await db.query(queryCheckCartItems, [
      req.body.cart_id,
    ]);

    if (resultCheckCartItems.rows.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // อัปเดทสถานะตะกร้าเป็น "สำเร็จ"
    const queryConfirmCart = `UPDATE carts SET "is_succ" = $1 WHERE "cart_id" = $2 AND "userId" = $3 AND "is_succ" != true`;
    const resultConfirmCart = await db.query(queryConfirmCart, [
      true,
      req.body.cart_id,
      decoded.userId,
    ]);

    if (resultConfirmCart.rowCount === 0) {
      return res.status(400).json({ error: "Failed to confirm cart" });
    }

    return res.json({
      status: 200,
      message: "Cart confirmed successfully",
      cart_id: req.body.cart_id,
    });
  } catch (error) {
    console.error("Error confirming cart:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
}
