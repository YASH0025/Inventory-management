const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  quantity: { type: Number, required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
});

module.exports = mongoose.model('Inventory', inventorySchema);
