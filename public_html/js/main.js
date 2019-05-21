requirejs.config({
	baseUrl: 'js',
	urlArgs: "v=" + WelcomeVersion.replace(/\./ig, ''),
	paths: {
		jquery: 'libs/jquery-11',
		tooltipster: 'libs/jquery.tooltipster.min',
		underscore: 'libs/underscore',
		backbone: 'libs/backbone',
		handlebars: 'libs/handlebars.min-latest',
		wreqr: 'libs/backbone.wreqr.min',
		cookie: 'libs/jquery.cookie.min',
		'jquery.ui.widget': 'libs/fileupload/js/vendor/jquery.ui.widget',
		'fileupload.jquery.iframe-transport': 'libs/fileupload/js/jquery.iframe-transport',
		fileupload: 'libs/fileupload/js/jquery.fileupload',
		bootstrap:'libs/bootstrap',
		jquerymask: 'libs/jquery.mask',
        inputmask: 'libs/inputmask',
		inputmasks: 'libs/inputmask-multi',
		jqueryautosize: 'libs/jquery.autosize',
        jqueryformstyler: 'libs/formstyler/jquery.formstyler.min',
        moment: 'libs/moment-range.min'
	},
	shim: {
		handlebars: {
			exports: 'Handlebars',
			init: function() {
				this.Handlebars = Handlebars;
				return this.Handlebars;
			}
		},
		backbone: {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
		},
		wreqr: ["backbone"],
		cookie: ['jquery'],
        autosize: {
            deps: ["jquery"]
        }
	}
});

requirejs(["app"], function(App) {
	window.App = App;
	App.initialize();
});
