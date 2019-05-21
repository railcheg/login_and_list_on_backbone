define(['jquery', 'underscore', 'backbone', '../templates/compile/common', 'services/auth'], function ($, _, Backbone, JST, Auth) {

    return  Backbone.View.extend({
        id: 'loader',
        events: {
            'click a': function (e) {
                e.preventDefault();
            },
            'click .bb_ok_button' : function(e) {
                e.preventDefault();
                $('#modal__loaded').modal('hide');
              //  this.$el.remove();
            },
            'hidden.bs.modal' :function (e) {
                this.$el.remove();
            }
        },
        initialize: function (options) {
            this.childViews = [];
            this.template = JST['common-modal-dialog'];
            this.firstMessage = options.firstMessage;
            if(options.secondMessage) {
                this.secondMessage = options.secondMessage;
            }
        },
        processData: function () {
            var data = {};
            data.firstMessage = this.firstMessage;
            data.secondMessage = this.secondMessage;
            return data;
        },
        render: function () {
            this.$el.html(this.template(this.processData()));
            return this;
        }
    });
});




