'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _OData = require('./data-sourse-types/OData');

var _OData2 = _interopRequireDefault(_OData);

var _Local = require('./data-sourse-types/Local');

var _Local2 = _interopRequireDefault(_Local);

var _Fetch = require('./data-sourse-types/Fetch');

var _AddressBarParsHolder = require('./pars-holders/AddressBarParsHolder');

var _AddressBarParsHolder2 = _interopRequireDefault(_AddressBarParsHolder);

var _List = require('./default-ui/List');

var _List2 = _interopRequireDefault(_List);

var _Card = require('./default-ui/Card');

var _Card2 = _interopRequireDefault(_Card);

var _TextField = require('./default-ui/TextField');

var _TextField2 = _interopRequireDefault(_TextField);

var _LongSelect = require('./default-ui/LongSelect');

var _LongSelect2 = _interopRequireDefault(_LongSelect);

var _ShortSelect = require('./default-ui/ShortSelect');

var _ShortSelect2 = _interopRequireDefault(_ShortSelect);

var _LongProcessPanel = require('./default-ui/LongProcessPanel.js');

var _LongProcessPanel2 = _interopRequireDefault(_LongProcessPanel);

var _FilterPanel = require('./default-ui/FilterPanel');

var _FilterPanel2 = _interopRequireDefault(_FilterPanel);

var _DateField = require('./default-ui/DateField');

var _DateField2 = _interopRequireDefault(_DateField);

var _DatePeriodField = require('./default-ui/DatePeriodField');

var _DatePeriodField2 = _interopRequireDefault(_DatePeriodField);

var _ErrorPanel = require('./default-ui/ErrorPanel');

var _ErrorPanel2 = _interopRequireDefault(_ErrorPanel);

var _CircularProgress = require('@material-ui/core/CircularProgress');

var _CircularProgress2 = _interopRequireDefault(_CircularProgress);

var _modifierKeys = require('./core/modifier-keys');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

require('moment/locale/ru');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

_moment2.default.locale("ru");

exports.default = {
    components: {
        list: { component: _List2.default },
        card: { component: _Card2.default },
        filterPanel: { component: _FilterPanel2.default },
        longProcessPanel: { component: _LongProcessPanel2.default },
        errorPanel: { component: _ErrorPanel2.default, props: { title: 'Что-то пошло не так ...' } }
    },
    paging: {
        perPage: 10,
        perPageOptions: [10, 100],
        props: {
            labelRowsPerPage: "Показывать по: ",
            labelDisplayedRows: function labelDisplayedRows(_ref) {
                var from = _ref.from,
                    to = _ref.to,
                    count = _ref.count;
                return from + '-' + to + ' \u0438\u0437 ' + count;
            }
        }
    },
    parsHolderTypes: {
        addressBar: {
            class: _AddressBarParsHolder2.default,
            filters: {
                string: { serialize: function serialize(value) {
                        return JSON.stringify(value);
                    }, deserialize: function deserialize(value) {
                        return JSON.parse(value);
                    } },
                default: 'string'
            }
        },
        default: 'addressBar'
    },
    dataSourceTypes: {
        odata: {
            class: _OData2.default,
            format: 'json',
            debounceInterval: 200,
            //separateQueryForCount: true,
            filters: {
                string: function string(name, value) {
                    return _defineProperty({}, name, value);
                },
                text: function text(name, value) {
                    return value == null ? null : _defineProperty({}, 'tolower(' + name + ')', { contains: value.toLowerCase() });
                },
                date: function date(name, value) {
                    return value == null ? null : name + ' eq ' + ((0, _moment2.default)(value).format("YYYY-MM-DD") + "T00:00:00Z");
                },
                dateperiod: function dateperiod(name, value) {
                    if (value == null || value.from == null && value.till == null) return null;
                    var r = [];
                    if (value.from != null) r.push(name + ' ge ' + ((0, _moment2.default)(value.from).format("YYYY-MM-DD") + "T00:00:00Z"));
                    if (value.till != null) r.push(name + ' le ' + ((0, _moment2.default)(value.till).format("YYYY-MM-DD") + "T00:00:00Z"));
                    return r;
                },
                number: function number(name, value) {
                    return _defineProperty({}, name, Number(value));
                },
                longselect: function longselect(name, value) {
                    return Array.isArray(value) ? { or: value.map(function (e) {
                            return _defineProperty({}, name, e);
                        }) } : _defineProperty({}, name, value);
                },
                default: 'string'
            },
            basePath: 'https://services.odata.org/V4/Northwind/Northwind.svc',
            get: function get(url, callback, errorCallback) {
                return (0, _Fetch.get)(url, {}, callback, function (error) {
                    (0, _ErrorPanel.errorHandler)(error);if (errorCallback) errorCallback(error);
                });
            }
        },
        local: {
            class: _Local2.default,
            filters: {
                string: function string(itemValue, filterValue) {
                    return !filterValue ? true : itemValue === filterValue;
                },
                text: function text(itemValue, filterValue) {
                    return !filterValue ? true : !itemValue ? false : itemValue.toLowerCase().indexOf(filterValue.toLowerCase()) !== -1;
                },
                dateperiod: function dateperiod(itemValue, filterValue) {
                    return !filterValue || !filterValue.from && !filterValue.till ? true : !itemValue || filterValue.from && filterValue.from > (0, _moment2.default)(itemValue) || filterValue.till && filterValue.till < (0, _moment2.default)(itemValue) ? false : true;
                },
                number: function number(itemValue, filterValue) {
                    return !filterValue ? true : itemValue === filterValue;
                },
                longselect: function longselect(itemValue, filterValue) {
                    return !filterValue || Array.isArray(filterValue) && filterValue.length === 0 ? true : Array.isArray(filterValue) ? filterValue.some(function (e) {
                        return e === itemValue;
                    }) : filterValue === itemValue;
                },
                default: 'string'
            }
        },
        default: 'odata'
    },
    filterTypes: {
        string: { component: _TextField2.default, debounce: true },
        longselect: { component: _LongSelect2.default, props: { loadingMessage: function loadingMessage() {
                    return _react2.default.createElement(_CircularProgress2.default, { style: { margin: 5 } });
                }, noOptionsMessage: function noOptionsMessage() {
                    return "По заданному тексту не найдено значений ...";
                } } },
        shortselect: { component: _ShortSelect2.default },
        date: { component: _DateField2.default, props: { invalidDateMessage: 'Неверный формат даты' } },
        dateperiod: { component: _DatePeriodField2.default, props: { invalidDateMessage: 'Неверный формат даты' },
            setFromColumn: function setFromColumn(value, item, event, current) {
                return _modifierKeys.modifierKeys.altRight ? { from: current && current.from, till: (0, _moment2.default)(value) } : { from: (0, _moment2.default)(value), till: current && current.till };
            } },
        default: 'string'
    },
    fieldTypes: {
        string: { component: _TextField2.default },
        date: { component: _DateField2.default },
        longselect: { component: _LongSelect2.default, props: { loadingMessage: function loadingMessage() {
                    return _react2.default.createElement(_CircularProgress2.default, { style: { margin: 5 } });
                }, noOptionsMessage: function noOptionsMessage() {
                    return "По заданному тексту не найдено значений ...";
                } } },
        default: 'string'
    },
    columnTypes: {
        date: { renderFunc: function renderFunc(name, value) {
                return (0, _moment2.default)(value).format("DD.MM.YYYY");
            } },
        number: { renderFunc: function renderFunc(name, value) {
                return _react2.default.createElement(
                    'div',
                    { style: { width: '100%', textAlign: 'right' } },
                    value
                );
            } }
    },
    types: {
        Date: { columnType: 'date' }
    },
    filters: {
        //label: true,
        placeholder: true
    },
    fields: {
        label: true
        //placeholder: true
    },
    columns: {
        filterSetFromColumn: { default: true, altKey: true }
    }
};