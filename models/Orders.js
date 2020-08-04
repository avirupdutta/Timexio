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
	price: {
		type: Number,
		required: true
	},
	image: {
		type: String,
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
	userPhoneNumber: {
		type: Number,
		required: true
	},
	deliveryAddress: {
		type: String,
		required: true
	},
	userCity: {
		type: String,
		required: true,
	},
	userPincode: {
		type: Number,
		required: true
	},
	paymentMethod: {
		type: String,
		required: true,
		default: "Cash On Delivery"
	},
	isPaid: {
		type: Boolean,
		required: true,
		default: false
	},
	quantity: {
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
	},
	isNotCancelled: {
		type: Boolean,
		default: true
	}
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
