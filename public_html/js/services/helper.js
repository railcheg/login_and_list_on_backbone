define([], function() {
	var helper = {
		addError: function(inputName, error, notDisable) {
			var $el = $('input[name=' + inputName + ']');
			$el.next('.error_hint').remove().end().addClass('error').after('<div class="error_hint">' + error + '</div>');
			if(!notDisable) {
				this._checkNeedDisabledBtn($el);
			}
		},
		removeError: function(inputName) {
			var $el = $('input[name=' + inputName + ']');
			$el.removeClass('error').next('.error_hint').remove();
			this._checkNeedDisabledBtn($el);
		},
		_checkNeedDisabledBtn: function($el) {
			if($el.parents('.tab-pane ').find('input.error').length) {
				$el.parents('.tab-pane').find('.blue-btn').attr('disabled', 'disabled');
			} else {
				$el.parents('.tab-pane').find('.blue-btn').removeAttr('disabled', 'disabled');
			}
		},		
		randomWords: function() {
			return wordList[Math.floor(Math.random() * wordList.length)]+Math.floor(Math.random() * 99);
		},
		generatePassword: function () {
			var length = 8,
				charset = "abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
				retVal = "";
			for (var i = 0, n = charset.length; i < length; ++i) {
				retVal += charset.charAt(Math.floor(Math.random() * n));
			}
			return retVal;
		},
		createMaskOptions: function () {
			var maskList = $.masksSort(MasksArray, ['#'], /[0-9]|#/, "mask");
			var maskOpts = {
				inputmask: {
					definitions: {
						'#': {
							validator: "[0-9]",
							cardinality: 1
						}
					},
					showMaskOnFocus: false,
					showMaskOnHover: false,
					placeholder: '',
					autoUnmask: false
				},
				match: /[0-9]/,
				replace: '#',
				list: maskList,
				listKey: "mask",
				onMaskChange: function(maskObj, completed) {
					if (completed) {
					} else {}
				}
			};
			return maskOpts;

		},

        renderInputMaskFloat: function ($el) {
            $el.inputmask('Regex', {
                regex: "^[0-9]+([\.][0-9]+)?",
                onKeyValidation: (function (key, result) {

                }).bind(this)
            });

        },

        renderInputMaskInteger: function ($el) {
            $el.inputmask({
                mask: "9{*}",
                placeholder:"",
                onKeyValidation: (function (key, result) {

                }).bind(this)
            });

        }
	};
	return helper;
});
