import React from 'react';

import OData from '../data-sourse-types/OData';
import Local from '../data-sourse-types/Local';
import {Storages} from './Storages';

import {get} from '../data-sourse-types/Fetch'

import AddressBarParsHolder from '../pars-holders/AddressBarParsHolder';

import List from '../default-ui/List';
import TextField from '../default-ui/TextField';
import LongSelect from '../default-ui/LongSelect';
import ShortSelect from '../default-ui/ShortSelect';
import LongProcessPanel from '../default-ui/LongProcessPanel.js';
import FilterPanel from '../default-ui/FilterPanel';
import DateField from '../default-ui/DateField';
import DatePeriodField from '../default-ui/DatePeriodField';

import ErrorPanel, { errorHandler } from '../default-ui/ErrorPanel';

import {modifierKeys} from '../core/modifier-keys';

import moment from "moment";
import "moment/locale/ru";
moment.locale("ru");

export default {
    components: {
        list: {component: List},
        filterPanel: {component: FilterPanel},
        longProcessPanel: {component: LongProcessPanel},
        errorPanel: {component: ErrorPanel, props: {title: 'Что-то пошло не так ...'}}
    },
    paging: {
        perPage: 10,
        perPageOptions: [10, 100],
        props: {
            labelRowsPerPage: "Показывать по: ",
            labelDisplayedRows: ({ from, to, count }) => `${from}-${to} из ${count}`
        }
    },
    parsHolderTypes: {
        addressBar: {
            class: AddressBarParsHolder,
            filters: {
                string: {serialize: (value) => JSON.stringify(value), deserialize: (value) => JSON.parse(value)},
                default: 'string'
            }
        },
        default: 'addressBar'
    },
    dataSourceTypes: {
        odata: {
            class: OData,
            format: 'json',
            debounceInterval: 200,
            //separateQueryForCount: true,
            filters: {
                string: (name, value) => {return {[name]: value}},
                text: (name, value) => {return value == null ? null : {[`tolower(${name})`]: { contains: value.toLowerCase()}}},
                date: (name, value) => {return value == null ? null : `${name} eq ${moment(value).format("YYYY-MM-DD") + "T00:00:00Z"}`},
                dateperiod: (name, value) => {
                    if (value == null || (value.from == null && value.till == null)) return null;
                    let r = [];
                    if (value.from != null) r.push(`${name} ge ${moment(value.from).format("YYYY-MM-DD") + "T00:00:00Z"}`);
                    if (value.till != null) r.push(`${name} le ${moment(value.till).format("YYYY-MM-DD") + "T00:00:00Z"}`);
                    return r;
                },
                number: (name, value) => {return {[name]: Number(value)}},
                longselect: (name, value) => {
                    return Array.isArray(value)
                        ? {or: value.map(function (e) {return { [name]: e };})}
                        : {[name]: value}
                },
                default: 'string'
            },
            basePath: 'https://services.odata.org/V4/Northwind/Northwind.svc',
            get: (url, callback, errorCallback) => get(url, {}, callback, (error) => {errorHandler(error); if (errorCallback) errorCallback(error);})
        },
        local: {
            class: Local,
            storages: Storages,
            expands: {
                Order_Details: [
                    {name: 'Product', expandStorage: 'Products', func: (expandItem, item) => expandItem.ProductID === item.ProductID}
                ]
            },
            filters: {
                string: (itemValue, filterValue) => !filterValue ? true : itemValue === filterValue,
                text: (itemValue, filterValue) => !filterValue ? true : !itemValue ? false : itemValue.toLowerCase().indexOf(filterValue.toLowerCase()) !== -1,
                dateperiod: (itemValue, filterValue) => !filterValue || (!filterValue.from && !filterValue.till) 
                    ? true
                    : !itemValue || (filterValue.from && filterValue.from > moment(itemValue)) || (filterValue.till && filterValue.till < moment(itemValue)) 
                        ? false
                        : true,
                number: (itemValue, filterValue) => !filterValue ? true : itemValue === filterValue,
                longselect: (itemValue, filterValue) => {
                    return (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) 
                        ? true 
                        : Array.isArray(filterValue)
                            ? filterValue.some(e => e === itemValue)
                            : filterValue === itemValue;
                },
                default: 'string'
            },
        },
        default: 'odata'
    },
    filterTypes: {
        string: {component: TextField, debounce: true},
        longselect: {component: LongSelect, props: {loadingMessage: () => "...", noOptionsMessage: () => "По заданному тексту не найдено значений ..."}},
        shortselect: {component: ShortSelect},
        date: {component: DateField, props: {invalidDateMessage: 'Неверный формат даты'}},
        dateperiod: {component: DatePeriodField, props: {invalidDateMessage: 'Неверный формат даты'}, 
            setFromColumn: (value, item, event, current) => {return modifierKeys.altRight ? {from: current && current.from, till: moment(value)} : {from: moment(value), till: current && current.till}}},
        default: 'string'
    },
    columnTypes: {
        date: {renderFunc: (name, value) => {return moment(value).format("DD.MM.YYYY")}},
        number: {renderFunc: (name, value) => {return <div style={{width: '100%', textAlign: 'right'}}>{value}</div>}}
    },
    types: {
        Date: {columnType: 'date'}
    },
    filters: {
        //label: true,
        placeholder: true
    },
    columns: {
        filterSetFromColumn: {default: true, altKey: true}
    }
}