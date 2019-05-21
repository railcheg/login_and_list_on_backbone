define(['jquery', 'underscore', 'backbone', 'wreqr', 'app', './content', 'services/auth', '../models/contractor', '../models/employees'], function($, _, Backbone, Wreqr, App, ContentContractor, Auth, ModelContractor, CollectionEmployees) {

	return Backbone.View.extend({
		className: '',
		events: {},
		initialize: function(options) {
			this.params = {};
			this.provider = {};
			this.promises = {};
			this.childViews = [];
			this.channel = Wreqr.radio.channel(_.uniqueId());
            this.channel.reqres.setHandler('get:provider', this.getProvider, this);
			this.channel.reqres.setHandler('get:promises', this.getPromises, this);
			this.channel.reqres.setHandler('get:params', this.getParams, this);
            this.contractor_id  = options['id'];
			this.channel.commands.setHandler('set:params', this.setParams, this);
			this.render();
		},
		processData: function() {
			var data = {};
			return data;
		},
		render: function() {
            this.createPromises();
            $.when(this.promises.mainModel, this.promises.collectionEmployees).done((function() {
                this.renderContent();
            }.bind(this)));

			return this;
		},
        createPromises: function() {
            this.provider.mainModel = new ModelContractor({id: this.contractor_id});
            this.promises.mainModel =  this.provider.mainModel.fetch();
            this.provider.collectionEmployees = new CollectionEmployees({id: this.contractor_id});
            this.promises.collectionEmployees =  this.provider.collectionEmployees.fetch();
        },
		renderContent: function() {
			App.mainRegion.removeLayout();
			this.content = new ContentContractor({model: this.provider.mainModel, collection: this.provider.collectionEmployees, channel: this.channel, contractor_id:this.contractor_id });
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



