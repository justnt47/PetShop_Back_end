import db from "../Service/database.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import multer from "multer";
export async function addMember(req, res) {
    console.log('POST /addMember Requested');
    const bodyData = req.body;
    try {
        
        if (req.body.Email == null || req.body.fName == null || req.body.lName == null|| req.body.password == null || req.body.Email == '' || req.body.fName == '' || req.body.lName == '' || req.body.password == '') {
            return res.status(422).json({
                error: 'Bad Request - Email, fName, lName and password are required'
            });
            
        }
        const userName = req.body.Email.split('@')[0];
        const pwd = req.body.password;
        const salt = 11;
        const pwdHash = await bcrypt.hash(pwd, salt);
        const queryCheck = 'SELECT EXISTS(SELECT * FROM public.members WHERE "memEmail" = $1)';
        const resultCheck = await db.query(queryCheck,[
            req.body.Email
        ]);
        if (resultCheck.rows[0].exists) {
            return res.json({
                message: `Conflict - memEmail ${req.body.Email} already exists`,
                regist:false,
            });
        }
        
        // NOTE: insert data to the database using parameterize, WARNING: concatenate string is not safe
        const query = 'INSERT INTO public.members( "memEmail", "userName","memfName", "memlName",  "memHash","roleId") VALUES($1,$2,$3,$4,$5,$6) ';
        const result = await db.query(query,[
            req.body.Email,
            userName,
            req.body.fName, 
            req.body.lName, 
            pwdHash, 
            req.body.roldId ?? 1, 

        ]);
        

        return res.status(201).json({regist:true});
    } catch (error) {
        res.json({
            message: error,
            regist:false,

        });
    }  
};


export async function loginMember(req, res) {
    console.log('POST /loginMember Requested');
    const bodyData = req.body;
    try {
        
        if ( req.body.email == null || req.body.password == null || req.body.password == '' || req.body.email == ''){
            // return res.status(422).json({
            //     error: 'Bad Request - memEmail and loginname are required'
            // });
            return res.json({
                login:false});
        }
        
        const queryCheck = 'SELECT EXISTS(SELECT * FROM member_role_view WHERE "memEmail" = $1)';
        const resultCheck = await db.query(queryCheck,[
            req.body.email
        ]);
        if (!resultCheck.rows[0].exists) {
            return res.json({
                message:"อีเมลหรือรหัสผ่านไม่ถูกต้อง",
                login:false});
        }
        const query = 'SELECT * FROM member_role_view WHERE "memEmail" = $1';
        const result = await db.query(query,
        [
            req.body.email
        ]);
        
        const loginok = await bcrypt.compare(req.body.password, result.rows[0].memHash);
        

        if(loginok){
        const theuser = {
            Email: result.rows[0].memEmail,
            fName: result.rows[0].memfName,
            lName: result.rows[0].memlName,
            roleId: result.rows[0].roleId,
            roleTH: result.rows[0].roleTHName,
            roleEN: result.rows[0].roleENName,
        };   
        console.log('theuser →' ,theuser);
        const secret_key = process.env.SECRET_KEY;
        console.log('secret_key →' ,secret_key);
        const token = jwt.sign(theuser, secret_key);
        console.log('token →' ,token);
 
        res.cookie('token', token, {
            // ms * sec * min * hour * day
            maxAge: 1000 * 60 * 60, // 1 hour
            secure:true,
            sameSite: 'None',
        });
        return res.json({
            login:true,
            token: token});
        }
        else{
            res.clearCookie('token', {
                secure:true,
                sameSite: 'None',
            });
            return res.json({
                login:false});
        }
    } catch (error) {
        // res.status(500).json({
        //     error: error.message
        // });
        return res.json({
            message:"อีเมลหรือรหัสผ่านไม่ถูกต้อง",
            login:false})
        }
      
};

export async function logoutMember(req, res) {
        console.log('POST /logoutMember Requested');   
    try {
            res.clearCookie('token', {
                secure:true,
                sameSite: 'None',
            });
            
        return res.json({
            login:false});
    } catch (error) {
        // res.status(500).json({
        //     error: error.message
        // });
        return res.json({
            error:error})
        }
      
};

export async function uploadMember(req, res) {
    console.log("Upload Member Image")
     upload(req, res, (err) => {
         if (err) {
             return res.status(400).json({ message: err.message });
         }
         res.status(200).json({ message: 'File uploaded successfully!' });
     });
 }
 