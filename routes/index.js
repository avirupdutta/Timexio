const express = require("express");
const categories = require("../models/productCategories");
const { getCommonMetaData } = require("./utils");
const User = require("../models/User");

const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");
const Product = require("../models/Product");

//* ======= PUBLIC ROUTES BELOW! ======= //
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
	try {
		const newArrivalProducts = await Product.find({}).sort({ created: -1 });
		data.newArrivalProducts = newArrivalProducts;

		res.render("index", {
			...getCommonMetaData(req, "Home"),
			...data
		});
	} catch (error) {
		res.render("500", {
			...getCommonMetaData(req, `Something went wrong`)
		});
	}
});

// product details
router.get("/product/:id/details", async (req, res) => {
	const id = req.params.id;
	try {
		const product = await Product.findById(id);
		res.render("productDetails", {
			...getCommonMetaData(req, product.name),
			product
		});
	} catch (error) {}
});

// category page
router.get("/category/:model", async (req, res) => {
	const categoryName = req.params.model;
	if (categories.includes(categoryName)) {
		// render all products under that category
		// todo - Add filter by price feature
		try {
			let products;
			let { sortBy, minPrice, maxPrice } = req.query;

			// sorting products
			switch (sortBy) {
				case "lowToHigh":
					products = await Product.find({
						category: categoryName,
						price: {
							$lte: maxPrice || 1000000000,
							$gte: minPrice || 0
						}
					}).sort({ price: 1 });
					break;
				case "highToLow":
					products = await Product.find({
						category: categoryName,
						price: {
							$lte: maxPrice || 1000000000,
							$gte: minPrice || 0
						}
					}).sort({ price: -1 });
					break;
				case "latest":
					products = await Product.find({
						category: categoryName,
						price: {
							$lte: maxPrice || 1000000000,
							$gte: minPrice || 0
						}
					}).sort({ created: -1 });
					break;
				default:
					products = await Product.find({
						category: categoryName,
						price: {
							$lte: maxPrice || 1000000000,
							$gte: minPrice || 0
						}
					});
					sortBy = "relevence";
					break;
			}
			res.render("category", {
				...getCommonMetaData(req, `Category for ${categoryName}`),
				categoryName,
				products,
				sortBy
			});
		} catch (error) {
			console.log(error);
			res.render("500", {
				...getCommonMetaData(req, `Something went wrong`),
				sortBy: "relevence"
			});
		}
	} else {
		res.render("404", {
			...getCommonMetaData(req, `${categoryName} category not found!`)
		});
	}
});

// search results page
router.get("/search", async (req, res) => {
	const keywords = req.query.keywords.split(" ");
	if (keywords.length > 1) {
		// search engine algo here
		let products = [],
			sortBy = "relevence";
		res.render("searchResults", {
			...getCommonMetaData(
				req,
				`Showing results for ${req.query.keywords}`
			),
			categoryName: categories,
			searchKeywords: req.query.keywords,
			products,
			sortBy
		});
	} else {
		res.redirect("/");
	}
});

// a page for auauthorized access
router.get("/unauthorized", function(req, res) {
	res.render("unauthorized", {
		...getCommonMetaData(req, "Authorization Error!")
	});
});

//* ======= PRIVATE ROUTES BELOW! ======= //
// dashboard
router.get("/account", ensureAuthenticated, (req, res) => {
	res.render("account/userAccount", {
		...getCommonMetaData(req, "Account")
	});
});

// cart page
router.get("/account/cart", ensureAuthenticated, async (req, res) => {
	let cartItems = [];
	await User.findById(req.user.id, (error, user) => {
		if (error) {
			return res.render('500', {
				title: 'Something went wrong! Try again later.'
			})
		}
		if (user) {
			cartItems = [...user.cart]
			return res.render("account/cart", {
				...getCommonMetaData(req, "Showing all products in your cart"),
				cartItems,
				userId: req.user.id
			});
		}
	});
});

// adds new product to cart
router.post("/account/cart/:id/add", ensureAuthenticated, async (req, res) => {
	const productId = req.params.id;

	User.findById(req.user.id, async (error, user) => {
		if (user) {
			let cartItem = user.cart.find(item => item.id === productId);

			if (cartItem) {
				user.cart = user.cart.map(itemInCart => {
					if (itemInCart.id === productId) {
						itemInCart.quantity++;
					}
					return itemInCart;
				})
				user.markModified('cart')
			} else {
				try {
					await Product.findById(productId, (error, product) => {
						if (product) {
							user.cart.unshift({
								id: product.id,
								name: product.name,
								image: product.images[0],
								price: product.price,
								quantity: 1,
							});
						}
					})
				} catch (error) {
					console.log(error)
				}
			}
			try {
				await user.save();
				res.redirect("/account/cart");
			} catch (error) {
				console.log(error)
			}
			
		} else {
			req.flash("error_msg", "Something went wrong! Try again later");
			res.redirect("back");
		}
	});
});

// route to update quantity of specific item in cart
router.patch("/account/cart/update", async (req, res) => {
	const { updatedQuantity, userId, productId } = req.body

	try {
		let user, product;

		await User.findById(userId, (err, userItem) =>{
			if (err) {
				return res
					.status(500)
					.json({ error: "Server Error! Something went wrong" });
			}
			if (userItem) {
				user = userItem
			} else {
				return res.status(404).json({ error: "User Not Found" });
			}
		});

		await Product.findById(productId, (err, productItem) => {
			if (err) {
				return res
					.status(500)
					.json({ error: "Server Error! Something went wrong" });
			}
			if (productItem) {
				product = productItem;
			} else {
				return res.status(404).json({ error: "Product Not Found" });
			}
		});
		
		user.cart.forEach(cartItem => {
			if (cartItem.id === product.id) {
				cartItem.quantity = updatedQuantity
				user.markModified('cart')
			}
		})

		await user.save();
		return res.status(200).json({ userId: userId, productId: productId, updatedQuantity });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: error.message });
	}
});

// checkout page
router.get("/account/checkout", ensureAuthenticated, (req, res) => {
	res.render("account/checkout", {
		...getCommonMetaData(req, "Checkout")
	});
});

module.exports = router;
