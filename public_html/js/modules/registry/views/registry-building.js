define(['jquery', 'underscore', 'backbone', 'config', 'wreqr', '../templates/compile/registry', '../../../services/helper', './registry-building-owner', '../models/owners-collection', '../../common/views/error-panel', '../../common/views/modal-dialog', '../../common/views/loading', 'moment'], function($, _, Backbone, config, Wreqr, JST, helper, RegistryBuildingOwner, OwnersCollection, ErrorPanel, ModalDialogView, LoadindView, moment) {
	var RegistryBuildingView = {
		className: 'bb_building',
		events: {
            'click .bb_save': function (e) {
                e.preventDefault();
                this.save();
            },
            'mouseover .ownersNew__line-error' : function (e) {
                var $el = $(e.currentTarget);
                this.showErrorTooltip($el);
            },
            'mouseleave .ownersNew__line-error' : function (e) {
                var $el = $(e.currentTarget);
                $el.removeClass('hover');
            },
            'keydown .bb_person_last textarea': function() {
                this.renderOwner(new Backbone.Model({is_hoa_member: true, isNew: true}), true);
                this.changeLastPerson();
            },
            'click .bb_upload_file': function () {
                this.$('.bb_file_input').trigger('click');
            },

            'click .bb_open_edit': function (e) {
                e.preventDefault();
                var $el = $(e.currentTarget);
                var id = $el.closest('.bb_person').data().id;
                this.channel.vent.trigger('open:edit:owner:' + id);

            },
            'click .bb_download_registry': function (e) {
                e.preventDefault();
                this.downloadRegistry();
            },
            'keyup [name=total_area]': function(e) {
                var $el = $(e.currentTarget);
                this.tryCopyValueFromThisInput($el, 'total_area');
            },
            'keyup [name=entrance_number]': function(e) {
                var $el = $(e.currentTarget);
                this.tryCopyValueFromThisInput($el, 'entrance_number');
            },
            'keyup [name=floor]': function(e) {
                var $el = $(e.currentTarget);
                this.tryCopyValueFromThisInput($el, 'floor');
            },
            'keyup [name=apartment]': function(e) {
                if(this.houses_type === 'town') {
                    var $el = $(e.currentTarget);
                    this.changeTotalAreaDataProp($el);
                }
            },
            'click .bb_select_link_property_area': function (e) {
                if(this.houses_type === 'town') {
                    var $el = $(e.currentTarget);
                    this.changeTotalAreaDataProp($el);
                }
            }
		},
        changeTotalAreaDataProp: function($el) {
            //change attribute data-flat-number in current line. it's need for dinamic change total area in all same flats
            var $person = $el.closest('.bb_person');
            var $total_area = $person.find('[name=total_area]');
            var apartment = $person.find('[name=apartment]').val();
            if(apartment) {
                var flatNumber = '';
                if(this.getValue($person, 'property_usage_type') === 'living') {
                    flatNumber = 'living';
                }
                else {
                    flatNumber = 'nonliving';
                }
                flatNumber = flatNumber + apartment;
                $total_area.closest('.bb_person').data('flat-number', flatNumber).attr('data-flat-number', flatNumber);
            }
            else {
                $total_area.closest('.bb_person').data('flat-number', null).attr('data-flat-number', null);
            }
        },
        tryCopyValueFromThisInput: function($el, field) {
            //the same value of ownership in all identical flats
            var flatNumber = $el.closest('.bb_person').data().flatNumber;
            if(!flatNumber) {
                return;
            }
            var value = $el.val();
            $el.closest('.bb_person').data('flat-number', null).attr('data-flat-number', null);
            this.$('[data-flat-number=' + flatNumber + ']').find('[name=' + field + ']').val(value);
            $el.closest('.bb_person').data('flat-number', flatNumber).attr('data-flat-number', flatNumber);
        },

        showErrorTooltip: function($el) {
            var activeLine = $el,
                activeTooltip = $el.find('.error__tooltip'),
                newX = activeLine.closest('.ownersNew').offset().left + activeLine.closest('.ownersNew').width(),
                newY = activeLine.offset().top + $el.height();
            $el.addClass('hover');
            activeTooltip.css({
                top: newY - $(window).scrollTop(),
                left: newX - activeTooltip.outerWidth() -50
            });
        },
        findUnitInBuildingVillage: function (elem, buildings) {
            var isInBuilding = false;
            //search string - street house unit property_usage_type apartment
            var searchString = '';
            if(elem.street) {
                searchString = searchString + elem.street.toLowerCase();
            }
            if(elem.house) {
                searchString = searchString + elem.house.toLowerCase();
            }
            if(elem.unit) {
                searchString = searchString + elem.unit.toLowerCase();
            }
            if(elem.property_usage_type) {
                searchString = searchString + 'living';
            }
            else {
                searchString = searchString + 'nonliving';
            }
            if(elem.apartment) {
                searchString = searchString + elem.apartment.toLowerCase();
            }
            if(buildings.indexOf(searchString) !== -1) {
                isInBuilding = true;
            }
            var obj = {};
            obj.isInBuilding = isInBuilding;
            obj.searchString = searchString;
            return obj;
        },
        cleverValidateArrayForVillage: function(array) {
            //validate max living and nonliving in villages
            var isError = false;
            var max_living_buildings_amount = this.hoaSettingsModel.get('living_buildings_amount'),
                max_nonliving_buildings_amount = this.hoaSettingsModel.get('nonliving_buildings_amount');

            var currentBuildings = [];
            var current_living_buildings_amount = 0,
                current_nonliving_buildings_amount = 0;
            _.each(array, function (elem) {
                var searchBuildingObj = this.findUnitInBuildingVillage(elem, currentBuildings);
                if(!searchBuildingObj.isInBuilding) {
                    currentBuildings.push(searchBuildingObj.searchString);

                    if(elem.property_usage_type === 'living') {
                        current_living_buildings_amount++;
                    }
                    else {
                        current_nonliving_buildings_amount++;
                    }
                }
            }, this);

            var isLivingApartmentError = false,
                isNonLivingApartmentError = false;
            if(max_living_buildings_amount && current_living_buildings_amount > max_living_buildings_amount) {
                isLivingApartmentError = true;
            }

            if(max_nonliving_buildings_amount && current_nonliving_buildings_amount > max_nonliving_buildings_amount) {
                isNonLivingApartmentError = true;
            }
            if(isLivingApartmentError || isNonLivingApartmentError) {
                _.each(array, function (elem) {
                    if(elem.property_usage_type === 'living') {
                        if(isLivingApartmentError) {
                            isError = true;
                            if(!max_living_buildings_amount) {
                                max_living_buildings_amount = 0;
                            }
                            this.addError('house', elem.index, 'Исходя из настроек, вы не можете добавить больше ' + max_living_buildings_amount + '-х жилых домов');

                        }
                    }
                    else {
                        if(isNonLivingApartmentError) {
                            isError = true;
                            if(!max_nonliving_buildings_amount) {
                                max_nonliving_buildings_amount = 0;
                            }
                            this.addError('house', elem.index, 'Исходя из настроек, вы не можете добавить больше ' + max_nonliving_buildings_amount + '-х нежилых домов');
                        }
                    }
                }, this);
            }
            return isError;
        },
        cleverValidateArrayForTown: function (array) {
            //validate max living and nonliving apartments and size in town
            var isError = false;
            var buildings = this.hoaSettingsModel.get('buildings');
            var currentBuilding = _.findWhere(buildings, {id: this.model.get('id')});
            var max_living_apartments_amount = currentBuilding.living_apartments_amount,
                max_living_area_size = currentBuilding.living_area_size,
                max_nonliving_apartments_amount = currentBuilding.nonliving_apartments_amount,
                max_nonliving_area_size = currentBuilding.nonliving_area_size;

            var left_living_apartments_amount = max_living_apartments_amount;
            var left_living_area_size = max_living_area_size;
            var left_nonliving_apartments_amount = max_nonliving_apartments_amount;
            var left_nonliving_area_size = max_nonliving_area_size;

            var snatched_living_apartments = [];
            var snatched_nonliving_apartments = [];

            var living_apartments_total_area = {};
            var nonliving_apartments_total_area = {};

            var living_apartments_error_total_area = [];
            var nonliving_apartments_error_total_area = [];

            var living_apartments_ownership_percent = {};
            var nonliving_apartments_ownership_percent = {};


            var living_apartments_added_persons = [];
            var nonliving_apartments_added_persons = [];

            _.each(array, function (elem) {
                if(!elem.is_empty_apartment) {
                    var total_area = elem.total_area;
                    var apartment = elem.apartment;
                    if(total_area) {
                        if(elem.property_usage_type === 'living') {
                            if(living_apartments_error_total_area.indexOf(apartment) === -1) {
                                if(living_apartments_total_area[apartment]) {
                                    if(living_apartments_total_area[apartment] !== total_area) {
                                        living_apartments_error_total_area.push(apartment);
                                    }
                                }
                                else {
                                    living_apartments_total_area[apartment] = total_area;
                                }
                            }
                        }
                        else {
                            if(nonliving_apartments_error_total_area.indexOf(apartment) === -1) {
                                if(nonliving_apartments_total_area[apartment]) {
                                    if(nonliving_apartments_total_area[apartment] !== total_area) {
                                        nonliving_apartments_error_total_area.push(apartment);
                                    }
                                }
                                else {
                                    nonliving_apartments_total_area[apartment] = total_area;

                                }
                            }
                        }
                    }
                    if(apartment) {
                        var currentFullName = (elem.last_name ? elem.last_name.toLowerCase() : '') + (elem.first_name ? elem.first_name.toLowerCase() : '');
                        if(elem.property_usage_type === 'living') {
                            if(!living_apartments_ownership_percent[apartment]) {
                                living_apartments_ownership_percent[apartment] = {};

                                living_apartments_ownership_percent[apartment].ownership_percent = 0;
                                living_apartments_ownership_percent[apartment].owners_names = [];
                                living_apartments_ownership_percent[apartment].persons = [];
                            }
                            if(!currentFullName) {
                                living_apartments_ownership_percent[apartment].ownership_percent = living_apartments_ownership_percent[apartment].ownership_percent + elem.ownership_percent;
                                living_apartments_ownership_percent[apartment].owners_names.push(currentFullName);

                                living_apartments_ownership_percent[apartment].persons.push(elem);

                            }
                            else if(living_apartments_ownership_percent[apartment].owners_names.indexOf(currentFullName) === -1) {
                                living_apartments_ownership_percent[apartment].ownership_percent = living_apartments_ownership_percent[apartment].ownership_percent + elem.ownership_percent;
                                living_apartments_ownership_percent[apartment].owners_names.push(currentFullName);

                                living_apartments_ownership_percent[apartment].persons.push(elem);
                            }
                        }
                        else {
                            if(elem.owner_id && elem.last_name) {
                                nonliving_apartments_added_persons.push(elem);
                            }
                            if(!nonliving_apartments_ownership_percent[apartment]) {
                                nonliving_apartments_ownership_percent[apartment] = {};
                                nonliving_apartments_ownership_percent[apartment].ownership_percent = 0;
                                nonliving_apartments_ownership_percent[apartment].owners_names = [];
                                nonliving_apartments_ownership_percent[apartment].persons = [];
                            }
                            if(!currentFullName) {
                                nonliving_apartments_ownership_percent[apartment].ownership_percent = nonliving_apartments_ownership_percent[apartment].ownership_percent + elem.ownership_percent;
                                nonliving_apartments_ownership_percent[apartment].owners_names.push(currentFullName);

                                nonliving_apartments_ownership_percent[apartment].persons.push(elem);
                            }
                            else if(nonliving_apartments_ownership_percent[apartment].owners_names.indexOf(currentFullName) === -1) {
                                nonliving_apartments_ownership_percent[apartment].ownership_percent = nonliving_apartments_ownership_percent[apartment].ownership_percent + elem.ownership_percent;
                                nonliving_apartments_ownership_percent[apartment].owners_names.push(currentFullName);
                                nonliving_apartments_ownership_percent[apartment].persons.push(elem);
                            }
                        }
                    }
                }

            }, this);
            _.each(living_apartments_ownership_percent, function (living_apartment) {
                if(living_apartment.persons.length > 1) {

                    living_apartment.persons = living_apartment.persons.sort(function(a, b) {
                        return b['ownership_percent'] - a['ownership_percent'];
                    });
                    var countSavedUnknownPersons = 0;
                    var countNotSavedKnowPersons = 0;

                    _.each(living_apartment.persons, function (person) {
                        if(person.id && !person.last_name) {
                            countSavedUnknownPersons++;
                        }
                        if(!person.id && person.last_name) {
                            countNotSavedKnowPersons++;
                        }
                    }, this);
                    if(countSavedUnknownPersons !== living_apartment.persons.length) {
                        _.each(living_apartment.persons, function (person) {
                            if(countNotSavedKnowPersons > 0 && person.id && !person.last_name) {
                                countNotSavedKnowPersons--;
                                living_apartment.ownership_percent = living_apartment.ownership_percent -  person.ownership_percent;
                            }
                        }, this);
                    }
                }
            }, this);

            _.each(nonliving_apartments_ownership_percent, function (nonliving_apartment) {
                if(nonliving_apartment.persons.length > 1) {

                    nonliving_apartment.persons = nonliving_apartment.persons.sort(function(a, b) {
                        return b['ownership_percent'] - a['ownership_percent'];
                    });
                    var countSavedUnknownPersons = 0;
                    var countNotSavedKnowPersons = 0;

                    _.each(nonliving_apartment.persons, function (person) {
                        if(person.id && !person.last_name) {
                            countSavedUnknownPersons++;
                        }
                        if(!person.id && person.last_name) {
                            countNotSavedKnowPersons++;
                        }
                    }, this);
                    if(countSavedUnknownPersons !== nonliving_apartment.persons.length) {
                        _.each(nonliving_apartment.persons, function (person) {
                            if(countNotSavedKnowPersons > 0 && person.id && !person.last_name) {
                                countNotSavedKnowPersons--;
                                nonliving_apartment.ownership_percent = nonliving_apartment.ownership_percent -  person.ownership_percent;
                            }
                        }, this);
                    }
                }
            }, this);

            if(living_apartments_error_total_area.length) {
                _.each(living_apartments_error_total_area, function(apart) {
                    var living_apartments_with_error = _.where(array, {apartment: apart, property_usage_type: 'living'});
                    if(living_apartments_with_error) {
                        var indexes = _.pluck(living_apartments_with_error, 'index');
                        var string = 'В строках ';
                        _.each(indexes, function(index, i) {
                            if(i) {
                                string = string + ', '
                            }
                            string = string + (index + 1);
                        });
                        string = string + ' указаны разные значения площади для одной квартиры';

                        _.each(indexes, function(index) {
                            isError = true;

                            this.addError('total_area', index, string);
                        }, this);

                    }


                }, this);
            }

            if(nonliving_apartments_error_total_area.length) {
                _.each(nonliving_apartments_error_total_area, function(apart) {
                    var nonliving_apartments_with_error = _.where(array, {apartment: apart, property_usage_type: 'nonliving'});
                    if(nonliving_apartments_with_error) {
                        var indexes = _.pluck(nonliving_apartments_with_error, 'index');
                        var string = 'В строках ';
                        _.each(indexes, function(index, i) {
                            if(i) {
                                string = string + ', '
                            }
                            string = string + (index + 1);
                        });
                        string = string + ' указаны разные значения площади для одного нежилого помещения';

                        _.each(indexes, function(index) {
                            isError = true;

                            this.addError('total_area', index, string);
                        }, this);
                    }
                }, this);
            }
            _.each(array, function (elem) {
                var ownership_percent = elem.ownership_percent;
                if(ownership_percent) {
                    if(elem.property_usage_type === 'living') {
                        if(living_apartments_ownership_percent && living_apartments_ownership_percent[elem.apartment] && living_apartments_ownership_percent[elem.apartment].ownership_percent && living_apartments_ownership_percent[elem.apartment].ownership_percent > 1) {
                            isError = true;
                            this.addError('ownership_percent', elem.index, 'Суммарная доля собственности превышает 1');
                        }
                    }
                    else {
                        if(nonliving_apartments_ownership_percent && nonliving_apartments_ownership_percent[elem.apartment] && nonliving_apartments_ownership_percent[elem.apartment].ownership_percent && nonliving_apartments_ownership_percent[elem.apartment].ownership_percent > 1) {
                            isError = true;
                            this.addError('ownership_percent', elem.index, 'Суммарная доля собственности превышает 1');
                        }
                    }
                }
            }, this);

            if(!max_living_apartments_amount && !max_living_area_size && !max_nonliving_apartments_amount && !max_nonliving_area_size) {
                return isError;
            }

            var living_area_error_index = [];
            var nonliving_area_error_index = [];
            var exceeded_living_area = 0;
            var exceeded_nonliving_area = 0;
            _.each(array, function (elem) {
                if(!elem.is_empty_apartment) {
                    var owned_area = elem.owned_area;
                    var total_area = elem.total_area;
                    if(total_area) {
                        if(elem.property_usage_type === 'living') {
                            if(snatched_living_apartments.indexOf(elem.apartment) === -1) {
                                if(max_living_apartments_amount) {
                                    if(left_living_apartments_amount && left_living_apartments_amount > 0) {
                                        left_living_apartments_amount = left_living_apartments_amount - 1;
                                    }
                                    else {
                                        left_living_apartments_amount = 0;
                                        isError = true;
                                        this.addError('apartment', elem.index, 'Исходя из настроек дома, вы не можете добавить больше ' + max_living_apartments_amount + '-х квартир');
                                    }
                                }
                                if(max_living_area_size) {
                                    if(left_living_area_size && left_living_area_size > 0 && left_living_area_size >= total_area) {
                                        left_living_area_size = left_living_area_size - total_area;
                                    }
                                    else {
                                        living_area_error_index.push(elem.index);
                                        exceeded_living_area = exceeded_living_area + total_area - left_living_area_size;
                                        left_living_area_size = 0;
                                    }
                                }
                                snatched_living_apartments.push(elem.apartment);
                            }
                        }
                        else {
                            if(snatched_nonliving_apartments.indexOf(elem.apartment) === -1) {
                                if(max_nonliving_apartments_amount) {
                                    if(left_nonliving_apartments_amount && left_nonliving_apartments_amount > 0) {
                                        left_nonliving_apartments_amount = left_nonliving_apartments_amount - 1;
                                    }
                                    else {
                                        left_nonliving_apartments_amount = 0;
                                        isError = true;
                                        this.addError('apartment', elem.index, 'Исходя из настроек дома, вы не можете добавить больше ' + max_nonliving_apartments_amount + '-х нежилых помещений');

                                    }
                                }
                                if(max_nonliving_area_size) {
                                    if(left_nonliving_area_size && left_nonliving_area_size > 0 && left_nonliving_area_size >= total_area) {
                                        left_nonliving_area_size = left_nonliving_area_size - total_area;
                                    }
                                    else {
                                        nonliving_area_error_index.push(elem.index);
                                        exceeded_nonliving_area = exceeded_nonliving_area + total_area - left_nonliving_area_size;
                                        left_nonliving_area_size = 0;
                                    }
                                }
                                snatched_nonliving_apartments.push(elem.apartment);
                            }
                        }
                    }
                }
            }, this);

            if(living_area_error_index.length) {
                _.each(living_area_error_index, function(index) {
                    isError = true;
                    this.addError('total_area', index, ' Превышен предел жилой площади дома, указанной в настройках, на ' + exceeded_living_area + ' м<sup>2</sup>');

                }, this);
            }
            if(nonliving_area_error_index.length) {
                _.each(nonliving_area_error_index, function(index) {
                    isError = true;
                    this.addError('total_area', index, ' Превышен предел нежилой площади дома, указанной в настройках, на ' + exceeded_nonliving_area + ' м<sup>2</sup>');

                }, this);
            }
            return isError;
        },
        startSorting: function (direction) {
            var strategy = 'sort' + helper.capitalizeFirstLetter(direction);
            this.collection.changeSort(strategy, this.houses_type);
            this.collection.sort();
        },
        checkModelInCurrentCollection: function (type, model, id) {
            var attached_units = model.get('attached_units');
            var current_units = [];
            _.each(attached_units, function (unit) {
                if(this.houses_type === 'village') {
                    current_units.push(unit);
                }
                else {
                    if(unit.hoa_building_id === this.model.get('id')) {
                        current_units.push(unit);
                    }
                }
            }, this);

            var all_current_models = this.collection.where({"old_id": model.get('id')});
            var all_current_models_ids = [];
            _.each(all_current_models, function (model) {
                all_current_models_ids.push(model.get('id'));
            }, this);

            var id;
            if(type === 'remove') {
                if(current_units && current_units.length) {
                    _.each(current_units, function (current_unit) {

                        if(model.get('id')) {
                            if(current_unit && current_unit.apartment_id) {
                                id = model.get('id').toString() + '_' + current_unit.apartment_id.toString();
                            }
                            else {
                                id = model.get('id').toString();
                            }
                        }
                        this.channel.vent.trigger('remove:current:user:from:building:' + id);
                    }, this);
                }
            }
            else {
                var newIds = [];
                _.each(current_units, function (current_unit) {
                    if(current_unit) {
                        var newModel =  this.createCurrentModelAttributes(model, current_unit);
                        newModel.set('isNew', false);

                        id = model.get('id').toString() + '_' + current_unit.apartment_id.toString();
                        newModel.set('id', id);
                        newIds.push(id);

                        if(this.collection.get(id)) {

                            this.channel.vent.trigger('change:current:user:' + id, newModel);
                        }
                        else {
                            newModel.set('old_id', model.get('id'));

                            this.collection.add(newModel);
                            this.render();
                            this.afterRender(true);
                        }
                    }
                }, this);

                _.each(all_current_models_ids, function (id) {
                    if(newIds.indexOf(id) === -1) {
                        this.channel.vent.trigger('remove:current:user:' + id);
                    }
                }, this);
            }

        },
        createCurrentModelAttributes: function (model, current_unit) {
            //change this owner after save in modal window
            var newModel = new Backbone.Model();
            var currentAttributes = _.keys(model.attributes);

            var attributesHouses = ['house', 'unit', 'street', 'property_usage_type', 'total_area', 'owned_area', 'entrance_number', 'floor'];
            _.each(attributesHouses, function(attribute) {
                newModel.set(attribute, current_unit[attribute]);
            }, this);
            newModel.set('apartment', current_unit.apartment_number);
            newModel.set('unit', current_unit.building_unit);
            newModel.set('street', current_unit.building_street);
            newModel.set('house', current_unit.building_number);

            _.each(currentAttributes, function(attribute) {
                if(attribute === 'apartment' || attribute === 'house' || attribute === 'unit' || attribute === 'street' || attribute === 'property_usage_type' || attribute === 'total_area' || attribute === 'owned_area') {
                    newModel.set(attribute, current_unit[attribute]);
                }
                else {
                    newModel.set(attribute, model.get(attribute));
                }
            }, this);
            return newModel;
        },
		initialize: function(options) {
		    var self = this;
			this.childViews = [];
			this.template = JST['registry-registry-building'];
			this.channel = options.channel;
			this.houses_type = options.houses_type;
			this.structure_type = options.structure_type;
            this.hoaSettingsModel = options.hoaSettingsModel;
            this.legalFormValues = options.legalFormValues;
            this.hoa_id = options.hoa_id;
            this.reRus = /^([аА-яЯёЁ\s-]+)$/;
            this.reEmail = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
            this.listenTo(this.channel.vent, 'remove:user:' + this.model.get('id'), function () {
                this.changeLastPerson();
            }, this);

            this.listenTo(this.channel.vent, 'change:user:information', function (type, model, id) {
                this.checkModelInCurrentCollection(type, model, id);
            }, this);

            this.listenTo(this.channel.vent, 'change:hoa:settings:model', function (model) {
                this.hoaSettingsModel.set(model.toJSON());
            }, this);




            this.index = options.index;
            if(this.houses_type === 'village') {
                this.collection = new OwnersCollection(this.model.get('owners'));
            }
            else {
                this.collection = new OwnersCollection(this.createOwnersWithUniqId(this.model.get('owners')));
            }
            this.oldCollection = this.cloneBackboneCollection(OwnersCollection, this.collection.toJSON());
            $(window).scroll(function () {
                self.afterScroll();
            });
        },
        changeLastPerson: function () {
            this.$('.bb_person_last').removeClass('bb_person_last');
            this.$('.bb_person:last').addClass('bb_person_last');
        },
        fixTableHead: function(changeTopToZero) {
            var $el = this.$('.ownersNew'),
                fixedEl = this.$('.ownersNew__line_heading');

            if(changeTopToZero) {
                $el.removeClass('fixed');
                fixedEl.css('top', 0);
                return;
            }
            if(!$el.is(":visible")) {
                return;
            }
            if($el && $el.length) {
                var $header = $('.header');
                var newTop = $(window).scrollTop() - $el.offset().top + $header.outerHeight() ;
                if($(window).scrollTop() + $header.outerHeight() > $el.offset().top){
                    $el.addClass('fixed');
                    fixedEl.css('top', newTop);
                } else {
                    $el.removeClass('fixed');
                    fixedEl.css('top', 0);
                }
            }
        },
        afterScroll: function () {
            this.fixTableHead();
            // this.hideErrorTooltip();
        },
        createOwnersWithUniqId: function (owners) {
            var owners_uniq = [];
            _.each(owners, function (owner) {
                var new_onwer = owner;
                if(owner.is_empty_apartment) {
                    new_onwer.old_id = owner.apartment_id;
                }
                else {
                    new_onwer.old_id = owner.id;
                }

                if(owner.id) {
                    new_onwer.id = owner.id.toString() + '_' +  owner.apartment_id.toString();
                }
                else {
                    new_onwer.id = owner.apartment_id.toString();
                }
                owners_uniq.push(new_onwer);
            });
            return owners_uniq;

        },
        cloneBackboneCollection : function (currentCollection, data) {
            var newData = [];
            _.each(data, function (elem) {
                if(elem && elem.id) {
                    newData.push(elem);
                }
            }, this);
            return new currentCollection(newData);
        },
		processData: function() {
			var data = this.model.toJSON();
			data.houses_type = this.houses_type;
			data.structure_type = this.structure_type;
			if(this.houses_type === 'town') {
                data.index = this.index;
            }
			return data;
		},
		render: function() {
			this.$el.html(this.template(this.processData()));
			return this;
		},
        initFileUpload: function() {
            var self = this;
            var loader, fileCount;
            var url = '';
            if(this.houses_type === 'town') {
               url =  config.apiUrl + '/api/v1/hoa/buildings/owners/template/parse';
            }
            else {
                url =  config.apiUrl + '/api/v1/hoa/' + this.hoa_id +'/buildings/owners/template/parse';
            }
            this.$('.bb_file_input').fileupload({
                url: url,
                type: 'POST',
                dropZone: null,
                sequentialUploads: true,
                dataType: 'json',
                error: function(d) {
                    loader.leave();
                    if(d['responseJSON'] && d['responseJSON']['error']) {
                        var errorPanel = new ErrorPanel({'message': d['responseJSON']['error']});
                        self.$('#bb_owner_list').append(errorPanel.render().el);
                    }
                },
                progressall: function(e, data) {
                },
                change: function(e, data) {
                    loader = new LoadindView({isFile: true, message: data.files[0].name});
                },
                start: function(e, data) {
                    self.$el.append(loader.render().el);
                    $('#modal__loaded').remove();
                },
                done: function(e, data) {
                    loader.leave();
                    self.renderEditOwners(data.result);
                }
            });

        },
        renderEditOwners: function (owners) {
            //render owners after upload file
            this.checkRemoveLastElem();
            var ownerModel;
            if(owners && owners.length) {
                _.each(owners, function (owner) {
                    if(this.houses_type === 'town') {
                        if(owner.ownership_percent) {
                            owner.ownership_percent = owner.ownership_percent.toString().split(',').join('.');
                            owner.ownership_percent = parseFloat(owner.ownership_percent);
                            if(!owner.ownership_percent) {
                                owner.ownership_percent = 1;
                            }
                        }
                        else {
                            owner.ownership_percent = 1;
                        }
                    }
                    owner.isNew = true;
                    owner.isLastAdded = true;
                    ownerModel = new Backbone.Model(owner);
                    this.collection.add(ownerModel);
                }, this);
            }
            ownerModel = new Backbone.Model({is_hoa_member: true, isNew: true, isLastAdded: true});
            this.collection.add(ownerModel);
            this.render();
            this.afterRender(true);
        },
        checkRemoveLastElem: function () {
            var $textareas = this.$('.bb_person_last').find('textarea');
            var needRemove = true;
            _.each($textareas, function (textarea) {
                if ($.trim($(textarea).val()).length) {
                    needRemove = false;
                }
            }, this);
            if (needRemove) {
                this.$('.bb_person_last').find('.bb_delete_line').trigger('click');
            }
        },
        afterRender: function(withoutNewPerson) {
		    this.initFileUpload();
            this.startSorting('asc');
            this.renderOwners();
            if(!withoutNewPerson) {
                this.renderOwner(new Backbone.Model({is_hoa_member: true, isNew: true}), true);
            }
            this.changeLastPerson();
        },
        renderOwner: function (owner, isEdit) {
            this.collection.add(owner);
            var ownerView = new RegistryBuildingOwner({model: owner, channel: this.channel, isEdit: isEdit, houses_type: this.houses_type, structure_type: this.structure_type, house_id: this.model.get('id'), legalFormValues: this.legalFormValues, owner_index: this.owner_index, collection: this.collection, house_id: this.model.get('id'), legalFormValues: this.legalFormValues});
            this.$('.bb_table_wrap').append(ownerView.render().el);
            this.childViews.push(ownerView);
            ownerView.afterRender();
            this.owner_index++;
        },
        renderOwners: function () {
            //render owners saved in system
            _.each(this.collection.models, function (owner) {
                this.renderOwner(owner, owner.get('isNew'));
            }, this);
        },
        setValueToTextarea: function($selector, field, value) {
            // set value from input from current line(determined by current selector) and necessary field
            var $input = $selector.find('textarea[name=' + field + ']');
            $input.val(value).trigger('keyup');
        },
        getValue: function($selector, field) {
            // get value from input from current line(determined by current selector) and necessary field
            var $input = $selector.find('[name=' + field + ']');
            var value = $input.val();
            value = $.trim(value);
            if($input.hasClass('bb_number_integer')) {
                value = parseInt(value);
                if(!value && value != 0) {
                    value = null;
                }
            }
            else if($input.hasClass('bb_number_float')) {
                value = value.split(',').join('.');
                value = parseFloat(value);
                if(!value && value != 0) {
                    value = null;
                }
            }
            else if(!value) {
                value = null;
            }
            return value;
        },
        addError: function (field, index, errorText) {
		    var error = '';
            switch(field) {
                case 'house':
                    error = error + 'Дом: ';
                    break;
                case 'street':
                    error = error + 'Улица: ';
                    break;
                case 'apartment':
                    error = error + 'Квартира: ';
                    break;
                case 'total_area':
                    error = error + 'Площадь: ';
                    break;
                case 'entrance_number':
                    error = error + 'Подъезд: ';
                    break;
                case 'floor':
                    error = error + 'Этаж: ';
                    break;
                case 'ownership_percent':
                    error = error + 'Доля собственности: ';
                    break;
                case 'last_name':
                    error = error + 'Фамилия: ';
                    break;
                case 'first_name':
                    error = error + 'Имя: ';
                    break;
                case 'middle_name':
                    error = error + 'Отчество: ';
                    break;
                case 'phone':
                    error = error + 'Телефон: ';
                    break;
                case 'email':
                    error = error + 'Эл. адрес: ';
                    break;
                case 'juristic_person_inn':
                    error = error + 'Инн: ';
                    break;
                case 'juristic_person_legal_form':
                    error = error + 'Правовая форма: ';
                    break;
                case 'juristic_person_name':
                    error = error + 'Название: ';
                    break;

            }
            error = error + errorText;

            var $errorField = this.$('.bb_person:eq(' + index + ')');
            $errorField.addClass('ownersNew__line-error');
            var $errorInput = $errorField.find('[name=' + field + ']');
            if($errorInput.hasClass('error')) {
                return;
            }

            if($errorField.find('.error__tooltip').length) {
                var newError = $errorField.find('.error__tooltip').html();
                newError = newError + '</br>';
                newError = newError + error;
                $errorField.find('.error__tooltip').html(newError);
            }
            else {
                $errorField.find('.error__tooltip').remove();
                var tooltip = $('<div />').addClass('error__tooltip').html(error);
                $errorField.prepend(tooltip);
            }

        },
        checkINN :function (inputNumber) {
            inputNumber = "" + inputNumber;
            inputNumber = inputNumber.split('');
            if((inputNumber.length == 10) && (inputNumber[9] == ((2 * inputNumber[0] + 4 * inputNumber[1] + 10 * inputNumber[2] + 3 * inputNumber[3] + 5 * inputNumber[4] + 9 * inputNumber[5] + 4 * inputNumber[6] + 6 * inputNumber[7] + 8 * inputNumber[8]) % 11) % 10)) {
                return true;
            } else if((inputNumber.length == 12) && ((inputNumber[10] == ((7 * inputNumber[0] + 2 * inputNumber[1] + 4 * inputNumber[2] + 10 * inputNumber[3] + 3 * inputNumber[4] + 5 * inputNumber[5] + 9 * inputNumber[6] + 4 * inputNumber[7] + 6 * inputNumber[8] + 8 * inputNumber[9]) % 11) % 10) && (inputNumber[11] == ((3 * inputNumber[0] + 7 * inputNumber[1] + 2 * inputNumber[2] + 4 * inputNumber[3] + 10 * inputNumber[4] + 3 * inputNumber[5] + 5 * inputNumber[6] + 9 * inputNumber[7] + 4 * inputNumber[8] + 6 * inputNumber[9] + 8 * inputNumber[10]) % 11) % 10))) {
                return true;
            } else {
                return false;
            }
        },
        validate: function(array) {
            var isEmptyFieldError = false;
            var isIncorrectValueFieldError = false;
            // this.removeAllErrors();
            //validate all fields and show simply errors
            var requiredFields = [];
            if(this.houses_type === 'village') {
                requiredFields.push('house', 'street');
            }
            else {
                requiredFields.push('apartment', 'total_area');
            }
            _.each(array, function (elem) {
                _.each(requiredFields, function (field) {
                    if(!elem[field]) {
                        isEmptyFieldError = true;

                        this.addError(field, elem.index, 'Обязательное поле');
                    }
                }, this);
                if(!elem.owner_id) {
                    if(this.houses_type === 'town') {
                        if(elem.ownership_percent) {
                            if(elem.ownership_percent > 1) {
                                this.addError('ownership_percent', elem.index, 'Не может быть больше 1');
                            }
                        }
                        else {
                            if(!elem.is_empty_apartment) {
                                isEmptyFieldError = true;
                                this.addError('ownership_percent', elem.index, 'Обязательное поле');
                            }
                        }
                    }
                    if(elem.first_name || elem.last_name) {
                        if(!elem.first_name) {
                            isEmptyFieldError = true;
                            this.addError('first_name', elem.index, 'Обязательное поле');
                        }
                        if(!elem.last_name) {
                            isEmptyFieldError = true;
                            this.addError('last_name', elem.index, 'Обязательное поле');
                        }
                    }
                    if(elem.first_name) {
                        if(!this.reRus.test(elem.first_name)) {
                            isIncorrectValueFieldError = true;
                            this.addError('first_name', elem.index, 'Только буквы русского алфавита');
                        }

                    }
                    if(elem.last_name) {
                        if(!this.reRus.test(elem.last_name)) {
                            isIncorrectValueFieldError = true;
                            this.addError('last_name', elem.index, 'Только буквы русского алфавита');
                        }
                    }
                    if(elem.middle_name) {
                        if(!this.reRus.test(elem.middle_name)) {
                            isIncorrectValueFieldError = true;
                            this.addError('middle_name', elem.index, 'Только буквы русского алфавита');
                        }
                    }
                    if(elem.is_juristic_person) {
                        if(elem.juristic_person_inn) {
                            if (elem.juristic_person_inn.length !== 10 && elem.juristic_person_inn.length !== 12) {
                                isIncorrectValueFieldError = true;
                                this.addError('juristic_person_inn', elem.index, 'ИНН должен содержать 10 или 12 цифр');
                            }
                            else {
                                if (!this.checkINN(elem.juristic_person_inn)) {
                                    isIncorrectValueFieldError = true;
                                    this.addError('juristic_person_inn', elem.index, 'неправильный ИНН');
                                }
                            }
                        }

                        if(!elem.juristic_person_legal_form) {
                            isEmptyFieldError = true;
                            this.addError('juristic_person_legal_form', elem.index, 'обязательное поле');
                        }

                        if(!elem.juristic_person_name) {
                            isEmptyFieldError = true;
                            this.addError('juristic_person_name', elem.index, 'обязательное поле');
                        }
                    }
                    if(elem.email) {
                        if(!this.reEmail.test(elem.email)) {
                            isIncorrectValueFieldError = true;
                            this.addError('email', elem.index, 'некорретный эл. адрес');
                        }
                    }
                    if(elem.phone && elem.phone.length) {
                        if(this.$('.bb_person:eq(' + elem.index + ')').find('[name=phone]').length && this.$('.bb_person:eq(' + elem.index + ')').find('[name=phone]').data()._inputmask_opts) {
                            if(!this.$('.bb_person:eq(' + elem.index + ')').find('[name=phone]').inputmasks('isCompleted')) {
                                isIncorrectValueFieldError = true;
                                this.addError('phone', elem.index, 'некорретный номер телефона');
                            }
                        }
                    }
                }
            }, this);
            var isError;
            //clever array validate
            if(this.houses_type === 'town') {
                isError = this.cleverValidateArrayForTown(array);
                if(isError) {
                    isIncorrectValueFieldError = isError;
                }
            }
            else {
                isError = this.cleverValidateArrayForVillage(array);
                if(isError) {
                    isIncorrectValueFieldError = isError;
                }
            }
            if(isIncorrectValueFieldError || isEmptyFieldError) {
                var errorPanel = new ErrorPanel({message: 'При формировании реестра были допущены ошибки. Исправьте их и продолжите сохранение'});
                this.$el.append(errorPanel.render().el);
            }
            return !(isEmptyFieldError || isIncorrectValueFieldError);
        },
        getTotalAreaForCurrentApartment: function(clonedArray, apartment, property_usage_type) {
            var total_area = 0;
            _.each(clonedArray, function (elem) {
                if(!total_area) {
                    if(elem.apartment === apartment && elem.property_usage_type === property_usage_type) {
                        if(elem.total_area) {
                            total_area = elem.total_area;
                        }
                    }
                }

            });
            return total_area;
        },
        trySetTotalArea: function (sendArray) {
            if(this.houses_type === 'village') {
                return;
            }
            var clonedArray = _.clone(sendArray);
            var total_area;
            _.each(sendArray, function(elem, index) {
                if(!elem.total_area && elem.apartment && !elem.owner_id) {
                    total_area = this.getTotalAreaForCurrentApartment(clonedArray, elem.apartment, elem.property_usage_type);
                    if(total_area && total_area > 0) {
                        total_area = this.floatToFixed(total_area);
                        elem.total_area = total_area;
                        var $person = this.$('.bb_person:eq(' + index + ')');
                        this.setValueToTextarea($person, 'total_area', total_area);
                    }
                }
            }, this);
        },
        floatToFixed: function (percent) {
            var ownership_percent =  parseFloat(percent).toFixed(2);
            ownership_percent = parseFloat(ownership_percent);
            return ownership_percent;
        },
        trySetOwnershipPercentToOwner: function (sendArray) {
            if(this.houses_type === 'village') {
                return;
            }
            var clonedArray = _.clone(sendArray);
            var ownership_percent;
            _.each(sendArray, function(elem, index) {
                if(!elem.ownership_percent && elem.apartment && !elem.owner_id) {
                    ownership_percent = this.getOwnershipPercentForCurrentApartment(clonedArray, elem.apartment, elem.property_usage_type);
                    if(ownership_percent && ownership_percent > 0) {
                        ownership_percent = this.floatToFixed(ownership_percent);
                        elem.ownership_percent = ownership_percent;
                        var $person = this.$('.bb_person:eq(' + index + ')');
                        this.setValueToTextarea($person, 'ownership_percent', ownership_percent);
                    }

                }
            }, this);
        },
        getOwnershipPercentForCurrentApartment: function(clonedArray, apartment, property_usage_type) {
            var maxCurrentPercent = 1;
            var personsCount = 0;
            _.each(clonedArray, function (elem) {
                if(elem.apartment === apartment && elem.property_usage_type === property_usage_type) {
                    if(elem.ownership_percent) {
                        maxCurrentPercent = maxCurrentPercent - elem.ownership_percent;
                    }
                    else {
                        personsCount++;
                    }
                }
            });
            return maxCurrentPercent / personsCount;
        },
        setOwnedArea: function(sendArray) {
            if(this.houses_type === 'village') {
                return;
            }
            _.each(sendArray, function(elem, index) {
                if(elem.ownership_percent && elem.total_area) {
                    elem.owned_area = elem.total_area * elem.ownership_percent;
                }
            }, this);
        },
        createSendArray: function() {
            //create array from table
            var $owners = this.$('.bb_person');
            var names_fields = ['last_name', 'first_name', 'middle_name'],
                input_fields = ['phone', 'email'],
                company_fields = ['juristic_person_legal_form', 'juristic_person_name', 'juristic_person_inn'],
                passport_fields = ['ownership_document_number', 'ownership_document_type', 'ownership_document_issue_date'],
                ownership_fields = [];
            if(this.houses_type === 'town') {
                ownership_fields.push('apartment', 'total_area', 'entrance_number', 'floor');
            }
            else {
                ownership_fields.push('apartment', 'house', 'unit', 'street');
            }
            var isEmptyOwnership = false;
            var isEmptyTotalArea = false;
            var sendArray = [];
            _.each($owners, function (owner, owner_index) {
                var elem = {};
                var isEmpty = true;

                var emptyApartment = $(owner).data().emptyApartment;
                if($(owner).data().id) {
                    elem.id = $(owner).data().currentId;
                    elem.owner_id = $(owner).data().id;
                    elem.apartment_id = $(owner).data().apartmentId;
                }
                else if($(owner).data().currentId) {
                    elem.id = $(owner).data().currentId;
                    elem.apartment_id = $(owner).data().apartmentId;
                }

                if(this.houses_type === 'village') {
                    elem.building_id = $(owner).data().buildingId;
                }

                //get ownership data
                if(this.getValue($(owner), 'property_usage_type') === 'living') {
                    elem.property_usage_type = 'living';
                }
                else {
                    elem.property_usage_type = 'nonliving';
                }

                _.each(ownership_fields, function (field) {
                    elem[field] = this.getValue($(owner), field);
                    if(field === 'total_area' && elem[field]) {
                        elem[field] = parseFloat(elem[field]);
                    }
                    if(elem[field] && !emptyApartment) {
                        isEmpty = false;
                    }
                }, this);
                if(!elem.owner_id || emptyApartment) {
                    //get owner data
                    elem.is_empty_apartment = false;
                    if(this.houses_type === 'town') {
                        elem.ownership_percent = this.getValue($(owner), 'ownership_percent');
                        if(elem.ownership_percent) {
                            elem.ownership_percent = parseFloat(elem.ownership_percent);
                            isEmpty = false;
                        }
                    }
                    if(this.getValue($(owner), 'is_juristic_person') === 'juristic_person') {
                        elem.is_juristic_person = true;
                    }
                    else {
                        elem.is_juristic_person = false;
                    }

                    if(this.structure_type !== 'other') {
                        if(this.getValue($(owner), 'is_hoa_member') === 'is_hoa_member') {
                            elem.is_hoa_member = true;
                        }
                        else {
                            elem.is_hoa_member = false;
                        }
                    }
                    //get juristic data(if necessary)
                    if(elem.is_juristic_person) {
                        _.each(company_fields, function (field) {
                            if(field === 'juristic_person_legal_form') {
                                elem[field] = this.getValue($(owner), field);
                            }
                            else {
                                elem[field] = this.getValue($(owner), field);

                            }
                            if(elem[field]) {
                                isEmpty = false;
                            }
                        }, this);
                    }

                    //get names values
                    _.each(names_fields, function (field) {
                        elem[field] = this.getValue($(owner), field);
                        if(elem[field]) {
                            isEmpty = false;
                        }
                    }, this);


                    //get passport values
                    _.each(passport_fields, function (field) {
                        elem[field] = this.getValue($(owner), field);
                        if(elem[field]) {
                            isEmpty = false;
                        }
                    }, this);
                    if (elem.ownership_document_issue_date) {
                        elem.ownership_document_issue_date = moment(elem.ownership_document_issue_date, 'DD/MM/YYYY').format('YYYY-MM-DD');
                    }

                    //get another input values
                    _.each(input_fields, function (field) {
                        elem[field] = this.getValue($(owner), field);
                        if(elem[field]) {
                            isEmpty = false;
                        }
                    }, this);
                }
                else {
                    if(this.houses_type === 'town') {
                        elem.ownership_percent = this.getValue($(owner), 'ownership_percent');
                        if(elem.ownership_percent) {
                            elem.ownership_percent = parseFloat(elem.ownership_percent);
                            isEmpty = false;
                        }
                    }
                }
                if(!isEmpty) {
                    if(emptyApartment){
                        elem.owner_id = null;
                    }
                    elem.is_empty_apartment = false;
                    if(this.houses_type === 'town') {

                        if (!elem.entrance_number) {
                            this.setValueToTextarea($(owner), 'entrance_number', 1);
                            elem.entrance_number = 1;
                        }
                        if (!elem.floor) {
                            this.setValueToTextarea($(owner), 'floor', 1);
                            elem.floor = 1;
                        }

                        if(!elem.ownership_percent) {
                            isEmptyOwnership = true;
                        }
                        if(!elem.total_area) {
                            isEmptyTotalArea = true;
                        }
                    }
                    elem.index = owner_index;
                    sendArray.push(elem);
                }
                else if(emptyApartment){
                    elem.index = owner_index;

                    elem.is_empty_apartment = true;
                    if (!elem.entrance_number) {
                        this.setValueToTextarea($(owner), 'entrance_number', 1);
                        elem.entrance_number = 1;
                    }
                    if (!elem.floor) {
                        this.setValueToTextarea($(owner), 'floor', 1);
                        elem.floor = 1;
                    }
                    sendArray.push(elem);
                }
            }, this);
            if(isEmptyOwnership)  {
                this.trySetOwnershipPercentToOwner(sendArray);
            }
            if(isEmptyTotalArea)  {
                this.trySetTotalArea(sendArray);
            }

            this.setOwnedArea(sendArray);
            return sendArray;
        },
        removeErrors: function () {
            this.$('.ownersNew__line').removeClass('ownersNew__line-error');
            this.$('.error__tooltip').remove();
        },
        save: function () {
            if(this.requestInProcess) {
                return;
            }
            this.removeErrors();
            this.$('.bb_save').addClass('loading');
            var sendArray = this.createSendArray();
            if(!this.validate(sendArray)) {
                this.$('.bb_save').removeClass('loading');
                return;
            }
            this.requestInProcess = true;

            var ownersCollection;
            var collection_length = this.collection.length;

            this.oldCollection = this.cloneBackboneCollection(OwnersCollection, this.collection.toJSON());

            if(this.model.get('id')) {
                //model for town
                ownersCollection = new OwnersCollection(null, {id: this.model.get('id'), hoa_id: this.hoa_id});
            }
            else {
                //model for village
                ownersCollection = new OwnersCollection(null, {hoa_id: this.hoa_id});
            }
            ownersCollection.add(sendArray);
            var newCollection = new OwnersCollection();
            Backbone.sync('update', ownersCollection, {
                type: 'POST',
                success: (function(collection) {
                    var not_inserted = false;
                    var inserted_count = 0;
                    if(this.removedAparmentIds && this.removedAparmentIds.length) {
                        _.each(this.removedAparmentIds, function(removeId) {
                            this.oldCollection.remove(removeId);
                        }, this);
                    }
                    this.collection = this.cloneBackboneCollection(OwnersCollection, this.oldCollection.toJSON());
                    _.each(collection, function (owner, index) {
                        var currentModel;
                        if(owner.inserted) {
                            owner.isNew = false;
                            owner.errors = null;
                            newCollection.add(owner, {merge: true});
                            inserted_count++;
                        }
                        else {
                            not_inserted = true;
                            if(owner.id) {
                                owner.isNew = false;
                            }
                            else {
                                owner.isNew = true;
                            }
                            currentModel = new Backbone.Model(owner);
                            this.collection.add(currentModel, {merge: true});
                        }

                    }, this);
                    this.requestInProcess = false;
                    if(inserted_count) {
                        this.channel.vent.trigger('add:users');
                    }
                    var message, modalDialog;

                    if(not_inserted) {
                        message = 'Успешно сохранено ' + inserted_count + ' из ' + collection.length;
                        modalDialog = new ModalDialogView({firstMessage: message});
                        $('body').append(modalDialog.render().el);
                        $('#modal__loaded').modal('show');
                        this.channel.vent.trigger('userChangeUpload');
                        this.$('.bb_save_throbber').addClass('none');
                    }
                    else {
                        message = 'Успешно сохранены все собственники';
                        modalDialog = new ModalDialogView({firstMessage: message});
                        $('body').append(modalDialog.render().el);
                        $('#modal__loaded').modal('show');
                        this.channel.vent.trigger('userChangeUpload');



                    }
                    _.each(newCollection.models, function (model) {
                        var addedObj = model.toJSON();
                        var id = addedObj.id;
                        addedObj.old_id = addedObj.owner_id;

                        if(addedObj.owner_id && addedObj.apartment_id) {
                            addedObj.id = addedObj.owner_id.toString() + '_' +  addedObj.apartment_id.toString();
                        }
                        if(addedObj.id !== id) {
                            this.collection.remove(id);
                        }
                        this.collection.add(addedObj, {merge: true});
                    }, this);
                    if(not_inserted) {
                        var diff_collection_lenght = collection_length - this.collection.length;
                        if(diff_collection_lenght > 0) {
                            for(var i = 0; i < diff_collection_lenght; i++) {
                                var ownerModel = new Backbone.Model({is_hoa_member: true, isNew: true, isLastAdded: true});
                                this.collection.add(ownerModel);
                            }
                        }
                    }
                    this.render();
                    this.afterRender();
                    this.channel.vent.trigger('change:buildings:information');

                    this.channel.vent.trigger('after:change:user:information');

                }).bind(this),
                error: (function(model, resp) {
                    var errorPanel;
                    this.$('.bb_save_throbber').addClass('none');
                    this.requestInProcess = false;
                    if(resp && resp.status === 422) {
                        errorPanel = new ErrorPanel({message: 'Одно или несколько полей заполнены неправильно'});
                        this.$el.append(errorPanel.render().el);
                    }
                    else {
                        errorPanel = new ErrorPanel({message: 'Пожалуйста попробуйте ещё раз или перезагрузите страницу'});
                        this.$el.append(errorPanel.render().el);
                    }
                }).bind(this)
            });
        },

    };
	return Backbone.View.extend(RegistryBuildingView);
});