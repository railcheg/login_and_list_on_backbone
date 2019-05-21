define(['jquery', 'underscore', 'backbone', 'config'], function ($, _, Backbone, config) {

    return  Backbone.Model.extend({
        idAttribute: 'id',
        url: function() {
            return this.instanceUrl;
        },
        initialize: function () {
            this.instanceUrl =  config.apiUrl + '/api/contractors/' + this.id;
        }
    });
});