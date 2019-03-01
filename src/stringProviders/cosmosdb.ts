import { Filter, FilterValue, IFilterCondition, IFilterConnective, RangeValue, SingleValue } from "../../types/filter";
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
            const minValueStr = getValueString(value.min, filter.dataType);
            const maxValueStr = getValueString(value.max, filter.dataType);
            condition += ` ${minBoundOperator} ${minValueStr} ${andConnective} ${field} ${maxBoundOperator} ${maxValueStr}`;
            break;
        case FilterOperator.Contains:
            condition = `${CosmosDbOperatorStrings[operator]}(${field}, '${filter.value}')`;
            break;
        case FilterOperator.FunctionCall:
            condition = `udf.${filter.field}(${(<SingleValue[]>filter.value).join(',')})`;
            break;
        default:
            condition += ` ${CosmosDbOperatorStrings[operator]}`;
            if (filter.value !== null) {
                condition += ` ${getValueString(filter.value, filter.dataType)}`;
            }
    }
    if (filter.invert) {
        condition = `NOT(${condition})`;
    }
    return condition;
};

// CosmosDB is requires single quotes for string values, but number values should not be quoted
const getValueString = (value: FilterValue, dataType: FilterDataType): string => {
    switch (dataType) {
        case FilterDataType.Number:
            return `${value}`;
        default:
            return `'${value}'`;
    }
};
