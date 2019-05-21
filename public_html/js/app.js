define(['jquery', 'underscore', 'backbone', 'routes/route', 'app/main-region', 'services/auth', 'libs/backbone.helpers'], function($, _, Backbone, Route, MainRegion, Auth) {

	$.ajaxSetup({
		beforeSend: function(xhr, data) {
            xhr.setRequestHeader('X-Local-time', getLocalTime());
		},
		crossDomain: true,
		xhrFields: {
			withCredentials: true
		}
	});

	Backbone.View.prototype.leave = function() {
		this.remove();
		this.off();
		if(this.childViews) {
			this.childViews.forEach(function(view) {
				view.leave();
			});
		}
	};

	Backbone.View.prototype.leaveChildViews = function() {
		if(this.childViews) {
			this.childViews.forEach(function(view) {
				view.leave(); // with leave prototype function
			});
			this.childViews = [];
		}
	};

	//var self = this;

	var goToLogin = function() {
		navigate('#login', {trigger: true});
	};
    var getLocalTime = function () {
        var date = new Date();
        var localTime;
        localTime =
            date.getFullYear() + "-" +
            ("00" + (date.getMonth() + 1)).slice(-2) + "-" +
            ("00" + date.getDate()).slice(-2) + " " +
            ("00" + date.getHours()).slice(-2) + ":" +
            ("00" + date.getMinutes()).slice(-2) + ":" +
            ("00" + date.getSeconds()).slice(-2);
        return localTime;
    };
	var initialize = function() {
		Auth.checkLoggedIn().always(function() {
			start();
		});

	};

	var start = function() {
		var route = new Route();
		Backbone.history.start({pushState: true});
		//var r = new BooksRouter('login');
		//r.navigate('test', {trigger: true});
	};

	var config = function() {
		return {};
	};

	var navigate = function() {
		Backbone.history.navigate.apply(Backbone.history, arguments);
	};

	var mainRegion = new MainRegion();

	return {
		initialize: initialize,
		Config: config(),
		isOwnersUpload: false,
		route: 1,
		navigate: navigate,
		mainRegion: mainRegion,
		apiDomain: 'http://app.loc',
		currentRouteName: null,
		goToLogin: goToLogin
	};
});