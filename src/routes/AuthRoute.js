import express from 'express';
import {
    Login,
    RefreshToken,
    Logout,
    ForgotPassword,
    ResetPassword
} from '../controllers/Auth.js';

const router = express.Router();

router.post('/api/login', Login);
router.get('/api/refresh', RefreshToken);
router.post('/api/logout', Logout);

// lupa password
router.post('/api/forgot-password', ForgotPassword);
router.post('/api/reset-password', ResetPassword);

export default router;
