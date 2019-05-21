define(['jquery', 'underscore', 'backbone', '../templates/compile/common', 'services/auth'], function ($, _, Backbone, JST, Auth) {

    return  Backbone.View.extend({
        className: 'logoLoading__box',
        events: {
            'click a': function (e) {
                e.preventDefault();
            },
        },
        initialize: function (options) {
            this.childViews = [];
            this.template = JST['common-content-loader'];
        },
        processData: function () {
            var data = {};

            return data;
        },
        render: function () {
            this.$el.html(this.template());
            return this;
        }
    });
});




