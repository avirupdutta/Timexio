const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	specs: {
		type: String,
		required: true
	},
	price: {
		type: Number,
		required: true
	},
	images: {
		type: Array,
		required: true
	},
	quantity: {
		type: Number,
		required: true
	},
	tax: {
		type: Number,
		required: true
	},
	category: {
		type: String,
		required: true
	}
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
