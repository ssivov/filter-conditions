import fecha from "fecha";

import { Filter, FilterValue, IFilterCondition, IFilterConnective, RangeValue } from "../../types/filter";
import { ConnectiveOperator } from "../connective";
import { FilterDataType } from "../datatype";
import { FilterType, getFilterType } from "../filter";
import { FilterOperator } from "../operator";

export const CosmosDbOperatorStrings: {[key: string]: string} = {
    [FilterOperator.Equals]: '=',
    [FilterOperator.Contains]: 'CONTAINS',
    [FilterOperator.Greater]: '>',
    [FilterOperator.Less]: '<',
    [FilterOperator.GreaterOrEqual]: '>=',
    [FilterOperator.LessOrEqual]: '<=',
    [FilterOperator.IsTrue]: '= TRUE',
    [FilterOperator.IsFalse]: '= FALSE',
    [FilterOperator.IsEmptyString]: ' = ""'
};

export const CosmosDbConnectiveStrings: {[key: string]: string} = {
    [ConnectiveOperator.And]: 'AND',
    [ConnectiveOperator.Or]: 'OR'
};

export const getCosmosDbCondition = (filter: Filter, tableAlias: string): string => {
    const filterType = getFilterType(filter);
    switch (filterType) {
        case FilterType.SingleCondition:
            return getSingleFilterCosmosDbCondition(<IFilterCondition>filter, tableAlias);
        case FilterType.Connective:
            const connectiveFilter = <IFilterConnective>filter;
            const parts = connectiveFilter.filters.map((subFilter: Filter): string => (
                `(${getCosmosDbCondition(subFilter, tableAlias)})`
            ));
            const joinedParts = parts.join(` ${CosmosDbConnectiveStrings[connectiveFilter.operator]} `);
            return connectiveFilter.invert ? `NOT(${joinedParts})` : joinedParts;
        default:
            return "";
    }
};

const getSingleFilterCosmosDbCondition = (filter: IFilterCondition, tableAlias: string): string => {
    const operator = filter.operator;
    const field = `${tableAlias}.${filter.field}`;
    let condition = field;
    let value: FilterValue = null;
    switch (operator) {
        case FilterOperator.Range:
            value = <RangeValue>filter.value;
            const minBoundOperator = CosmosDbOperatorStrings[value.minExclusive ? FilterOperator.Greater : FilterOperator.GreaterOrEqual];
            const maxBoundOperator = CosmosDbOperatorStrings[value.maxExclusive ? FilterOperator.Less : FilterOperator.LessOrEqual];
            const andConnective = CosmosDbConnectiveStrings[ConnectiveOperator.And];
            let minValue = `${value.min}`;
            let maxValue = `${value.max}`;
            if (filter.dataType === FilterDataType.Date) {
                minValue = dateToCosmosDbDateTime(<string | Date>value.min);
                maxValue = dateToCosmosDbDateTime(<string | Date>value.max);
            }
            condition += ` ${minBoundOperator} '${minValue}' ${andConnective} ${field} ${maxBoundOperator} '${maxValue}'`;
            break;
        case FilterOperator.Contains:
            condition = `${CosmosDbOperatorStrings[operator]}(${field}, '${filter.value}')`;
            break;
        default:
            condition += ` ${CosmosDbOperatorStrings[operator]}`;
            if (filter.value !== null) {
                if (filter.dataType === FilterDataType.Number) {
                    condition += ` ${filter.value}`;
                } else {
                    condition += ` '${filter.value}'`;
                }
            }
    }
    if (filter.invert) {
        condition = `NOT(${condition})`;
    }
    return condition;
};

// Even if filter dataType is set to 'Date', it might still be string if object was stringified and then parsed back.
// Date object is stringified into a UTC date string and then is parsed back as a string, instead of getting reconstructed as Date.
const dateToCosmosDbDateTime = (date: Date | string): string => {
    const dateTypeObject: Date = typeof date === "string" ? new Date(date) : date;
    return fecha.format(dateTypeObject, "YYYY-MM-DD HH:mm:ss.SSS");
};
