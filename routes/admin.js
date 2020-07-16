const express = require("express");
const bcryptjs = require("bcryptjs");

const {
	getAdminMetaData,
	getFieldNames,
	setProductsRoutes
} = require("./utils");
const router = express.Router();
const {
	ensureAuthenticated,
	ensureAdminAuthorized
} = require("../config/auth");
const User = require("../models/User");
const Product = require("../models/Product");
const productCategories = require("../models/productCategories");
const Order = require("../models/Orders");

// ** Working GET Route for admin dashboard **
router.get("/", ensureAuthenticated, ensureAdminAuthorized, (req, res) => {
	res.render("admin/index", {
		...getAdminMetaData(req.user.name)
	});
});

// ** Working GET Route for User **
router.get("/user", ensureAuthenticated, ensureAdminAuthorized, (req, res) => {
	const users = User.find({}, (err, data) => {
		if (err) {
			console.log(err);
		}
		res.render("admin/userData", {
			...getAdminMetaData(req.user.name),

			currentModel: User,
			fields: getFieldNames(User),
			data
		});
	});
});

// ** Working GET Routes for Products **
setProductsRoutes(router, productCategories);

//todo - Setup admin panel for all orders
router.get("/order", ensureAuthenticated, ensureAdminAuthorized, (req, res) => {
	Order.find({}, (err, orders) => {
		if (err) {
			res.render("500");
		}

		return res.render("admin/orderData", {
			...getAdminMetaData(req.user.name),
			currentModel: Order.modelName,
			fields: getFieldNames(Order),
			data: orders
		});
	});
});

// ** Working POST Route for Products **
//* ADDS new produts in the system
router.post(
	"/product/add",
	ensureAuthenticated,
	ensureAdminAuthorized,
	(req, res) => {
		const {
			category,
			name,
			price,
			quantity,
			tax,
			primaryImage,
			productImage1,
			productImage2,
			productImage3,
			specs
		} = req.body;

		const newProduct = new Product({
			category,
			name,
			price,
			quantity,
			tax,
			images: [primaryImage, productImage1, productImage2, productImage3],
			specs
		});

		if (category === "none") {
			req.flash(
				"error_msg",
				"Error adding new product due to invalid input!"
			);
			res.redirect(`back`);
		} else {
			newProduct
				.save()
				.then(product => {
					req.flash(
						"success_msg",
						`New ${product.category} has been added!`
					);
					res.redirect("back");
				})
				.catch(err => {
					console.log(err);
					req.flash("error_msg", "Internal error occured :(");
					res.redirect(`back`);
				});
		}
	}
);

// ** Working GET Route for a specific Product detail **
//* Display single product
router.get(
	"/product/:id/details",
	ensureAuthenticated,
	ensureAdminAuthorized,
	(req, res) => {
		// get the id from req params
		const id = req.params.id;

		// check if the product with that id exists
		Product.findById(id, (error, product) => {
			if (error) {
				res.render("500");
			}
			// if item is found
			if (product) {
				return res.render("admin/productDetails", {
					...getAdminMetaData(req.user.name),
					productCategories,
					product
				});
			}
			return res.render("404");
		});
	}
);

// ** Working GET Route for a specific User detail **
//* Display single User
router.get(
	"/user/:id/details",
	ensureAuthenticated,
	ensureAdminAuthorized,
	(req, res) => {
		// get the id from req params
		const id = req.params.id;

		// check if the product with that id exists
		User.findById(id, (error, user) => {
			if (error) {
				return res.render("500");
			}
			// if item is found
			if (user) {
				// const { id, name, email, password, date, admin } = item;

				return res.render("admin/userDetails", {
					...getAdminMetaData(req.user.name),
					user
				});
			}
			return res.render("404");
		});
	}
);

//*  Working POST Route to update a specific Product
router.post(
	"/product/:id/edit",
	ensureAuthenticated,
	ensureAdminAuthorized,
	(req, res) => {
		// get the id from req params
		const id = req.params.id;

		// check if the product with that id exists
		Product.findById(id, (error, item) => {
			// if not send 404
			if (error) {
				req.flash("error_msg", "Product not found for update");
				return res.redirect("back");
			}

			// if item is found
			else if (item) {
				const {
					category,
					name,
					price,
					quantity,
					tax,
					primaryImage,
					productImage1,
					productImage2,
					productImage3,
					specs
				} = req.body;

				const images = [
					primaryImage,
					productImage1,
					productImage2,
					productImage3
				];

				// validate the params
				// ! skipped
				// if invalid send 400 (bad request)
				// ! skipped

				// else perform update
				item.category = category;
				item.name = name;
				item.price = price;
				item.tax = tax;
				item.specs = specs;
				item.images = images;
				item.quantity = quantity;

				item.save()
					.then(item => {
						req.flash(
							"success_msg",
							"Product updated successfully!"
						);
						return res.redirect("back");
					})
					.catch(err => {
						req.flash(
							"error_msg",
							"Internal error occured. Try again later!"
						);
						return res.redirect("back");
					});
			} else {
				req.flash("error_msg", "Product not found for update");
				return res.redirect("back");
			}
		});
	}
);

//*  Working POST Route to update a specific User
router.post(
	"/user/:id/edit",
	ensureAuthenticated,
	ensureAdminAuthorized,
	(req, res) => {
		// get the id from req params
		const id = req.params.id;

		// check if the product with that id exists
		User.findById(id, (error, item) => {
			// if not send 404
			if (error) {
				req.flash("error_msg", "User not found for update");
				return res.redirect("back");
			}

			// if item is found
			else if (item) {
				const { name, email, password, admin } = req.body;

				// validate the params
				// ! skipped
				// if invalid send 400 (bad request)
				// ! skipped

				// else perform update
				item.name = name;
				item.email = email;
				item.admin = admin == "true" ? true : false;

				// hash the password
				bcryptjs.genSalt(10, (err, salt) => {
					bcryptjs.hash(password, salt, (err, hashedPassword) => {
						if (err) {
							req.flash("error_msg", "Something went wrong!");
							return res.redirect("back");
						}
						item.password = hashedPassword;
					});
				});

				item.save()
					.then(item => {
						req.flash(
							"success_msg",
							"User info updated successfully!"
						);
						return res.redirect("back");
					})
					.catch(err => {
						req.flash(
							"error_msg",
							"Internal error occured. Try again later!"
						);
						return res.redirect("back");
					});
			} else {
				req.flash("error_msg", "User not found for update");
				return res.redirect("back");
			}
		});
	}
);

//*  Working POST Route to delete a specific Product
router.delete("/product/:id/delete", (req, res) => {
	// get the id from req params
	const id = req.params.id;

	// check if the product with that id exists
	Product.findByIdAndDelete(id, (error, responseDoc) => {
		// if not send 404
		if (error) {
			return res.status(400).json({ status: 400, error: "Bad Request" });
		}

		// if item is found
		else if (responseDoc) {
			return res.status(200).json(responseDoc);
		} else {
			return res
				.status(404)
				.json({ status: 404, error: "Product Not Found" });
		}
	});
});

//*  Working POST Route to delete a specific User
router.delete("/user/:id/delete", (req, res) => {
	// get the id from req params
	const id = req.params.id;

	// check if the product with that id exists
	User.findByIdAndDelete(id, (error, responseDoc) => {
		// if not send 404
		if (error) {
			return res.status(400).json({ status: 400, error: "Bad Request" });
		}

		// if item is found
		else if (responseDoc) {
			return res.status(200).json(responseDoc);
		} else {
			return res
				.status(404)
				.json({ status: 404, error: "User Not Found" });
		}
	});
});

module.exports = router;
