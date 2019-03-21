import React, { PureComponent } from 'react';
import List from './core/List';
import GlobalMeta from './GlobalMeta'

export default class ListExample extends PureComponent {
    constructor(props) {
        super(props);

        this.meta = {
            columns: [
                {name: 'FirstName', isOrderable: true},
                {name: 'LastName', title: 'Last Name'},
            ],
            key: 'FirstName',
            filters: [
               {name: 'Gender', type: 'shortselect', options: [{key: 'Male'}, {key: 'Female'}], dataSourse: {refresh: 'debounce', type: 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.PersonGender', func: (name, value) => {return `Gender eq Microsoft.OData.Service.Sample.TrippinInMemory.Models.PersonGender'${value}'`}}},
               {name: 'FirstName', type: 'text', dataSourse: {refresh: 'debounce'}}
            ],
            paging: {},
            selectable: {type: 'row', isMulti: false},
            dataSourse: {type: 'odata', shortPath: `People`, selectAll: true}
        };

        /* this.metadata = {
            columns: [
                {name: 'FirstName', isOrderable: true},
                {name: 'LastName', title: 'Last Name'},
            ],
            filters: {
               Gender: {type: 'shortselect', options: [{key: 'Male'}, {key: 'Female'}], dataSourse: {debounceInterval: 200, func: (name, value) => {return `Gender eq Microsoft.OData.Service.Sample.TrippinInMemory.Models.PersonGender'${value}'`}}}
            },
            paging: {},
            dataSourse: {type: 'local', shortPath: `People`}
        }; */

        this.state = {};
    }

    onSelect = (isSelect, lastSelect, allSelect) => {
        console.log(isSelect, lastSelect, allSelect);
    }

    onSingleSelect = (select) => {
        console.log(select);
    }

    render() {
        return <List meta={this.meta} globalMeta={GlobalMeta} onSelect={this.onSelect} onSingleSelect={this.onSingleSelect} />
    }
}

/* this.metadata = {
    columns: [
        {name: 'Name', title: 'Название', isOrderable: true},
        {name: 'State', title: 'Состояние', dataSourse: {path: [, 'Name']}},
        {name: 'PartialPlan', title: 'Частный план', dataSourse: {path: [, 'Name']}},
        {name: 'DateFrom', title: 'Дата начала', type: 'date'},
        {name: 'DateTill', title: 'Дата конца', type: 'date'}
    ],
    filters: [
        {name: 'PartialPlan', title: 'Частный план', type: 'longlist'},
        {name: 'State', title: 'Состояние', type: 'shortlist'}
    ],
    paging: {},
    dataSourse: {type: 'odata', path: `https://dev2.modeus.me/periodplanning/api/CourseUnitRealization`}
}; */

/*
this.metadata = {
            columns: [
                {name: 'CustomerID', title: 'Customer', dataSourse: {path: ['Customer', 'CompanyName']}, isOrderable: true},
                {name: 'EmployeeID', title: 'Employee', dataSourse: {path: ['Employee', 'LastName']}},
                {name: 'OrderDate', type: 'date', isOrderable: true},
                {name: 'ShipName'},
                {name: 'Freight', type: 'number'},
            ],
            filters: {
                CustomerID: {title: 'Заказчик', type: 'longselect', dataSourse: {type: 'odata', shortPath: `Customers`, key: 'CustomerID', value: 'ContactName'}},
                EmployeeID: {type: 'shortselect'}
            },
            paging: {},
            dataSourse: {type: 'odata', shortPath: `Orders`}
        };
*/