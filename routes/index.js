const express = require("express");
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");
// welcome page
router.get("/", (req, res) => {
	res.render("index", {
		title: "Home",
		isAuthenticated: req.isAuthenticated()
	});
});

// dashboard
router.get("/account", ensureAuthenticated, (req, res) => {
	res.render("account/userAccount", {
		title: "Account",
		name: req.user.name,
		isAuthenticated: req.isAuthenticated(),
		admin: req.user.admin
	});
});

// cart page
router.get("/account/cart", ensureAuthenticated, (req, res) => {
	res.render("account/cart", {
		title: "Cart",
		isAuthenticated: req.isAuthenticated()
	});
});

// checkout page
router.get("/account/checkout", ensureAuthenticated, (req, res) => {
	res.render("account/checkout", {
		title: "Checkout & Payment",
		isAuthenticated: req.isAuthenticated()
	});
});

router.get("/unauthorized", function(req, res) {
	res.render("unauthorized", {
		title: "Authorization Error!",
		isAuthenticated: req.isAuthenticated()
	});
});

module.exports = router;
