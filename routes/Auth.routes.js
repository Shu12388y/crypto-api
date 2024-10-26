import { Router } from 'express';
import { AuthController } from '../controller/auth/auth.Controller.js';

export const AuthRouter = Router();

AuthRouter.get('/genratetoken', AuthController.GenrateToken);
