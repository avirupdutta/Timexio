const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
	productId: {
		type: String,
		required: true
	},
	productName: {
		type: String,
		required: true
	},
	productCategory: {
		type: String,
		required: true
	},
	productPrice: {
		type: Number,
		required: true
	},
	userId: {
		type: String,
		required: true
	},
	userFullName: {
		type: String,
		required: true
	},
	userEmail: {
		type: String,
		required: true
	},
	deliveryAddress: {
		type: String,
		required: true
	},
	paymentMethod: {
		type: String,
		required: true
	},
	isPaid: {
		type: Boolean,
		required: true
	},
	orderedQuantity: {
		type: Number,
		required: true
	},
	orderedDate: {
		type: Date,
		default: Date.now
	},
	deliveryDate: {
		type: Date,
		default: null
	}
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
