define(['moment'], function(moment) {
	var storage = {
		setItem : function (itemName, value, seconds) {
			var data = {
				value: value,
				expire: (seconds) ? (parseInt(moment().format('X')) + seconds) : 0
			};
			localStorage.setItem(itemName, JSON.stringify(data));
		},

		removeItem : function (itemName) {
			localStorage.removeItem(itemName);
		},

		getItem : function (itemName) {
			var item = localStorage.getItem(itemName),
				data;

			if (item) {
				try {
					data = JSON.parse(item);
					if (data && data.value) {
						if (data.expire) {
							console.log('expire', parseInt(moment().format('X')), data.expire);
							if (parseInt(moment().format('X')) < data.expire) {
								return data.value;
							}
						} else {
							return data.value;
						}
					}
				} catch (e) {

				}
			}
			return null;
		}
	};
	return storage;
});


