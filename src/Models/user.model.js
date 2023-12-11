const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    phoneNumber: Number,

    address: {
        city: String,
        state: String,
    },
    roles: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },

 
})

const User = mongoose.model('User',userSchema)

module.exports = User;