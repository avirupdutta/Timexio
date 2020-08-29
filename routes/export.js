const express = require("express");
const { exportTypes } = require("../settings");

const router = express.Router();

router.get('/:type', (req, res) => {

    // export monthly income as excel sheet
    if(exportTypes.monthlyIncome === req.params.type) {
        return res.json({data: 'return the data of monthly income'})
    }

    // export all users data as excel sheet
    else if (exportTypes.users === req.params.type) {
        return res.json({data: 'return the data of all users'})
    }

    // for invalid request
    return res.status(400).json({message: 'Bad Request'})
});

module.exports = router;
