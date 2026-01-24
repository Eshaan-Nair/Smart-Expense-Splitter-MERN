const express = require('express');
const {
    getGroupBalance,
    getUserBalance,
    getSettlementSuggestions
} = require('../controllers/settlementController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/user', protect, getUserBalance);
router.get('/group/:groupId', protect, getGroupBalance);
router.get('/suggestions/:groupId', protect, getSettlementSuggestions);

module.exports = router;