define(['jquery', 'underscore', 'backbone', '../templates/compile/login', 'services/auth'], function($, _, Backbone, JST, Auth) {
	return Backbone.View.extend({
		className: 'animated fadeInDown',
		events: {
			'click a': function(e) {
				e.preventDefault();
			},
			'click .bb-submit-btn': function(e) {
				if(!this.requestInProcess) {
					this.$('.bb-submit-btn').addClass('loading');
					this.requestInProcess = true;
					this.check();
				}
				e.preventDefault();
			},
			'submit .loginForm': function(e) {
				e.preventDefault();

			}
		},
		initialize: function() {
			this.childViews = [];
			this.template = JST['login-content'];
		},
		render: function() {
			this.$el.html(this.template());
			return this;
		},
		check: function(hoa_code) {
			var username = $.trim(this.$('[name="username"]').val()),
				password = $.trim(this.$('[name="password"]').val());

			this.$('.error_hint').empty();
			this.$('[name="username"], [name="password"]').removeClass('error');

			Auth.login(username, password, hoa_code).done((function(data) {
				var app = require('app');
				app.navigate('#list', {trigger: true});
			}).bind(this)).fail((function(res) {
				if(res.status === 449) {
					var hoa_code = res.responseJSON.hoas[0].code;
					this.check(hoa_code);
				}
				else {
					if(res && res.responseJSON) {
						this.$('[name="username"], [name="password"]').addClass('error');
						this.$('.error_hint').html((res.responseJSON.error) ? res.responseJSON.error : res.responseJSON.message);
					}
				}

			}).bind(this)).always((function() {
				this.$('.bb-submit-btn').removeClass('loading');
				this.requestInProcess = false;
			}).bind(this));

		}
	});
});




