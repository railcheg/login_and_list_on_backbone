define(['jquery', 'underscore', 'backbone', 'config', 'wreqr', '../templates/compile/registry', '../views/registry-building', '../../common/views/loading', '../../../services/helper'], function($, _, Backbone, config, Wreqr, JST, RegistryBuilding, LoadindView, helper) {
	var RegistryView = {
		id: 'registry',
		className: 'tab tab-pane animated fadeIn',
		events: {
            'click .bb_download_template': function (e) {
                e.preventDefault();
                this.downloadTemplate();
            },
            'click .bb_file_upload': function(e) {
                $('.tooltip').remove();
            },
            'focus .bb_number_integer' : function(e) {
                var $el = $(e.currentTarget);
                this.renderInputMaskInteger($el);
            },
            'focus .bb_number_float' : function(e) {
                var $el = $(e.currentTarget);
                this.renderInputMaskFloat($el);
            }
		},
        renderInputMaskInteger: function ($el) {
            var timeOut;
            $el.inputmask({
                mask: "9{*}",
                placeholder:"",
                onKeyValidation: (function (key, result) {

                }).bind(this)
            });
        },
        renderInputMaskFloat: function ($el) {
            $el.inputmask('Regex', {
                regex: "^[0-9]+([\.][0-9]+)?",
                onKeyValidation: (function (key, result) {

                }).bind(this)
            });
        },
        downloadTemplate: function() {

        },
		initialize: function(options) {
		    var self = this;
			this.childViews = [];
			this.template = JST['registry-registry'];
			this.channel = options.channel;
            this.childViewsBuildings = [];
			this.hoaModel = options.hoaModel;
			this.structure_type = this.model.get('structure_type');
            this.houses_type = this.model.get('houses_type');
            this.hoa_id = this.hoaModel.get('id');
            this.listenTo(this.channel.vent, 'change:buildings:information', function () {
                this.model.fetch({
                    method: 'GET',
                    success: function (model, resp) {
                        self.channel.vent.trigger('change:hoa:settings:model', model);
                    },
                    error: function (model, resp) {
                        self.isFetched = false;
                    }
                });
            });
        },
		processData: function() {
			var data = this.model.toJSON();
			return data;
		},
		render: function() {
			this.$el.html(this.template(this.processData()));
			return this;
		},
		afterRender: function() {
		    var self = this;
            this.getLegalFormValues();
        },
        getLegalFormValues: function() {
            //get all values of legal forms and render buildings after fetched it
            var self = this;
            if (!this.legalFormJSON) {
                $.getJSON("js/jsons/legal-forms.json", function (data) {
                    self.legalFormJSON = data;
                    self.getLegalFormValues();
                });
                return;
            }

            var address = this.model.get('address');
            var country;
            if(address) {
                country = address.country;
            }
            var countryShort;
            switch(country) {
                case 'Россия':
                    countryShort = 'ru';
                    break;
                case 'Беларусь':
                    countryShort = 'by';
                    break;
                case 'Казахстан':
                    countryShort = 'kz';
                    break;
                case 'Украина':
                    countryShort = 'ua';
                    break;
                case 'Грузия':
                    countryShort = 'ge';
                    break;
                case 'Молдавия':
                    countryShort = 'md';
                    break;
                default:
                    countryShort= 'ru';
                    break;
            }
            this.legalFormValues = this.legalFormJSON[countryShort.toUpperCase()];
            this.renderBuildings();
        },

        renderBuildings: function() {
            if(this.childViewsBuildings.length) {
                _.each(this.childViewsBuildings, function (child) {
                    child.leave();
                }, this);
            }
            var isOneBuilding = false;
            var isEmptyBuilding = false;
            var buildingModel, view;
            if(this.houses_type === 'town') {
                //in town maybe a lot houses
                if(!this.collection.length) {
                    isOneBuilding = true;
                    isEmptyBuilding  = true;
                    buildingModel = new Backbone.Model();
                    buildingModel.set('owners', this.collection.toJSON());
                    view = new RegistryBuilding({model: buildingModel, channel: this.channel, isOneBuilding: isOneBuilding, legalFormValues: this.legalFormValues, isEmptyBuilding: isEmptyBuilding, structure_type: this.structure_type, houses_type: this.houses_type, hoaSettingsModel: this.model, hoa_id: this.hoa_id});
                    this.$('.bb_buildings').append(view.render().el);
                    this.childViewsBuildings.push(view);
                    view.afterRender();
                }
                else {
                    if(this.collection.length === 1) {
                        isOneBuilding = true;
                    }
                    var fragment = document.createDocumentFragment();
                    _.each(this.collection.models, function (buildingModel, index) {
                            var view = new RegistryBuilding({model: buildingModel, channel: this.channel, index: index + 1, isOneBuilding: isOneBuilding, legalFormValues: this.legalFormValues, structure_type: this.structure_type, houses_type: this.houses_type, hoaSettingsModel: this.model, hoa_id: this.hoa_id});
                            fragment.appendChild(view.render().el);
                            this.childViewsBuildings.push(view);
                            view.afterRender();
                    }, this);
                    this.$('.bb_buildings').append(fragment);
                }
            }
            else {
                //if it village there is only one house
                isOneBuilding = true;
                buildingModel = new Backbone.Model();
                buildingModel.set('owners', this.collection.toJSON());
                view = new RegistryBuilding({model: buildingModel, channel: this.channel, isOneBuilding: isOneBuilding,  legalFormValues: this.legalFormValues, isEmptyBuilding: isEmptyBuilding, index: 1, structure_type: this.structure_type, houses_type: this.houses_type, hoaSettingsModel: this.model, hoa_id: this.hoa_id});
                this.$('.bb_buildings').append(view.render().el);
                this.childViewsBuildings.push(view);
                view.afterRender();
            }
        }
    };
	return Backbone.View.extend(RegistryView);
});