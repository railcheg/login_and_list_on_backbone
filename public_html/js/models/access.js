define(['jquery', 'underscore', 'backbone', 'config'], function($, _, Backbone, config) {

	return Backbone.Model.extend({
		idAttribute: 'id',
		url: function() {
			return config.apiUrl + '/api/user/access';
		},
		initialize: function() {}
	});
});




