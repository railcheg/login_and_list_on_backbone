define(['jquery', 'underscore', 'backbone', 'config', 'moment', '../../../services/helper'], function ($, _, Backbone, config, moment, helper) {
    return Backbone.Collection.extend({
        url: function () {
            return this.instanceUrl;
        },

        initialize: function (attr, param) {

        },
        parse: function (data) {
            if(helper.isHousesTypeIsVillage(this.hoaModel)) {
                _.each(data, function (elem) {
                    elem.old_id = elem.id;
                    if(elem.id) {
                        elem.id = elem.id.toString() + '_' +  elem.apartment_id.toString();
                    }
                    else {
                        elem.id = elem.apartment_id.toString();
                    }
                });
            }
            return data;
        },
        changeSort: function (sortProperty, houses_type) {
            this.houses_type = houses_type;
            this.comparator = this.strategies[sortProperty];
        },
        strategies: {
            sortDesc: function (a, b) {
                var aFloat = 0,
                    bFloat = 0;
                var aValue,
                    bValue;

                if(this.houses_type === 'town') {
                    aValue = a.get('apartment');
                    bValue = b.get('apartment');
                }
                else {
                    aValue = a.get('house');
                    bValue = b.get('house');
                }


                aFloat = parseFloat(aValue);
                bFloat = parseFloat(bValue);
                if (!aFloat && !bFloat) {
                    aFloat = (aValue) ? aValue.toLowerCase() : '';
                    bFloat = (bValue) ? bValue.toLowerCase() : '';
                }
                else if (!aFloat && aFloat !== 0) {
                    return -1;
                }
                else if (!bFloat && bFloat !== 0) {
                    return 1;
                }
                else if (aFloat === bFloat) {
                    if (!Number(aValue)) {
                        return -1;
                    }
                    else if (!Number(bValue)) {
                        return 1;
                    }

                }

                if (aFloat > bFloat) return -1; // before
                if (bFloat > aFloat) return 1; // after
                return 0;
            },
            sortAsc: function (a, b) {
                var aFloat = 0,
                    bFloat = 0;
                var aValue,
                    bValue;

                if(this.houses_type === 'town') {
                    aValue = a.get('apartment');
                    bValue = b.get('apartment');
                }
                else {
                    aValue = a.get('house');
                    bValue = b.get('house');
                }

                aFloat = parseFloat(aValue);
                bFloat = parseFloat(bValue);

                if (!aFloat && !bFloat) {
                    aFloat = (aValue) ? aValue.toLowerCase() : '';
                    bFloat = (bValue) ? bValue.toLowerCase() : '';
                }
                else if (!aFloat && aFloat !== 0) {
                    return 1;
                }
                else if (!bFloat && bFloat !== 0) {
                    return -1;
                }
                else if (aFloat === bFloat) {
                    if (!Number(aValue)) {
                        return 1;
                    }
                    else if (!Number(bValue)) {
                        return -1;
                    }

                }

                if (aFloat < bFloat) return -1; // before
                if (bFloat < aFloat) return 1; // after
                return 0;
            }
        }

    });
});


