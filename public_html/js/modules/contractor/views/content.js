define(['jquery', 'underscore', 'backbone', '../templates/compile/contractor', 'services/auth', '../models/contractor', '../../common/views/content-loader', './contractor-person', './contractor-person-add', 'config', 'bootstrap'], function($, _, Backbone, JST, Auth, ContractorsCollection, ContentLoader, ContractorPerson, ContractorPersonAdd, config) {
	return Backbone.View.extend({
		className: 'animated fadeIn',
		events: {
			'click a': function(e) {
				e.preventDefault();
			},
            'click': function(e) {
                var $el = $(e.target);
                if(!$el.hasClass('bb_slider') && !$el.hasClass('slideMenu') && !$el.parent().hasClass('bb_slider') && !$el.closest('.slideMenu__item').length && !$el.hasClass('slideMenu__item')) {
                    if( this.$('.slideMenu').hasClass('active')) {
                        this.$('.slideMenu').removeClass('active');
                    }
                }
            },
			'click .bb-logout-btn': function() {
				var app = require("app");
				app.navigate('#logout', {trigger: true});
			},
            'click .bb_slider': function() {
                this.$('.slideMenu ').toggleClass('active');
            },
            'click .bb_edit_contractor' : function(e) {
                e.preventDefault();
                $('.tooltip').remove();
                var addCompany = $("#addContractor");
                addCompany.find('.modal__heading').text('Изменить подрядчика');
                addCompany.modal('show');
                _.forEach(_.keys(this.model.attributes), function(key) {
                    if($.isPlainObject(this.model.get(key))) {
                        _.forEach(_.keys(this.model.get(key)), function(inputKey) {
                            addCompany.find('[name="' + key + '_' + inputKey + '"]').val(this.model.get(key)[inputKey]).closest('label').addClass('filled');
                            addCompany.find('[name="' + inputKey + '"]').val(this.model.get(key)[inputKey]).closest('label').addClass('filled');
                        }, this);
                    }
                    addCompany.find('[name="' + key + '"]').val(this.model.attributes[key]).closest('label').addClass('filled');

                }, this);
                addCompany.find('.bb_save_company').data("id", this.model.attributes.id);
                if(this.model.get('avatar')) {
                    var img = $('<img />').addClass('bb_img').attr('src', this.model.get('avatar'));
                    addCompany.find('.bb_img').remove();
                    addCompany.find('.bb_picture').removeClass('none').append(img);
                    addCompany.find('.bb_dropbox').find('.dropbox__title').addClass('none');
                    addCompany.find('.bb_dropbox').find('.dropbox__pic').addClass('none');
                }
                else {
                    addCompany.find('.bb_img').remove();
                    addCompany.find('.bb_dropbox').find('.dropbox__title').removeClass('none');
                    addCompany.find('.bb_dropbox').find('.dropbox__pic').removeClass('none');
                }
            },
            'click .bb_add_employee': function(e) {
                e.preventDefault();
                var addEmployee = $("#addContractorPerson");
                addEmployee.find('.bb_save').data("id", null);
                addEmployee.find('.bb_title_person_add').text('Добавить контактное лицо');
                addEmployee.find('.bb_modal_code').addClass('none');
                addEmployee.modal('show');
            },

            'click .bb_contractors_list': function(e) {
                var app = require("app");
                app.navigate('#contractors', {trigger:true});
            },
            'click .bb_sort_employee': function(e) {
                e.preventDefault();
                var $el = $(e.currentTarget);
                var strategy = $el.data().sortProperty;
                if(strategy) {
                    this.$('.bb_sort_up').removeClass('none');
                    this.$('.bb_sort_down').removeClass('none');
                    if(!$el.data().direction.length) {
                        strategy = strategy + 'Asc';
                        $el.data('direction', 'Desc');
                        $el.find('.bb_sort_up').removeClass('none');
                        $el.find('.bb_sort_down').addClass('none');

                    }
                    else if($el.data().direction == 'Desc'){
                        strategy = strategy + 'Desc';
                        $el.data('direction', 'Asc');
                        $el.find('.bb_sort_up').addClass('none');
                        $el.find('.bb_sort_down').removeClass('none');
                    }
                    else {
                        strategy = strategy + 'Asc';
                        $el.data('direction', 'Desc');
                        $el.find('.bb_sort_up').removeClass('none');
                        $el.find('.bb_sort_down').addClass('none');
                    }
                    if (strategy) {
                        this.collection.changeSort(strategy);
                        this.collection.sort();
                        this.$('.bb_employees').empty();
                        this.renderEmployeesList();
                    }
                }
            }
		},
		initialize: function(options) {
			this.childViews = [];
			this.template = JST['contractor-content'];
            this.contractor_id = options.contractor_id;
            this.channel = options.channel;
            this.listenTo(this.channel.vent, 'change:contractor:info', function(model) {
                this.model = model;
                this.render();
                this.afterRender();
            }, this);
           // change:contractor:info
		},
		processData: function() {
			var data = this.model.toJSON();
            data.user = Auth.infoModel.toJSON();
			return data;
		},
		render: function() {
			this.$el.html(this.template(this.processData()));

			return this;
		},
		afterRender: function() {
            this.renderEmployeesList();
            this.initTooltip();
            this.renderContractorAdd();
            this.renderContractorPersonAdd();
            //var loader = new ContentLoader();
            //$('body').append(loader.render().el);
		},
        renderEmployeesList: function() {

            var fragment = document.createDocumentFragment();
            this.collection.forEach(function(item) {
                var contractor = new ContractorPerson({channel: this.channel, model: item});
                fragment.appendChild(contractor.render().el);
            }, this);

            this.$('.bb_employees').append(fragment);
        },
        renderContractorPersonAdd: function() {
            var contractorPersonAdd = new ContractorPersonAdd({channel: this.channel, type: 'contractorPersonAdd', contractor_id: this.contractor_id, collection: this.collection});
            this.childViews.push(contractorPersonAdd);
            $('body').append(contractorPersonAdd.render().el);
         //   contractorPersonAdd.afterRender();
        },
        renderContractorAdd: function() {
            var contractorAdd = new ContractorAdd({channel: this.channel, type: 'contractorAdd'});
            this.childViews.push(contractorAdd);
            $('body').append(contractorAdd.render().el);
            contractorAdd.afterRender();
        },
        initTooltip: function() {
            setTimeout(function () {
                $('[data-toggle="tooltip"]').tooltip({
                        container: 'body'
                    }
                );
            }, 300);

        }
	});
});




