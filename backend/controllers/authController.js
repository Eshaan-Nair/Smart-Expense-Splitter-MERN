const User=require('../models/User');
const jwt=require('jsonwebtoken');

const generateToken=(id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d' 
    });
};

exports.register=async (req, res) => {
    try {
        const {name, email, password} =req.body;
        if(!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please fill all the fields'
            });
        }

        const userExists=await User.findOne({email});
        if(userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already Exists'
            });
        }
        const user=await User.create({
            name,
            email,
            password
        });
        const token=generateToken(user._id);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            }
        });
    } catch(error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.login=async (req, res) => {
    try {
        const {email, password} =req.body;
        if(!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please enter email and password'
            });
        }
        const user=await User.findOne({email}).select('+password');
        if(!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Credentials'
            });
        }

        const isPasswordCorrect=await user.comparePassword(password);
        if(!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Invaled Credentials'
            });
        }
        const token=generateToken(user._id);
        res.status(201).json({
            success: true,
            message: 'Login Successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            }
        });
    } catch(error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Add this to authController.js after the login function

exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name and email'
            });
        }

        // Check if email is already taken by another user
        const existingUser = await User.findOne({ 
            email, 
            _id: { $ne: req.user._id } 
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email is already in use by another account'
            });
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { name, email },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                avatar: updatedUser.avatar
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};