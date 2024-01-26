// Imports and consts
import express from 'express';
import mpsController from '../controllers/mpsController.js';

const mpsRouter = new express();


// Router settings
mpsRouter.get('/getMp', mpsController.getMps);
mpsRouter.post('/createMp', mpsController.createMp);


export default mpsRouter;
