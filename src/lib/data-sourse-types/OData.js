import buildQuery from 'odata-query';

export default class OData {
    constructor(props) {
        this.props = props;
    }

    getExpand(meta) {
        var expand = meta.columns.filter(e => e.dataSource && e.dataSource.path)
            .map(e => e.dataSource.path.slice(0, e.dataSource.path.length - 1).reduce((path, a) => path + '/' + a));
        return expand.length === 0
            ? null
            : expand;
    }

    getSelect(meta) {
        return meta.columns
            .map(e => e.dataSource && e.dataSource.path ? e.dataSource.path.reduce((path, a) => path + '/' + a) : e.name);
    }

    getByName = (list, name) => {
        return list.filter(e => e.name === name)[0];
    }

    getOrderBy(meta, data) {
        var orderedColumns = [];
        for (var name in data.orders) {
            var columnMeta = this.getByName(meta.columns, name);
            if (data.orders[name] !== undefined) {
                orderedColumns.push({meta: columnMeta, order: data.orders[name] === 'desc' ? ' desc' : ''});
            }
        }
        return orderedColumns.length === 0
            ? null
            : orderedColumns
                .map(e => e.meta.dataSource && e.meta.dataSource.path ? e.meta.dataSource.path.reduce((path, a) => path + '/' + a) + e.order: e.meta.name + e.order);
    }

    getFilter(meta, data, props) {
        var filters = [];
        for (var name in data.filters) {
            if (data.filters[name] !== null && data.filters[name] !== undefined) {
                var m = this.getByName(meta.filters, name);
                var f = (m.dataSource || {}).func || this.props.globalMeta.filters[m.type] || this.props.globalMeta.filters[this.props.globalMeta.filters.default];
                filters.push(f(name, data.filters[name]));
            }
        }
        if (meta.propsFilters && props) {
            filters = [...filters, meta.propsFilters(props)];
        }
        return filters.length === 0
            ? null
            : filters;
    }

    getFilterForQueryUrl = (meta, data, props) => {
        const filter = this.getFilter(meta, data, props);
        const query = buildQuery({ filter });
        return query;
    };

    getList(needCount, meta, data, globalMeta, callbackFunc, props) {
        const path = meta.dataSource.path || this.props.globalMeta.basePath + '/' + meta.dataSource.shortPath;
        const count = needCount;
        const top = data.paging && data.paging.perPage;
        const skip = data.paging && data.paging.perPage * data.paging.page;
        const filter = this.getFilter(meta, data, props);
        const expand = this.getExpand(meta);
        const select = meta.dataSource.selectAll ? null : this.getSelect(meta);
        const orderBy = this.getOrderBy(meta, data);
        if (needCount && this.props.globalMeta.separateQueryForCount)
        {
            var cf = (countValue) => this.fetchQuery(path, { select, expand, filter, top, skip, orderBy, format: this.props.globalMeta.format }, (value) => callbackFunc({...value, count: countValue.count}));
            this.fetchQuery(path, { count, filter, format: this.props.globalMeta.format }, cf);
        }
        else {
            this.fetchQuery(path, { count, select, expand, filter, top, skip, orderBy, format: this.props.globalMeta.format }, callbackFunc);
        }
    }

    fetchQuery(path, queryProps, callbackFunc) {
        var query = buildQuery(queryProps);
        this.props.globalMeta.get(`${path}${query}`, data => {
            var value = {};
            if (data["@odata.count"] !== undefined)
            {
                value.count = data["@odata.count"];
            }
            if (data.value !== undefined)
            {
                value.items = data.value;
            }
            callbackFunc(value);
        }, () => {callbackFunc(null)});
    }

    getLongSelect(props, inputValue, callback) {
        let filter = null;
        if (Array.isArray(inputValue)) {
            filter = {or: inputValue.map(function (e) {return { [props.componentMeta.dataSource.key]: e };})}
        } else {
            filter = props.componentMeta.dataSource.sourceFunc ? props.componentMeta.dataSource.sourceFunc(inputValue) : {[`tolower(${props.componentMeta.dataSource.value})`]: { contains: inputValue == null ? null : inputValue.toLowerCase()}}
            var top = props.componentMeta.dataSource.count === null ? undefined : (props.componentMeta.dataSource.count || 10);
        }
        const format = this.props.globalMeta.format;
        const orderBy = props.componentMeta.dataSource.order || props.componentMeta.dataSource.value;
        const query = buildQuery({ filter, top, format, orderBy });
        this.props.globalMeta.get(`${props.componentMeta.dataSource.path || this.props.globalMeta.basePath + '/' + props.componentMeta.dataSource.shortPath}${query}`, data => {
            callback(data.value.map(function (v) { return { 
                label: props.componentMeta.dataSource.labelFunc ? props.componentMeta.dataSource.labelFunc(v) : v[props.componentMeta.dataSource.value], 
                value: v[props.componentMeta.dataSource.key], 
                extraData: v } }));
        });
    }
}