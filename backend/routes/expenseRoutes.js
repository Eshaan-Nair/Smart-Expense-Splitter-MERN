const express=require('express');
const {
    createExpense,
    getGroupExpenses,
    getExpenseById,
    deleteExpense,
    settleExpense
} =require('../controllers/expenseController');

const {protect}=require('../middleware/authMiddleware');

const router=express.Router();

router.post('/', protect, createExpense);
router.get('/group/:groupId', protect, getGroupExpenses);
router.get('/:id', protect, getExpenseById);
router.delete('/:id', protect, deleteExpense);
router.post('/settle', protect, settleExpense);

module.exports= router;