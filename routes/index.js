const express = require("express");
const router = express.Router();
const settings = require("../settings");
const categories = require("../models/productCategories");
const { getCommonMetaData, client } = require("./utils");
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
		const newArrivalProducts = await Product.find({'quantity': {$gt: 0}}).sort({ created: -1 });
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
			product,
			shippingPrice: settings.shippingPrice,
			minAmtReqForFreeDelivery: settings.minAmtReqForFreeDelivery
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
router.get("/search/:query", (req, res) => {
	const keywords = req.params.query;
	if (keywords.length >= 1) {
		// search engine algo here
		let index = null,
			sortBy = req.query.sortBy || "relevence";

		switch (sortBy) {
			case 'relevence':
				index  = client.initIndex('products');
				break;
			case 'lowToHigh':
				index = client.initIndex('Low to High');
				break;
			case 'highToLow':
				index = client.initIndex('High to Low');
				break;
			case 'popularity':
				index = client.initIndex('Popularity');
				break;
		
			default:
				index  = client.initIndex('products');
				break;
		}
		
		index.search(keywords, {
			attributesToRetrieve:  ['name', 'price', 'images', 'quantity', 'tax', '_id', 'sold'],
		}).then(({ hits }) => {
			hits.forEach(hit => {
				hit.id = hit._id.$oid;
			})
			res.render("searchResults", {
				...getCommonMetaData(
					req,
					`Showing results for ${keywords}`
				),
				categoryName: categories,
				searchKeywords: keywords,
				products: hits,
				sortBy
			});
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

module.exports = router;
