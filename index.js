// Imports and consts
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
// import authRouter from './routers/authRouter.js';
import mpsRouter from "./routers/mpsRouter.js";

const PORT = 5000;
const app = express();


// Server settings
app.use(cors({
    credentials: true,
    origin: [
        'http://smartenv.kz:3000',     // 2024 - current client
        'http://smartenv.kz:80',     // 2024 - current client
        'http://31.129.96.50:3000',     // 2022 - 2023 - current client
        'http://31.129.96.50:80',       // 2022 - 2023 - current client
        'http://localhost:3000'         // Development client
        ]
}));
app.use(express.json());
// app.use('/auth', authRouter);
app.use('/mps', mpsRouter);


// Server launch
async function server(){
    try{
        app.listen(PORT, () => console.log(`
=================== Server started ===================
PORT - ${PORT}
======================================================
            
        `));
    } catch (e) {
        console.log(`
================ Server working error ================
${e}
======================================================

        `);
    }
}
server();
