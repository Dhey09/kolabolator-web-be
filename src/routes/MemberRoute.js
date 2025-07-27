import express from 'express'
import {
    createMember,
    getMembers,
    getMemberById,
    updateMember,
    deleteMember
} from '../controllers/Member.js'
import { verifyAdmin,  verifyToken, verifyAccess } from '../middleware/authUser.js'

const router = express.Router()

router.post('/api/:roleId/member', createMember)
router.get('/api/members', verifyToken, verifyAdmin, getMembers)
router.get('/api/member/:id',verifyToken, getMemberById)
router.patch('/api/member/:id', verifyToken, verifyAccess, updateMember)
router.delete('/api/member/:id', verifyToken, verifyAdmin, deleteMember)

export default router