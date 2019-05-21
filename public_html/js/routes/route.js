define(['jquery', 'underscore', 'backbone', 'services/auth'], function($, _, Backbone, Auth) {

	return Backbone.Router.extend({
		routes: {
			"": "main",

			"settings": function() {
				this.main(null, {currentType: 'settings'});
			},
            "registry": function() {
                this.main(null, {currentType: 'registry'});
            },
			"activate": function() {
				this.main(null, {currentType: 'activate'});
			},
            "contractors/:id(/)": function(id) {
                this.contractor(id);
            },
			"login": "login",
			"list": "list",
			"logout": "logout"
		},
		initialize: function() {

		},
		execute: function(callback, args, name) {
			var app = require("app");
			var oldRouteName = app.currentRouteName;
			app.currentRouteName = name;

			if(!Auth.isLoggedIn && name !== 'login') {
				app.goToLogin();
				return false;
			}
			//args.push(parseQueryString(args.pop()));


			if(app.isOwnersUpload) {
				var answer = confirm("Вы действительно хотите покинуть текущую страницу?");
				if(answer && callback) {
					app.isOwnersUpload = false;
					window.onbeforeunload = null;
					callback.apply(this, args);
				}
				else {
					app.currentRouteName = oldRouteName;
				}

			}
			else {
				if(callback) {
					window.onbeforeunload = null;
					callback.apply(this, args);
				}
			}
		},
		main: function(id, params) {
			var app = require("app");
			if(!id) {
				return app.navigate('#list', {trigger: true});
			}
			require(['modules/hoa/views/controller'], function(Controller) {
				if(app.currentRouteName === 'main') {

				}
				var controller = new Controller({hoa_id: id, params: params});
			});
		},
        contractor: function(id) {
            var app = require("app");
            if(Auth.infoModel.toJSON()['is_superuser']) {
                require(['modules/contractor/views/controller'], function(Controller) {
                    var controller = new Controller({id: id});
                });
            }
            else {
                app.navigate('#list', {trigger: true});
            }

        },
		login: function() {
			require(['modules/login/views/controller'], function(Controller) {
				var controller = new Controller({});
			});
		},
		logout: function() {
			Auth.logout();
		}
	});
});