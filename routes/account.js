const express = require('express')
const router = express.Router();

const { getCommonMetaData, getPriceDetails } = require("./utils");
const User = require("../models/User");
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");
const Order = require("../models/Orders");
const Product = require("../models/Product");

//* ======= PRIVATE ROUTES BELOW! ======= //
//===============
// Account Page
//===============
router.get("/", ensureAuthenticated, (req, res) => {
	res.render("account/userAccount", {
		...getCommonMetaData(req, "Account")
	});
});

//===============
// cart page
//===============
router.get("/cart", ensureAuthenticated, async (req, res) => {
	let cartItems = [], priceDetails;
	await User.findById(req.user.id, (error, user) => {
		if (error) {
			return res.render('500', {
				title: 'Something went wrong! Try again later.'
			})
		}
		if (user) {
			cartItems = [...user.cart];
			priceDetails = getPriceDetails(cartItems);

			return res.render("account/cart", {
				...getCommonMetaData(req, "Showing all products in your cart"),
				cartItems,
				userId: req.user.id,
				priceDetails
			});
		}
	});
});

// adds new product to cart
router.post("/cart/:id/add", ensureAuthenticated, async (req, res) => {
	const productId = req.params.id;

	User.findById(req.user.id, async (error, user) => {
		if (user) {
			let cartItem = user.cart.find(item => item.id === productId);

			if (cartItem) {
				user.cart = user.cart.map(itemInCart => {
					if (itemInCart.id === productId) {
						itemInCart.quantity < 5? itemInCart.quantity++ : itemInCart.quantity;
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
								price: product.price + ((product.tax/100) * product.price),
								quantity: 1,
								category: product.category
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
router.patch("/cart/update", async (req, res) => {
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

// route to delete specific item in cart
router.delete("/cart/delete", async (req, res) => {
	const { productId, userId } = req.body;


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
		
		user.cart = user.cart.filter(item => {
			if (item.id !== productId) {
				return true;
			} else {
				user.markModified('cart');
				return false;
			}
		});

		await user.save();
		return res.status(200).json({ userId: userId, productId: productId });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: error.message });
	}

});

//===============
// checkout page
//===============

// view checkout page 
router.get("/checkout", ensureAuthenticated, (req, res) => {
	const userCart = req.user.cart;
	const priceDetails = getPriceDetails(userCart);

	res.render("account/checkout", {
		...getCommonMetaData(req, "Checkout"),
		priceDetails
	});
});

router.post('/checkout', ensureAuthenticated, async(req, res) => {
	const {
		fullName: userFullName,
		phoneNumber: userPhoneNumber,
		email: userEmail,
		deliveryAddress,
		city: userCity,
		pincode: userPincode
	} = req.body;

	let user, order;

	await User.findById(req.user.id, (err, item) => {
		if (err) {
			return res.render('500')
		}
		user = item;
	})
	const userCart = user.cart;

	for (const cartItem of userCart) {
		order = new Order({
			productId: cartItem.id,
			productName: cartItem.name,
			productCategory: cartItem.category,
			price: cartItem.price,
			quantity: cartItem.quantity,
			userId: user.id,
			userFullName,
			userEmail,
			userPhoneNumber,
			deliveryAddress,
			userCity,
			userPincode
		})
		try {
			await order.save();

			user.orders.push(order);
			user.markModified('orders');
			
			user.cart = [];
			user.markModified('cart');

			await user.save();

			return res.render('account/successfulCheckout', {
				...getCommonMetaData(req, 'Order Placed Successfully!')
			})
			
		} catch (error) {
			console.log(error)
			return res.redirect('500')
		}
	}
})

module.exports = router;