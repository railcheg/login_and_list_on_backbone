define(['jquery', 'underscore', 'backbone', '../templates/compile/contractor', 'config', '../../../services/helper', '../models/reg-code', '../../common/views/modal-dialog', './contractor-person','../models/add-employee', '../models/edit-employee', 'inputmask'], function($, _, Backbone, JST, config, helper, RegCodesModel, ModalDialogView, contractorPerson, AddEmployeesModel, EditEmoloyeeModel) {
	var HoaManagementAdd = {
		id: 'contractor-person-add',
		events: {
			'click a': function(e) {
				e.preventDefault();
			},
			'click .bb_save': function (e) {
				e.preventDefault();
				var employee_id = this.$('.bb_save').data("id");
				if(!this.requestInProcess && this.validate()) {
					this.requestInProcess = true;
					this.$('.bb_save').addClass('loading');
					this.save(employee_id);
				}
			},
			'keypress .bb_capitalized_letter': function (e) {
				var $el = $(e.currentTarget),
					value = $el.val();
				if(value.length === 1) {
					if(value.charAt(0).match(/[a-zа-я]/)) {
						value = value.charAt(0).toUpperCase() + value.slice(1);
						$el.val(value);
					}
				}

			},
			'click .bb_cancel_person': function (e) {
				//e.preventDefault();
			},
			'focus input': function(e) {
				var $el = this.$(e.currentTarget);
				$el.removeClass('error').next('.error_hint').remove();
			},
			'blur [name=last_name]': function(e) {
				var $el = this.$(e.currentTarget);
				$el.removeClass('error').next('.error_hint').remove();
				if($el.val().length == 0) {
					this.addError('last_name', 'Обязательное поле');
				}
			},
			'blur [name=first_name]': function(e) {
				var $el = this.$(e.currentTarget);
				$el.removeClass('error').next('.error_hint').remove();
				if($el.val().length == 0) {
					this.addError('first_name', 'Обязательное поле');
				}
			},
            'blur [name=phone]': function(e) {
                var $el = this.$(e.currentTarget);
                var phone = $el.val();
                if(phone && phone.length) {
                    var numbers = phone.match(/\d/g);
                    numbers = numbers.join("");
                    if(numbers && numbers.length) {
                        if(!this.rePhone.test(numbers)) {
                            this.addError('phone', 'Некорретный номер телефона');
                        }
                    }
                }


            },
			'blur [name=position]': function(e) {
				var $el = this.$(e.currentTarget);
				$el.removeClass('error').next('.error_hint').remove();
				if($el.val().length == 0) {
					this.addError('position', 'Обязательное поле');
				}
			},
			'blur [name=email]': function(e) {
				var $el = this.$(e.currentTarget);
				$el.removeClass('error').next('.error_hint').remove();
				if($el.val().length) {
					if(!this.reEmail.test(this.$('[name="email"]').val())) {
						this.addError('email', 'Неккоректный email');
					}
				}
			},
            'focus .bb_owner_info' : function(e) {
                var $el = $(e.currentTarget);
            
            },
			'focus .customField' : function(e) {
				var $el = $(e.currentTarget);
				e.preventDefault();
				this.setFocusCustomField($el);
			},
			'blur .customField' : function(e) {
				var $el = $(e.currentTarget);
				e.preventDefault();
				this.loseFocusCustomField($el);
			},
            'show.bs.modal' :function (e) {
                var self = this;
                var maskOpts = helper.createMaskOptions();
                this.$('.bb_mobile_phone_person').inputmasks(maskOpts);
                setTimeout(function () {
                    self.$('.bb_last_name').trigger('focus');
                }, 300);
                this.removeErrors();
            },
			'hidden.bs.modal' :function (e) {
				this.$('input').val('');
			},
			'click .bb_send_code': function(e) {
				e.preventDefault();
				var self = this;
				var promises = [],
					promise = null,
					model = new RegCodesModel();

				var user_id = this.$('.bb_send_code').data("id"),
					email = this.$('[name=email]').val(),
					phone = this.$('[name=phone]').val();

				if(email.length) {
					model.setSendEmailOwnerUrl({id: user_id});
					promise = model.fetch({
						method: 'GET',
						success: function (model, resp) {},
						error: function (model, resp) {}
					});
					promises.push(promise);
				}

				if(phone.length) {
					model.setSendSmsOwnerUrl({id: user_id});
					promise = model.fetch({
						method: 'GET',
						success: function (model, resp) {},
						error: function (model, resp) {}
					});
					promises.push(promise);
				}

				$.when.apply($, promises).done(function () {
					var modalDialog = new ModalDialogView({firstMessage: 'Код успешно выслан'});
					$('body').append(modalDialog.render().el);
					$('#modal__loaded').modal('show');
					self.$('.bb_send_code').addClass('none');
				}).fail(function () {
				});

			},
		},
		hoa_id: null,
		options: {},
		initialize: function(options) {
			//OwnersAdd = this;
			this.childViews = [];
			this.template = JST['contractor-person-add'];
			this.channel = options.channel;
			this.contractor_id = options.contractor_id;
			this.reEmail = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
            this.rePhone = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;


		},
		save: function(employee_id) {
			var self = this;
			var model;
            if(!employee_id) {
                model = new AddEmployeesModel(null, {contractor_id: this.contractor_id});
            }
            else {
                model = new EditEmoloyeeModel(null, {employee_id: employee_id, contractor_id: this.contractor_id});
            }
            var data = {},
				fields = [
					'last_name',
					'first_name',
					'middle_name',
					'position',
					'email',
					'phone'
				];
			var value = '';
			_.forEach(fields, function(field) {
				value = this.$('[name="' + field + '"]').val();
				if(this.$('[name="' + field + '"]').hasClass('bb_capitalized_letter')) {
					value = value.charAt(0).toUpperCase() + value.slice(1);
				}
				data[field] = value;
			}, this);
			if(!employee_id) {
				model.save(data, {
					wait: true,
					method: 'POST',
					success: function(model) {
						self.requestInProcess = false;
						self.$('.bb_save').removeClass('loading');
						var contractor = new contractorPerson({model: model, channel: self.channel});
                        $('.bb_employees').append(contractor.render().el);
						$("#addContractorPerson").modal('hide');
                        self.collection.add(model);
						//	self.$('.bb_cancel_person').trigger('click');
					},
					error: function(model, resp) {
						self.removeErrors();
						self.$('.bb_save').removeClass('loading');
						console.log(resp);
						if(resp && resp['responseJSON']) {
							var keysNames = _.keys(resp['responseJSON']);
							_.forEach(keysNames, function(keyName) {
								this.$('[name="' + keyName + '"]').addClass('error').after('<div class="error_hint error_hint-absolute2">' + resp['responseJSON'][keyName][0] + '</div>');
							}, this);
						}
						console.log('func add errs');
						self.requestInProcess = false;
					}
				});
			}
			else {
				model.save(data, {
					wait: true,
					method: 'PATCH',
					success: function(model) {
						self.requestInProcess = false;
						self.$('.bb_save').removeClass('loading');
						$("#addContractorPerson").modal('hide');
						self.channel.vent.trigger('change:person:info:' + employee_id, model);
						//	self.$('.bb_cancel_person').trigger('click');
					},
					error: function(model, resp) {
						self.removeErrors();
						console.log(resp);
						self.$('.bb_save').removeClass('loading');
						self.requestInProcess = false;
						if(resp && resp['responseJSON']) {
							var keysNames = _.keys(resp['responseJSON']);
							_.forEach(keysNames, function(keyName) {
								this.$('[name="' + keyName + '"]').addClass('error').after('<div class="error_hint error_hint-absolute2">' + resp['responseJSON'][keyName][0] + '</div>');
							}, this);
						}
						console.log('func add errs');
						self.requestInProcess = false;
					}
				});
			}

		},
		render: function() {
			this.$el.html(this.template(this.processData()));
			return this;
		},
		processData: function() {
			var data = {};
			return data;
		},

		addError: function(inputName, error) {
			var $el = this.$('input[name=' + inputName + ']');
			$el.next('.error_hint').remove().end().addClass('error').after('<div class="error_hint error_hint-absolute2">' + error + '</div>');
		},

		validate: function() {
			var self = this;
			var isvalidate = true;

			var requiredFields = [
				'last_name',
				'first_name',
				'position'
			];


			requiredFields.forEach(function(key) {
				var $el = self.$('[name='+key+']');
				if(!$el.val().length) {
					self.addError(key, 'Обязательное поле');
					isvalidate = false;
				}
			});


			if(this.$('[name="email"]').val().length) {
				if(!this.reEmail.test(this.$('[name="email"]').val())) {
					this.addError('email', 'Неккоректный email');
					isvalidate = false;
				}
			}

            var phone = this.$('[name="phone"]').val();
            if(phone && phone.length) {
                var numbers = phone.match(/\d/g);
                numbers = numbers.join("");
                if(numbers && numbers.length) {
                    if(!this.rePhone.test(numbers)) {
                        this.addError('phone', 'Некорретный номер телефона');
                        isvalidate = false;
                    }
                }
            }



			return isvalidate;
		},

		removeErrors: function() {
			var self = this;
			var removeErrorFields = [
				'last_name',
				'first_name',
				'middle_name',
				'position',
				'email',
				'phone'
			];
			removeErrorFields.forEach(function(key) {
				var $el = self.$('[name='+key+']');
                $el.removeClass('error').next('.error_hint').remove();
			});
		},
		setActive: function() {
			this.$('.main__line').removeClass('active');
			$(this).addClass('active');
		},

		setFocusCustomField: function($el) {
			$el.closest('.customField__wrap').addClass('focused');
		},

		loseFocusCustomField: function($el) {
			if(!$.trim($el.val())) {
				$el.closest('.customField__wrap').removeClass('focused').removeClass('filled');
			} else {
				$el.closest('.customField__wrap').removeClass('focused').addClass('filled');
			}
		}
	};
	return Backbone.View.extend(HoaManagementAdd);
});
