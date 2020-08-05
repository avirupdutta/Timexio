const modelNames = require("../models/index");
const categories = require("../models/productCategories");
const settings = require("../settings");

const {
	ensureAuthenticated,
	ensureAdminAuthorized
} = require("../config/auth");
const Product = require("../models/Product");

const getAdminMetaData = name => {
	return {
		layout: "adminLayout",
		name,
		modelNames
	};
};

const getFieldNames = model => {
	return Object.keys(model.schema.paths).filter(
		fieldName =>
			// fieldName !== "_id" &&
			fieldName !== "__v" &&
			fieldName !== "password" &&
			fieldName !== "category" &&
			fieldName !== "created" &&
			fieldName !== "images" &&
			fieldName !== "specs" &&
			fieldName !== "date" &&
			fieldName !== "productId" &&
			fieldName !== "userId" &&
			fieldName !== "userFullName" &&
			fieldName !== "userCity" &&
			fieldName !== "paymentMethod" &&
			fieldName !== "paymentTimestamp" &&
			fieldName !== "deliveryAddress" &&
			fieldName !== "deliveryDate" &&
			fieldName !== "productCategory" &&
			fieldName !== "userPhoneNumber" &&
			fieldName !== "isNotCancelled" &&
			fieldName !== "userPincode"
	);
};

const setProductsRoutes = (router, categories) => {
	categories.forEach(category => {
		router.get(
			`/${category}`,
			ensureAuthenticated,
			ensureAdminAuthorized,
			(req, res) => {
				Product.find({ category }, (err, data) => {
					if (err) {
						console.log(err);
					}

					res.render("admin/productData", {
						...getAdminMetaData(req.user.name),

						currentModel: category,
						productCategories: categories,
						fields: getFieldNames(Product),
						data
					});
				});
			}
		);
	});
};

const getCommonMetaData = (req, title) => {
	return {
		title,
		name: req.user ? req.user.name : null,
		admin: req.user ? req.user.admin : null,
		isAuthenticated: req.isAuthenticated(),
		categories
	};
};

const getPriceDetails = cart => {
	const priceDetails = {
		shippingPrice: 0
	};
	if (cart.length > 1) {
		priceDetails.items = cart.reduce((acc, current) => parseFloat(acc.quantity) + parseFloat(current.quantity));
		priceDetails.totalAmount = cart.reduce((acc, current) => 
			(parseFloat(acc.quantity) * parseFloat(acc.price)) + (parseFloat(current.quantity)) * parseFloat(current.price));
	} else if(cart.length === 1){
		priceDetails.items = cart[0].quantity;
		priceDetails.totalAmount = cart[0].quantity * cart[0].price
	}
	
	if (priceDetails.totalAmount < settings.minAmtReqForFreeDelivery) {
		priceDetails.shippingPrice = settings.shippingPrice;
	}
	return priceDetails;
}

const getIncome = order => (order.price * order.quantity);

const payNow = order => {
	order.isPaid = true;
	order.markModified('isPaid');

	order.paymentTimestamp = new Date();
	order.markModified('paymentTimestamp');

	return order;
}

const setOrderToCancel = order => {
	order.isNotCancelled = false;
	order.markModified('isNotCancelled');
	return order;
}

module.exports = {
	getAdminMetaData,
	getFieldNames,
	setProductsRoutes,
	getCommonMetaData,
	getPriceDetails,
	getIncome,
	payNow,
	setOrderToCancel
};
