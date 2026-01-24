const Group = require('../models/Group');
const Expense = require('../models/Expense');
const { getGroupSettlements, calculateBalance } = require('../utils/settlementAlgorithm');

exports.getGroupBalance = async (req, res) => {
    try {
        const groupId = req.params.groupId;

        const group = await Group.findById(groupId)
            .populate('members.user', 'name email avatar');

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        const isMember = group.members.some(
            member => member.user._id.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this group'
            });
        }

        const expenses = await Expense.find({ group: groupId })
            .populate('paidBy', 'name email avatar')
            .populate('splitBetween.user', 'name email avatar');

        const result = await getGroupSettlements(expenses, group.members);
        const userBalance = result.balances[req.user._id.toString()];

        res.status(200).json({
            success: true,
            groupName: group.name,
            yourBalance: userBalance,
            allBalances: result.balances,
            optimizedSettlements: result.settlements
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getUserBalance = async (req, res) => {
    try {
        const groups = await Group.find({
            'members.user': req.user._id
        }).populate('members.user', 'name email avatar');

        let totalOwed = 0;
        let totalOwe = 0;
        const groupBalances = [];

        for (let group of groups) {
            const expenses = await Expense.find({ group: group._id })
                .populate('paidBy', 'name email avatar')
                .populate('splitBetween.user', 'name email avatar');

            const balance = calculateBalance(expenses, req.user._id);

            if (balance > 0) {
                totalOwed += balance;
            } else if (balance < 0) {
                totalOwe += Math.abs(balance);
            }

            groupBalances.push({
                groupId: group._id,
                groupName: group.name,
                balance: balance
            });
        }

        res.status(200).json({
            success: true,
            summary: {
                totalOwed: totalOwed,
                totalOwe: totalOwe,
                netBalance: totalOwed - totalOwe
            },
            groupBalances: groupBalances
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getSettlementSuggestions = async (req, res) => {
    try {
        const groupId = req.params.groupId;

        const group = await Group.findById(groupId)
            .populate('members.user', 'name email avatar');

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        const isMember = group.members.some(
            member => member.user._id.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this group'
            });
        }

        const expenses = await Expense.find({ group: groupId })
            .populate('paidBy', 'name email avatar')
            .populate('splitBetween.user', 'name email avatar');

        const result = await getGroupSettlements(expenses, group.members);

        const userSettlements = result.settlements.filter(
            settlement =>
            settlement.from.id === req.user._id.toString() ||
            settlement.to.id === req.user._id.toString()
        );

        res.status(200).json({
            success: true,
            message: 'Settlement suggestions generated',
            yourSettlements: userSettlements,
            allSettlements: result.settlements
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};