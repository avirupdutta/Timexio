module.exports = {
	ensureAuthenticated: function(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		}
		req.flash("error_msg", "Please log in to view that resource");
		res.redirect("/users/login");
	},
	forwardAuthenticated: function(req, res, next) {
		if (!req.isAuthenticated()) {
			return next();
		}
		return res.redirect("back");
	},
	ensureAdminAuthorized: function(req, res, next) {
		if (req.user.admin) {
			return next();
		}
		res.redirect("/unauthorized");
	}
};
