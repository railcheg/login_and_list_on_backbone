define(['jquery', 'underscore', 'backbone', 'config'], function ($, _, Backbone, config) {

    return  Backbone.Model.extend({
        idAttribute: 'id',
        url: function() {
            return this.instanceUrl;
        },
        initialize: function (options, params) {
            this.instanceUrl =  config.apiUrl + '/api/' + params.contractor_id + '/employees';
        }
    });
});