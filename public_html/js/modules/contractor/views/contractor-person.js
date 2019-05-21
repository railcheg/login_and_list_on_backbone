define(['jquery', 'underscore', 'backbone', '../templates/compile/contractor', 'services/auth',  '../../../services/helper', 'config'], function($, _, Backbone, JST, Auth, helper, config) {

	return Backbone.View.extend({
		className: 'main__line bb_edit_person',
		events: {
			'click a': function(e) {
				e.preventDefault();
			},
            'click': function(e) {
                var $el = $(e.target);
                if(!$el.hasClass('bb_reg_code')) {
                    var self = this;
                    var changePerson = $("#addContractorPerson");
					changePerson.find('.bb_modal_code').addClass('none');
					if(this.model.get('registration_code')) {
						changePerson.find('.bb_modal_code').removeClass('none');
						changePerson.find('.bb_code').text(this.model.get('registration_code'));
						if((this.model.get('email') || this.model.get('phone'))) {
							changePerson.find('.bb_send_code').removeClass('none').data("id", this.model.attributes.id);
						}
						else {
							changePerson.find('.bb_send_code').addClass('none');
						}

					}


                    changePerson.modal('show');
                    _.forEach(_.keys(this.model.attributes), function(key) {
                        this.$('#addContractorPerson').find('[name="' + key + '"]').val(self.model.attributes[key]).closest('label').addClass('filled');
                    });
                    $('#addContractorPerson').find('.bb_save').data("id", this.model.attributes.id);
                    changePerson.find('.bb_title_person_add').text('Изменить контактное лицо');
                }
            }

		},
		hoa_id: null,
		initialize: function(options) {
			this.childViews = [];
			this.template = JST['contractor-person'];
            this.channel = options.channel;
            this.listenTo(this.channel.vent, 'change:person:info:' + this.model.attributes.id, function(model) {
                this.model.set(model.attributes);
                this.render();
            }, this);
		},
		processData: function() {
			var data = this.model.toJSON();
			return data;
		},
		render: function() {
			this.$el.html(this.template(this.processData()));
			return this;
		}

	});
});




