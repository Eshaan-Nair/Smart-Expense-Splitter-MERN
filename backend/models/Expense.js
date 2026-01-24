const mongoose=require('mongoose');

const expenseSchema=new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a expense title'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Please enter the amount'],
        min:0
    },
    category: {
        type: String,
        enum: ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Other'],
        default: 'Other'
    },
    description: {
        type: String,
        trim: true
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    splitBetween: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        isPaid: {
            type: Boolean,
            default: false
        }
    }],
    receiptImage: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports=mongoose.model('Expense', expenseSchema);