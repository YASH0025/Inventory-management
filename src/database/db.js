const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/UserCollection', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection

db.on('error', console.error.bind(console, 'mongodb error'))
db.once('open', () => {
    console.log("connected to database")
})

module.exports = db