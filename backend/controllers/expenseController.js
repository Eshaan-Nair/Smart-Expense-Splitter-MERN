const Expense = require('../models/Expense');
const Group = require('../models/Group');
const User = require('../models/User');

exports.createExpense = async (req, res) => {
    try {
        const { title, amount, category, description, groupId, splitType, splitBetween } = req.body;

        if (!title || !amount || !groupId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide title, amount, and group'
            });
        }

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        const isMember = group.members.some(
            member => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this group'
            });
        }

        let splitData = [];
        if (splitType === 'equal') {
            const memberCount = group.members.length;
            const amountPerPerson = amount / memberCount;

            for (let member of group.members) {
                splitData.push({
                    user: member.user,
                    amount: amountPerPerson,
                    isPaid: member.user.toString() === req.user._id.toString()
                });
            }
        } else if (splitType === 'custom' && splitBetween) {
            splitData = splitBetween.map(split => ({
                user: split.userId,
                amount: split.amount,
                isPaid: split.userId === req.user._id.toString()
            }));
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid split type'
            });
        }

        const expense = await Expense.create({
            title,
            amount,
            category,
            description,
            group: groupId,
            paidBy: req.user._id,
            splitBetween: splitData
        });

        group.totalExpenses += amount;
        await group.save();

        const populatedExpense = await Expense.findById(expense._id)
            .populate('paidBy', 'name email avatar')
            .populate('splitBetween.user', 'name email avatar')
            .populate('group', 'name');

        res.status(201).json({
            success: true,
            message: 'Expense created successfully',
            expense: populatedExpense
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getGroupExpenses = async (req, res) => {
    try {
        const groupId = req.params.groupId;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        const isMember = group.members.some(
            member => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this group'
            });
        }

        const expenses = await Expense.find({ group: groupId })
            .populate('paidBy', 'name email avatar')
            .populate('splitBetween.user', 'name email avatar')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: expenses.length,
            expenses
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getExpenseById = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id)
            .populate('paidBy', 'name email avatar')
            .populate('splitBetween.user', 'name email avatar')
            .populate('group', 'name');

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        const group = await Group.findById(expense.group._id);
        const isMember = group.members.some(
            member => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this group'
            });
        }

        res.status(200).json({
            success: true,
            expense
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        if (expense.paidBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the person who paid can delete this expense'
            });
        }

        const group = await Group.findById(expense.group);
        group.totalExpenses -= expense.amount;
        await group.save();

        await Expense.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Expense deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.settleExpense = async (req, res) => {
    try {
        const { expenseId, userId } = req.body;

        if (!expenseId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide expense ID and user ID'
            });
        }   

        const expense = await Expense.findById(expenseId);

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        const splitEntry = expense.splitBetween.find(
            split => split.user.toString() === userId
        );

        if (!splitEntry) {
            return res.status(404).json({
                success: false,
                message: 'User not found in this expense'
            });
        }

        if (splitEntry.isPaid) {
            return res.status(400).json({
                success: false,
                message: 'This expense is already settled'
            });
        }

        splitEntry.isPaid = true;
        await expense.save();

        const updatedExpense = await Expense.findById(expenseId)
            .populate('paidBy', 'name email avatar')
            .populate('splitBetween.user', 'name email avatar')
            .populate('group', 'name');

        res.status(200).json({
            success: true,
            message: 'Expense settled successfully',
            expense: updatedExpense
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};