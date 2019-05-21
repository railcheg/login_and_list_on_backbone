define(['jquery', 'underscore', 'backbone', '../templates/compile/common', 'services/auth'], function($, _, Backbone, JST, Auth) {

	return Backbone.View.extend({
		id: 'error-panel',
		className: 'error__panel fadeInUp animated animated-fast',
		events: {
			'click a': function(e) {
				e.preventDefault();
			},
			'click': function(e) {
				e.preventDefault();
				if(!this.errorOwnership) {
					this.$el.remove();
				}

			}
		},
		initialize: function(setting) {
			var self = this;
			this.childViews = [];
			this.template = JST['common-error-panel'];
			if(setting && setting.errorOwnership) {
				this.errorOwnership = setting.errorOwnership;
				this.message = 'Площадь владения превышена на ' + parseFloat(setting.square).toFixed(4);
			} else {
				if(setting && setting.message) {
					this.message = setting.message;
				}
				setTimeout(function() {
					self.$el.remove();
				}, 4000);
			}
		},
		processData: function() {
			var data = {};
			if(this.message) {
				data.message = this.message;
			}
			else {
				data.message = 'Ошибка.';
			}

			return data;
		},
		render: function() {
			this.$el.html(this.template(this.processData()));
			return this;
		}
	});
});




