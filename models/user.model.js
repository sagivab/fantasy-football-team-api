const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
        email: {
            type: String,
            required: 'Email address is required',
            unique: true,
        },
        hashedPassword: {
            type: String,
            required: 'Password is required',
        },
        teamOwn: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
        },
        role: {
            type: String,
            default: 'basic',
            enum: ['basic', 'administrator'],
        },
    },
    { 
        collection: 'users'
    },
);


userSchema.methods.encryptPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

userSchema.methods.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.hashedPassword);
};

module.exports = mongoose.model('User', userSchema);
