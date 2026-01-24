const Group = require('../models/Group');
const User = require('../models/User');
const Expense = require('../models/Expense');

exports.createGroup = async (req, res) => {
    try {
        const { name, description, memberEmails } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a group name'
            });
        }

        const members = [
            {
                user: req.user._id,
                joinedAt: Date.now()
            }
        ];

        if (memberEmails && memberEmails.length > 0) {
            for (let email of memberEmails) {
                const user = await User.findOne({ email });
                if (user) {
                    if (user._id.toString() !== req.user._id.toString()) {
                        members.push({
                            user: user._id,
                            joinedAt: Date.now()
                        });
                    }
                }
            }
        }

        const group = await Group.create({
            name,
            description,
            createdBy: req.user._id,
            members 
        });

        const populateGroup = await Group.findById(group._id)
            .populate('createdBy', 'name email avatar')
            .populate('members.user', 'name email avatar');

        res.status(201).json({
            success: true,
            message: 'Group created Successfully',
            group: populateGroup
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getUserGroups = async (req, res) => {
    try {
        const groups = await Group.find({
            'members.user': req.user._id
        })
            .populate('createdBy', 'name email avatar')
            .populate('members.user', 'name email avatar')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: groups.length,
            groups
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getGroupById = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('createdBy', 'name email avatar')
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
                message: 'You are not member of this group'
            });
        }

        res.status(200).json({
            success: true,
            group
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.addMember = async (req, res) => {
    try {
        const { email } = req.body;
        const groupId = req.params.id;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email'
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
                message: 'Only group members can add new members'
            });
        }

        const userToAdd = await User.findOne({ email });

        if (!userToAdd) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const alreadyMember = group.members.some(
            member => member.user.toString() === userToAdd._id.toString()
        );

        if (alreadyMember) {
            return res.status(400).json({
                success: false,
                message: 'User is already a member'
            });
        }

        group.members.push({
            user: userToAdd._id,
            joinedAt: Date.now()
        });

        await group.save();

        const updatedGroup = await Group.findById(groupId)
            .populate('createdBy', 'name email avatar')
            .populate('members.user', 'name email avatar');

        res.status(200).json({
            success: true,
            message: 'Member added successfully',
            group: updatedGroup
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if user is the creator or a member
        const isMember = group.members.some(
            member => member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'Only group members can delete this group'
            });
        }

        // Delete all expenses associated with this group
        await Expense.deleteMany({ group: req.params.id });

        // Delete the group
        await Group.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Group and all associated expenses deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};