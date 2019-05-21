define(['jquery', 'underscore', 'backbone', 'models/access', 'config', 'cookie'], function($, _, Backbone, AccessModel, config, cookie) {

	var login = function(username, password, hoa_code) {
		var self = this;
		var accessModel = new AccessModel({username: username, password: password, hoa_code: hoa_code});
		return accessModel.save(null, {
			method: 'POST',
			success: function(model) {
				self.isLoggedIn = true;
				self.infoModel.set(model.toJSON());
			},
			error: function() {
				self.infoModel.clear();
				self.isLoggedIn = false;
			}
		});
	};

	var checkLoggedIn = function() {
		var self = this;
		var accessModel = new AccessModel();
		return accessModel.fetch({
			success: function(model) {
				self.infoModel.set(model.get('data'));
				self.isLoggedIn = true;

			},
			error: function() {

				self.isLoggedIn = false;
			}
		});
	};

	var logout = function() {
		var self = this;
		var accessModel = new AccessModel();
		return accessModel.save(null, {
			method: 'DELETE',
			success: function() {
				self.isLoggedIn = false;
				self.infoModel.clear();
				require('app').goToLogin();
			},
			error: function() {
				console.log('err');
			}
		});
	};

	return {
		infoModel: new AccessModel(),
		isLoggedIn: false,
		checkLoggedIn: checkLoggedIn,
		login: login,
		logout: logout
	}
});