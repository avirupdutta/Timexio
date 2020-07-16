const productCategories = require("./productCategories");

const models = ["User", ...productCategories, "Order"];
module.exports = models;
