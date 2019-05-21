define(['jquery', 'underscore', 'backbone', '../templates/compile/common', 'services/auth'], function ($, _, Backbone, JST, Auth) {

    return  Backbone.View.extend({
        id: 'loader',
        className: 'loading-over 3',
        events: {
            'click a': function (e) {
                e.preventDefault();
            },
        },
        initialize: function (options) {
            this.childViews = [];
            this.template = JST['common-loading'];
            this.message = options.message;
            this.isFile = options.isFile;
        },
        processData: function () {
            var data = {};
            data.message = this.message;
            data.isFile =  this.isFile;
            return data;
        },
        render: function () {
            this.$el.html(this.template(this.processData()));
            return this;
        }
    });
});




