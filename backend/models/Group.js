const mongoose=require('mongoose');

const groupSchema=new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a group name'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    totalExpenses: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports=mongoose.model('Group', groupSchema);