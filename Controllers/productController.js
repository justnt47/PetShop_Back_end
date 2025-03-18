import db from "../Service/database.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';



export async function addProduct(req,res){
    console.log('POST /addProduct Requested');
    const bodyData = req.body;
    try {
        
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];
        console.log(bodyData);
        console.log(token);
        if (!token) {
            return res.status(401).json({
                error: 'Unauthorized - No token provided'
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
                        error: 'Unauthorized - Invalid token'
                    });
                }

        if (req.body.product_name == null || req.body.product_name == '' || req.body.product_type_id == null || req.body.product_type_id == '' || req.body.product_price == null || req.body.product_price == '' || req.body.product_image == null || req.body.product_image == '' || req.body.product_detail == null || req.body.product_detail == '') {
            return res.status(422).json({
                error: 'Bad Request - Product Name , Product Type , Product Price, Product Deatil are required'
            });
        }
        const datetime = new Date();
        // NOTE: insert create date to the result object
        bodyData.createDate = datetime;  
       
        
        // NOTE: insert data to the database using parameterize, WARNING: concatenate string is not safe
        const query = `INSERT INTO public.products(
                                                "product_id",
                                                "product_name",
                                                "product_detail" ,
                                                "product_image",
                                                "product_type_id",
                                                "product_price",
                                                "create_date",
                                                "create_by"
                                                ) VALUES(
                                                 nextval('products_id_seq'),
                                                 $1,
                                                 $2,
                                                 $3,
                                                 $4,
                                                 $5,
                                                 $6,
                                                 $7)`;
        const result = await db.query(query,[
            req.body.product_name, 
            req.body.product_detail, 
            req.body.product_image, 
            req.body.product_type_id, 
            req.body.product_price, 
            datetime, 
            decoded.userId
        ]);

          
        console.log(bodyData);
        return res.status(200).json({
                                    status:200,
                                    addProd:true,
                                    message:'Product added successfully'
                                });
    } catch (error) {
        res.status(500).json({
            addProd:false,
            error: error.message
        });
    }  
};

