const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const orderItemSchema = Schema({
  name: {
    type: String,
    minLength: [5, "Panjang nama makanan min imal 50 karakter"],
    required: [true, "name must be filled"],
  },

  price: {
    type: Number,
    required: [true, "Harga item harus diisi"],
  },

  qty: {
    type: Number,
    required: [true, "Kuantitas harus diisi"],
    min: [1, "kuantitas minimal 1"],
  },

  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
  },

  order: {
    type: Schema.Types.ObjectId,
    ref: "Order",
  },
});
const Order = model("OrderItem", orderItemSchema);
module.exports = Order;
