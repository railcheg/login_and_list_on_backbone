define(['jquery', 'underscore', 'backbone', 'wreqr', '../templates/compile/registry', 'jqueryautosize', 'inputmask', 'moment'], function($, _, Backbone, Wreqr, JST, autosize, inputmask, moment) {
	var RegistryBuildingOwnerView = {
		className: 'ownersNew__line index__item bb_person',
		events: {
            'click .bb_delete_line': function(e) {
                e.preventDefault();
                this.leave();
                this.channel.vent.trigger('remove:user:' + this.house_id);
                this.collection.remove(this.model);
            },
            'focus [name=ownership_document_issue_date]': function(e) {
                var $el = $(e.currentTarget);
                this.initIssueDate($el);
            },
            'change [name=is_juristic_person]': function (e) {
                var $el = $(e.currentTarget);
                var value = $el.val();
                if(value === 'juristic_person') {
                    this.renderLegalFormsDropdownValues();
                    this.$('[name=juristic_person_legal_form]').removeClass('none');

                }
                else {
                    this.$('[name=juristic_person_legal_form]').addClass('none');
                }
            }
		},
        renderLegalFormsDropdownValues: function () {
            if(this.legalFormValues && !this.model.get('juristic_person_legal_form')) {
                this.$('[name=juristic_person_legal_form]').empty();
                this.$('[name=juristic_person_legal_form]').append(this.templateOwnerLegalForm({legalFormValues: this.legalFormValues}));ss
            }
        },
		initialize: function(options) {
			this.childViews = [];
			this.template = JST['registry-registry-building-owner'];
			this.templateOwnerLegalForm = JST['registry-registry-building-owner-legal-forms']
			this.channel = options.channel;
			this.houses_type = options.houses_type;
			this.structure_type = options.structure_type;
			this.isEdit = options.isEdit;
			this.house_id = options.house_id;
			this.legalFormValues = options.legalFormValues;
            if(!this.isEdit) {
                this.listenTo(this.channel.vent, 'remove:current:user:' + this.model.get('id'), function () {
                    this.channel.vent.trigger('after:change:user:information');
                    this.channel.vent.trigger('validate:current:house:owners:count:' + this.house_id);
                    this.collection.remove(this.model);
                    this.leave();
                    this.channel.vent.trigger('disable:history');
                });


                this.listenTo(this.channel.vent, 'remove:current:user:' + this.model.get('old_id'), function () {
                    this.channel.vent.trigger('after:change:user:information');
                    this.channel.vent.trigger('validate:current:house:owners:count:' + this.house_id);
                    this.collection.remove(this.model);
                    this.leave();
                });


                this.listenTo(this.channel.vent, 'change:current:user:' + this.model.get('id'), function (newModel) {
                    this.model.set(newModel.toJSON());
                    this.render();
                    this.afterRender();
                });
            }
            if(this.model.get('is_empty_apartment')) {
                this.listenTo(this.channel.vent, 'remove:current:apartment:' + this.model.get('apartment_id'), function () {
                    this.channel.vent.trigger('after:change:user:information');
                    this.channel.vent.trigger('validate:current:house:owners:count:' + this.house_id);
                    this.collection.remove(this.model);
                    this.leave();
                });
            }
        },
        floatToFixed: function (percent) {
            var ownership_percent =  parseFloat(percent).toFixed(2);
            ownership_percent = parseFloat(ownership_percent);
            return ownership_percent;
        },
		processData: function() {
			var data = this.model.toJSON();
			data.houses_type = this.houses_type;
            data.structure_type = this.structure_type;
            data.isEdit = this.isEdit || data.is_empty_apartment;
            if(this.houses_type === 'town') {
                if(data.owned_area && data.total_area) {
                    var ownership_percent = data.owned_area / data.total_area;
                    data.ownership_percent = this.floatToFixed(ownership_percent);

                }
            }
            data.legalFormValues = this.legalFormValues;
            if(data.is_empty_apartment) {
                data.is_hoa_member = true;
            }
			return data;
		},
		render: function() {
			this.$el.html(this.template(this.processData()));
			return this;
		},
		afterRender: function() {
            if(this.isEdit) {
                this.$el.addClass('bb_edit_owner');
                this.$el.addClass('ownersNew__line-highlight');
                if(this.model.get('isLastAdded')) {
                    this.$el.addClass('bb_last_added');
                }
            }
            else {
                this.$el.data('id', this.model.get('old_id')).attr('data-id', this.model.get('old_id')).data('apartment-id', this.model.get('apartment_id')).attr('data-apartment-id', this.model.get('apartment_id')).data('current-id', this.model.get('id')).attr('data-current-id', this.model.get('id')).data('empty-apartment', this.model.get('is_empty_apartment')).attr('data-empty-apartment', this.model.get('is_empty_apartment'));
                this.$el.removeClass('ownersNew__line-highlight');
                if(this.houses_type === 'village') {
                    this.$el.data('building_id', this.model.get('building_id')).attr('data-building-id', this.model.get('building_id'));
                }
            }
            if(this.houses_type === 'town') {
                this.setTotalAreaDataProp();
            }

            this.initAutoSize(this.$('.autosized'));
        },
        setTotalAreaDataProp: function () {
            //set attribute data-flat-number for current owner. it's need for dinamic change total area in all same flats
            var flatNumber = '';
            if(this.model.get('apartment')) {
                if(this.model.get('property_usage_type') && this.model.get('property_usage_type') === 'nonliving') {
                    flatNumber = 'nonliving';
                }
                else {
                    flatNumber = 'living';
                }
                flatNumber = flatNumber + this.model.get('apartment');
            }
            if(flatNumber) {
                this.$el.data('flat-number', flatNumber).attr('data-flat-number', flatNumber);

            }
        },
        initIssueDate: function ($el) {
            var self = this;
            $el.inputmask("dd/mm/yyyy",{
                postValidation: function (arr) {
                    if ($el.inputmask('unmaskedvalue').length === 8) {
                        var maxDate;
                        if (self.$('[name=ownership_document_issue_date]').val()) {
                            maxDate = moment(self.$('[name=ownership_document_issue_date]s').val(), 'DD/MM/YYYY');
                            if (moment(arr.join(''), 'DD/MM/YYYY') > maxDate) {
                                return false;
                            }
                        } else {
                            if (moment(arr.join(''), 'DD/MM/YYYY') > moment(moment().format('DD/MM/YYYY'))) {
                                return false;
                            }
                        }
                    }
                    return true;
                },
                yearrange: { minyear: 1900, maxyear: moment().year() }, "placeholder": "", showMaskOnHover: false, clearIncomplete: true ,groupmarker: { start: "(", end: ")" }, oncomplete: function () {}});
        },
        initAutoSize: function($el) {
            autosize($el);
        }
	};
	return Backbone.View.extend(RegistryBuildingOwnerView);
});