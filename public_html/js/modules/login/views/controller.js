define(['jquery', 'underscore', 'backbone', 'wreqr', 'app', './content'], function($, _, Backbone, Wreqr, App, Content) {

	return Backbone.View.extend({
		className: '',
		events: {},
		initialize: function() {

			this.params = {};

			this.provider = {};

			this.promises = {};

			this.childViews = [];

			this.channel = Wreqr.radio.channel(_.uniqueId());

			this.channel.reqres.setHandler('get:provider', this.getProvider, this);
			this.channel.reqres.setHandler('get:promises', this.getPromises, this);
			this.channel.reqres.setHandler('get:params', this.getParams, this);

			this.channel.commands.setHandler('set:params', this.setParams, this);
			this.render();
		},
		processData: function() {
			var data = {};
			return data;
		},
		render: function() {
			this.renderContent();
			return this;
		},
		renderContent: function() {
			App.mainRegion.removeLayout();
			this.content = new Content({channel: this.channel});
			this.childViews.push(this.content);
			App.mainRegion.swapContent(this.content);
		},

		prevent: function(e) {
			e.preventDefault();
		},
		getProvider: function() {
			return this.provider;
		},
		getPromises: function() {
			return this.promises;
		},
		getParams: function() {
			return this.params;
		},
		setParams: function(params) {
			this.params = params;
		},
		leave: function() {
			this.channel.reset();
			Backbone.View.prototype.leave.call(this);
		}
	});
});



