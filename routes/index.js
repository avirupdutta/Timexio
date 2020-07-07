const express = require("express");
const categories = require("../models/productCategories");
const { getCommonMetaData } = require("./utils");

const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");
const Product = require("../models/Product");

// welcome page
router.get("/", async (req, res) => {
	let data = {};
	// Things to be displayed on the home page
	// ========================================
	// New Arrivals    <==> Latest 10 products
	// Featured        <==> Most bought products among all New Arrivals items
	// Popular 		   <==> Most bought products among all items
	// Category		   <==> List Products by category
	// Editor's Choice <==> Handpicked products
	// ========================================

	// For New Arrivals
	await Product.find({}, (err, items) => {
		if (err) {
			console.log(err);
		}
		const newArrivalProducts = items
			.sort((item1, item2) => {
				if (item1.created > item2.created) {
					return -1;
				} else if (item1.created < item2.created) {
					return 1;
				} else {
					return 0;
				}
			})
			.slice(0, 10);
		data.newArrivalProducts = newArrivalProducts;
	});

	res.render("index", {
		...getCommonMetaData(req, "Home"),
		...data
	});
});

// category page
router.get("/category/:model", (req, res) => {
	const modelName = req.params.model;
	if (categories.includes(modelName)) {
		// render all products under that category
		res.render("category", {
			...getCommonMetaData(req, "Home")
		});
	} else {
		res.render("404", {
			...getCommonMetaData(req, `${modelName} category not found!`)
		});
	}
});

// dashboard
router.get("/account", ensureAuthenticated, (req, res) => {
	res.render("account/userAccount", {
		...getCommonMetaData(req, "Account")
	});
});

// cart page
router.get("/account/cart", ensureAuthenticated, (req, res) => {
	res.render("account/cart", {
		...getCommonMetaData(req, "Cart")
	});
});

// checkout page
router.get("/account/checkout", ensureAuthenticated, (req, res) => {
	res.render("account/checkout", {
		...getCommonMetaData(req, "Checkout")
	});
});

router.get("/unauthorized", function(req, res) {
	res.render("unauthorized", {
		...getCommonMetaData(req, "Authorization Error!")
	});
});

module.exports = router;
