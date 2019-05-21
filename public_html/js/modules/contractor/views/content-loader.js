define(['jquery', 'underscore', 'backbone', '../templates/compile/contractor', 'services/auth'], function ($, _, Backbone, JST, Auth) {

    return  Backbone.View.extend({
        className: 'logoLoading__box',
        events: {
            'click a': function (e) {
                e.preventDefault();
            },
        },
        initialize: function (options) {
            this.childViews = [];
            this.template = JST['contractor-content-loader'];
        },
        render: function () {
            this.$el.html(this.template());
            return this;
        }
    });
});




