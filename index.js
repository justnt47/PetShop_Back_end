import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
// import ส่วนที่ติดตั้งเข้ามา
import swaggerUI from "swagger-ui-express"
// import swaggerDocument from './Service/swagger_output.json';

import yaml from "yaml"
// ใช้ File
import fs from "fs"
import { createRequire } from 'module';

import productRoute from './Routes/productRoute.js';
import memberRoute from './Routes/memberRoute.js';
import cartRoute from './Routes/cartRoute.js';
import masterDataRoute from './Routes/masterDataRoute.js';

// const require = createRequire(import.meta.url);
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json({ limit: '5mb' })); // ตั้งค่าขนาด request body สูงสุด 5MB
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(bodyParser.json());

// cors เรียกใช้งานก่อนทุกคำสั่ง
app.use(cors(
    {
      origin: ['http://localhost:5173','http://localhost:3000','http://127.0.0.1:5173','http://127.0.0.1:3000'], // อนุญาตให้เว็บไซต์นี้เรียกใช้งาน API
      methods: ['GET','POST','PUT','DELETE'], // อนุญาตให้ใช้งาน method ไหนบ้าง
      credentials: true // อนุญาตให้ส่ง cookie ไปที่เซิฟเวอร์
    }
  )); // อนุญาตให้ดึงข้อมูลจาก server อื่นได้ "ใน mode development เท่านั้น"
// front เรียกผ่าน "img_pd" ที่ /img_pd
app.use(`/img_pd`,express.static('img_pd'));
app.use(`/img_mem`,express.static('img_mem'));
app.use(productRoute);
app.use(memberRoute);
app.use(cartRoute);
app.use(masterDataRoute);

// const swaggerDocument = require('./Service/swagger-output.json', { assert: { type: 'json' } });

// const swaggerfile = fs.readFileSync('./Service/swagger.yaml','utf8');
// const swaggerDoc = yaml.parse(swaggerfile)

const swaggerfile = fs.readFileSync('./Service/swagger_output.json','utf8');
const swaggerDoc = JSON.parse(swaggerfile)
// console.log(`swaggerDoc : ${swaggerDoc}`);
// กำหนด path ที่จะให้เรียกหน้า Document ขึ้นมา
// app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(swaggerDoc))
// app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
// app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(swaggerSpec))
// app.use('/api-docs',swaggerUi.serve,swaggerUi.setup(swaggerSpec))

app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(swaggerDoc))

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});