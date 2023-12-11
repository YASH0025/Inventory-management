const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  isAdmin: { type: Boolean, default: true },

});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
