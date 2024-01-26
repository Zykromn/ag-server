// // Imports and consts
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import {LowSync} from 'lowdb';
// import {JSONFileSync} from 'lowdb/node'
// // import {accessExp, authListDir, refreshExp, refreshExpSec, secret_accessKey, secret_refreshKey} from '../config.js';
//
// const authListDB = new LowSync(new JSONFileSync(authListDir), {});
//
//
// // Addition funtions
// function checkSysAuth(id, password=null) {
//     try {
//         authListDB.read();
//         const authListData = authListDB.data;
//         const idValid = id in authListData;
//         let idStatus, passwordValid;
//
//         if (idValid) {
//             idStatus = authListData[id]['status'];
//
//             if (password) {
//                 passwordValid = bcrypt.compareSync(password, authListData[id]['password'])
//                 return {
//                     idValid,
//                     idStatus,
//                     passwordValid
//                 };
//             } else {
//                 return {
//                     idValid,
//                     idStatus
//                 };
//             }
//         } else {
//             idStatus = false;
//             passwordValid = false;
//
//             if (password) {
//                 return {
//                     idValid,
//                     idStatus,
//                     passwordValid
//                 };
//             } else {
//                 return {
//                     idValid,
//                     idStatus
//                 };
//             }
//         }
//     } catch (e) {
//         console.log(e)
//         let idValid = false;
//         let idStatus = false;
//         let passwordValid = false;
//
//         if (password) {
//             return {
//                 idValid,
//                 idStatus,
//                 passwordValid
//             };
//         } else {
//             return {
//                 idValid,
//                 idStatus
//             };
//         }
//     }
// }
//
// function generateTokens(payload){
//     const accessToken = jwt.sign(payload, secret_accessKey, {expiresIn: accessExp});
//     const refreshToken = jwt.sign(payload, secret_refreshKey, {expiresIn: refreshExp});
//
//     authListDB.read();
//     let authListData = authListDB.data;
//     authListData[payload.id]["refreshToken"] = refreshToken;
//     authListDB.write();
//     return {
//         accessToken,
//         refreshToken
//     }
// }
//
// function decodeJwt(token, key){
//     try {
//         jwt.verify(token, key);
//     } catch (e) {
//         return null;
//     }
//     return jwt.decode(token);
// }
//
//
// // Main class
// class authController {
//     async system(req, res){
//         try{
//             const id = req.query.id;
//             if(!id){
//                 return res.status(400).json({code: 110})
//             }
//
//             if (checkSysAuth(id).idValid){
//                 if (checkSysAuth(id).idStatus === "true"){
//                     return res.status(200).json({code: 220})
//                 } else {
//                     return res.status(200).json({code: 225})
//                 }
//             } else {
//                 return res.status(200).json({code: 210})
//             }
//         } catch (e){
//             console.log(e)
//             return res.status(403).json({code: 130})
//         }
//     }
//
//     async device(req, res){
//         try{
//             const id = req.body.id;
//             const password = req.body.password;
//             if(!id || !password){
//                 return res.status(400).json({code: 110})
//             }
//
//             const sysAuth = checkSysAuth(id, password);
//             if (sysAuth.idValid){
//                 if (sysAuth.passwordValid){
//                     authListDB.read();
//                     const status = authListDB.data[id]["status"];
//                     const tokenBundle = generateTokens({
//                         id: id,
//                         status: status
//                     })
//                     res.cookie('refreshToken', tokenBundle.refreshToken, {
//                         maxAge: refreshExpSec,
//                         // sameSite: "None",
//                         // secure: true,
//                         path: "/",
//                         httpOnly: true
//                     })
//                     return res.status(200).json({
//                         code: 220,
//                         accessToken: tokenBundle.accessToken,
//                     })
//                 } else {
//                     return res.status(200).json({code: 230})
//                 }
//             } else {
//                 return res.status(200).json({code: 210})
//             }
//         } catch (e){
//             console.log(e)
//             return res.status(403).json({code: 130})
//         }
//     }
//
//     async device_access(req, res) {
//         try {
//             const authHeader = req.headers.authorization;
//             if (!authHeader && !authHeader.startsWith('Bearer ')){
//                 return res.status(400).json({code: 110})
//             }
//             const accessToken = authHeader.substring(7);
//             const decodedJwt = decodeJwt(accessToken, secret_accessKey);
//             if (decodedJwt){
//                 const id = decodedJwt.id;
//                 if (!id){
//                     return res.status(403).json({code: 130})
//                 }
//
//                 const sysAuth = checkSysAuth(id);
//                 if (sysAuth.idValid){
//                     return res.status(200).json({code: 220})
//                 } else {
//                     return res.status(401).json({code: 210})
//                 }
//             } else {
//                 return res.status(200).json({code: 140})
//             }
//         } catch (e) {
//             console.log(e)
//             return res.status(403).json({code: 130})
//         }
//     }
//
//     async refresh(req, res){
//         try{
//             const refreshToken = req.cookies.refreshToken;
//             if(!refreshToken){
//                 return res.status(200).json({code: 140})
//             }
//             const decodedJwt = decodeJwt(refreshToken, secret_refreshKey);
//             if (decodedJwt){
//                 const id = decodedJwt.id;
//                 const sysAuth = checkSysAuth(id);
//                 if (sysAuth.idValid){
//                     authListDB.read();
//                     const authListData = authListDB.data;
//                     const status = authListData[id]["status"]
//
//                     try{
//                         jwt.verify(refreshToken, secret_refreshKey)
//                     } catch (e) {
//                         return res.status(200).json({code: 140})
//                     }
//
//                     if (authListData[id]["refreshToken"] === refreshToken){
//                         const tokenBundle = generateTokens({
//                             id: id,
//                             status: status
//                         })
//                         res.cookie('refreshToken', tokenBundle.refreshToken, {
//                             maxAge: refreshExpSec,
//                             // sameSite: "None",
//                             // secure: true,
//                             path: "/",
//                             httpOnly: true
//                         })
//                         return res.status(200).json({
//                             code: 220,
//                             accessToken: tokenBundle.accessToken,
//                         })
//                     } else {
//                         return res.status(200).json({code: 140})
//                     }
//                 } else {
//                     return res.status(401).json({code: 210})
//                 }
//             } else {
//                 return res.status(200).json({code: 140})
//             }
//         } catch (e){
//             console.log(e)
//             return res.status(403).json({code: 130})
//         }
//     }
//
//     async refresh_delete(req, res){
//         try{
//             res.clearCookie('refreshToken', {
//                 path: "/"
//             })
//             return res.status(200).json({
//                 code: 220,
//             })
//         } catch (e){
//             console.log(e)
//             return res.status(403).json({code: 130})
//         }
//     }
// }
//
// export default new authController()
