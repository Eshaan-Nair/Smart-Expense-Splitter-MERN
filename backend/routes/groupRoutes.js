const express = require('express');
const { 
    createGroup, 
    getUserGroups, 
    getGroupById, 
    addMember,
    deleteGroup
} = require('../controllers/groupController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createGroup);
router.get('/', protect, getUserGroups);
router.get('/:id', protect, getGroupById);
router.post('/:id/members', protect, addMember);
router.delete('/:id', protect, deleteGroup);

module.exports = router;