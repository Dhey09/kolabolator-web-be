import express from 'express'
import {
    createMember,
    getMembers,
    getMemberById,
    updateMember,
    deleteMember
} from '../controllers/Member.js'
import { verifyToken } from '../middleware/authUser.js'

const router = express.Router()

router.post('/api/:roleId/member', createMember)
router.get('/api/members', verifyToken, getMembers)
router.get('/api/member/:id',verifyToken, getMemberById)
router.patch('/api/member/:id', verifyToken, updateMember)
router.delete('/api/member/:id', verifyToken, deleteMember)

export default router