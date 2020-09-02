const modelNames = require("../models/index");
const settings = require("../settings");

const setAdminCommonData = (req, res, next) => {
	res.commonData = {
		layout: "adminLayout",
		name: req.user.name,
		modelNames,
		exportTypes: settings.exportTypes
    };
    next();
};

module.exports = {
    setAdminCommonData
}