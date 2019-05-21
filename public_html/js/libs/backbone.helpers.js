define(['handlebars'], function(Handlebars) {
	Handlebars.registerHelper('inList', function(needle, haystack, options) {
		if(!haystack) {
			return options.inverse(this);
		}
		if(haystack.indexOf(needle) < 0) {
			return options.inverse(this);
		}
		return options.fn(this);
	});
	Handlebars.registerHelper('isEqual', function(one, two, options) {
		if(one != two) {
			return options.inverse(this);
		}
		return options.fn(this);
	});
	Handlebars.registerHelper('summ', function() {
		var allSumm = 0;
		for (var i = 0; i < arguments.length; i++) {
			allSumm = allSumm + arguments[i];
		}
		allSumm = parseFloat(allSumm).toFixed(4);
		allSumm = parseFloat(allSumm);
		return allSumm;
	});


	Handlebars.registerHelper('inc', function(value, options) {
		return parseInt(value) + 1;
	});
	Handlebars.registerHelper('floatToFixed', function(value, options) {
		var returnValue = parseFloat(value).toFixed(4);
		returnValue = parseFloat(returnValue);
		return returnValue;
	});

	Handlebars.registerHelper('toLowerCase', function(value, options) {
		var returnValue;
		if(value) {
			returnValue = value.toLowerCase();
		}
		return returnValue;
	});

	Handlebars.registerHelper('ifCond', function(v1, v2, v3, options) {
		var status = false;
		if (v3 === '==') {
			if (v1 == v2) {
				status = true;
			}
		}

		if (v3 === '===') {
			if (v1 === v2) {
				status = true;
			}
		}

		if (v3 === '!=') {
			if (v1 != v2) {
				status = true;
			}
		}
		if (v3 === '!==') {
			if (v1 !== v2) {
				status = true;
			}
		}

		if (v3 === '>') {
			if (v1 > v2) {
				status = true;
			}
		}
		if (v3 === '<') {
			if (v1 < v2) {
				status = true;
			}
		}
		if (v3 === '<=') {
			if (v1 <= v2) {
				status = true;
			}
		}
		if (v3 === '>=') {
			if (v1 >= v2) {
				status = true;
			}
		}
		if(status) {
			return options.fn(this);
		}
		return options.inverse(this);
	});
    Handlebars.registerHelper('for', function(counts, options) {
        var ret = "";

        for(var i = 0, j= counts; i < j; i++) {
            ret = ret + options.fn(i + 1);
        }

        return ret;
    });
    Handlebars.registerHelper("summFromArrayByName", function(array, name) {
        var summ = _.reduce(array, function(memo, num){
                return memo + num[name];
            },
            0);
        return summ;
    });


});
