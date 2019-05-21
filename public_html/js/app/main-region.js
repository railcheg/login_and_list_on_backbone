define(['jquery', 'underscore', 'backbone', 'layouts/main/main'], function ($, _, Backbone, MainLayout) {
    return  Backbone.View.extend({
        events: {

        },
        el: '#bb-main-region',
        initialize: function () {
            this.layout = null;
            this.layoutName = null;
            this.childViews = [];
        },
        swapContent: function (view) {
            this.changeView(view);
            if (view.beforeRender) {
                view.beforeRender();
            }
            this.$el.html(this.currentView.render().el);
            if (view.afterRender) {
                view.afterRender();
            }
        },
        changeView: function (view) {
            this.clearContent();
            this.currentView = view;
        },
        clearContent: function () {
            if (this.currentView) {
                this.currentView.leave();
            }
        },
        setLayout: function (name) {
            switch (name) {
                case 'main':
                    this.swapContent(new MainLayout());
            }
        },
        removeLayout: function () {
            this.clearContent();
            if (this.layout) {
                this.layout.leave();
                this.layout = null;
            }
        }
    });
});




