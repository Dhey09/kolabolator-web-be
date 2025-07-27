import express from 'express';
import {
    LoginAdmin,
    LoginMember,
    RefreshToken,
    LogoutAdmin,
    LogoutMember
} from '../controllers/Auth.js';

const router = express.Router();

router.post('/api/login-admin', LoginAdmin);
router.post('/api/login-member', LoginMember);
router.get('/api/refresh', RefreshToken);
router.delete('/api/logout', LogoutAdmin);
router.delete('/api/logout-member', LogoutMember);

export default router;