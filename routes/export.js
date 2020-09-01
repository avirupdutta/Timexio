const express = require("express");
const moment = require("moment");
const decamelize = require("decamelize");
const { exportTypes } = require("../settings");
const { getEarningsOverview } = require("./utils");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Orders");

const router = express.Router();

router.get('/:type', async (req, res) => {

    // export monthly income as excel sheet
    if(exportTypes.monthlyIncome === req.params.type) {
        const months = moment.months();
        const earnings = await getEarningsOverview();
        const data = [];

        months.forEach ((Month, index) => {
            data.push({Month, Earning: earnings[index]})
        })
        return res.xls('data.xlsx', data)
    }

    // export all users data as excel sheet
    else if (exportTypes.users === req.params.type) {
        const users = await User.find({}, (err, data) => {
            if (err) {
                console.log(err)
            }
        });

        const data = users.map(user => {
            const newUserData = {}
            Object.keys(user._doc).map(key => {
                const upperCasedKey = decamelize(key, '_').toUpperCase();
                newUserData[upperCasedKey] = user[key];
            })
            return newUserData;
        });
        return res.xls('all_users.xlsx', data)
    }

    // export all products (with given category) data as excel sheet
    else if (exportTypes.products === req.params.type) {
        const products = await Product.find({category: req.query.category}, (err, data) => {
            if (err) {
                console.log(err)
            }
        });
        const data = products.map(product => {
            const newProduct = {}
            Object.keys(product._doc).map(key => {
                const upperCasedKey = decamelize(key, '_').toUpperCase();
                newProduct[upperCasedKey] = product[key];
            })
            return newProduct;
        })
        return res.xls('all_products.xlsx', data);
    }

    // export data of all orders
    else if (exportTypes.orders === req.params.type) {

        const orders = await Order.find({}, (err, data) => {
            if (err) {
                console.log(err)
            }
        });

        const data = orders.map(order => {
            const newOrder = {};
            
            Object.keys(order._doc).map(key => {
                const upperCasedKey = decamelize(key, '_').toUpperCase()
                newOrder[upperCasedKey] = order[key]
            })
            return newOrder;
        });

        return res.xls('all_orders.xlsx', data);
    }

    // for invalid request
    return res.status(400).json({error: 'Bad Request'})
});

module.exports = router;
