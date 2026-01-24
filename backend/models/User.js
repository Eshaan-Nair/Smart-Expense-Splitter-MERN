const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');

const userSchema= new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide a email'],
        unique: true,
        lowercase:true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false
    },
    avatar: {
        type: String,
        default: 'https://via.placeholder.com/150'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.pre('save', async function() {
    if(!this.isModified('password')) {
        return;
    }

    const salt=await bcrypt.genSalt(10);
    this.password=await bcrypt.hash(this.password, salt);
    
});

userSchema.methods.comparePassword=async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);