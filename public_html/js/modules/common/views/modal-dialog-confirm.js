define(['jquery', 'underscore', 'backbone', '../templates/compile/common', 'services/auth'], function ($, _, Backbone, JST, Auth) {

    return  Backbone.View.extend({
        id: 'confirm',
        events: {
            'click a': function (e) {
                e.preventDefault();
            },
            'click .bb_ok_button' : function(e) {
                e.preventDefault();
                this.$el.modal('hide');
                this.needTriggerevent = true;

              //  this.$el.remove();
            },
            'click .bb_cancel_button': function (e) {
                e.preventDefault();
                this.$el.modal('hide');
            },
            'hidden.bs.modal' :function (e) {
                this.$el.remove();
                if(this.needTriggerevent) {
                    this.channel.vent.trigger(this.channelEvent);
                }
            }
        },
        initialize: function (options) {
            this.childViews = [];
            this.template = JST['common-modal-dialog-confirm'];
            this.firstMessage = options.firstMessage;
            this.channel = options.channel;
            this.channelEvent = options.channelEvent;

        },
        processData: function () {
            var data = {};
            data.firstMessage = this.firstMessage;
            return data;
        },
        render: function () {
            this.$el.html(this.template(this.processData()));
            return this;
        }
    });
});




