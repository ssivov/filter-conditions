import fecha from "fecha";

import { Filter, FilterValue, IFilterCondition, IFilterConnective, RangeValue } from "../../types/filter";
import { ConnectiveOperator } from "../connective";
import { FilterDataType } from "../datatype";
import { FilterType, getFilterType } from "../filter";
import { FilterOperator } from "../operator";

export const SqlOperatorStrings: {[key: string]: string} = {
    [FilterOperator.Equals]: '=',
    [FilterOperator.Contains]: 'LIKE',
    [FilterOperator.Greater]: '>',
    [FilterOperator.Less]: '<',
    [FilterOperator.GreaterOrEqual]: '>=',
    [FilterOperator.LessOrEqual]: '<=',
    [FilterOperator.IsTrue]: '= TRUE',
    [FilterOperator.IsFalse]: '= FALSE',
    [FilterOperator.IsEmptyString]: ' = ""'
};

export const SqlConnectiveStrings: {[key: string]: string} = {
    [ConnectiveOperator.And]: 'AND',
    [ConnectiveOperator.Or]: 'OR'
};

export const getSqlCondition = (filter: Filter): string => {
    const filterType = getFilterType(filter);
    switch (filterType) {
        case FilterType.SingleCondition:
            return getSingleFilterSqlCondition(<IFilterCondition>filter);
        case FilterType.Connective:
            const connectiveFilter = <IFilterConnective>filter;
            const parts = connectiveFilter.filters.map((subFilter: Filter): string => (
                `(${getSqlCondition(subFilter)})`
            ));
            const joinedParts = parts.join(` ${SqlConnectiveStrings[connectiveFilter.operator]} `);
            return connectiveFilter.invert ? `NOT(${joinedParts})` : joinedParts;
        default:
            return "";
    }
};

const getSingleFilterSqlCondition = (filter: IFilterCondition): string => {
    const operator = filter.operator;
    let condition = `${filter.field}`;
    let value: FilterValue = null;
    switch (filter.operator) {
        case FilterOperator.FunctionCall:
            // unsupported for SQL, returning true for this condition
            throw new SyntaxError("Function Calls are not supported for SQL");
        case FilterOperator.Range:
            value = <RangeValue>filter.value;
            const minBoundOperator = SqlOperatorStrings[value.minExclusive ? FilterOperator.Greater : FilterOperator.GreaterOrEqual];
            const maxBoundOperator = SqlOperatorStrings[value.maxExclusive ? FilterOperator.Less : FilterOperator.LessOrEqual];
            const andConnective = SqlConnectiveStrings[ConnectiveOperator.And];
            let minValue = `${value.min}`;
            let maxValue = `${value.max}`;
            if (filter.dataType === FilterDataType.Date) {
                minValue = dateToSqlDateTime(<string | Date>value.min);
                maxValue = dateToSqlDateTime(<string | Date>value.max);
            }
            condition += ` ${minBoundOperator} '${minValue}' ${andConnective} ${filter.field} ${maxBoundOperator} '${maxValue}'`;
            break;
        case FilterOperator.Contains:
            condition += ` ${SqlOperatorStrings[operator]} '%${filter.value}%'`;
            break;
        default:
            condition += ` ${SqlOperatorStrings[operator]}`;
            if (filter.value !== null) {
                condition += ` '${filter.value}'`;
            }
    }
    if (filter.invert) {
        condition = `NOT(${condition})`;
    }
    return condition;
};

// Even if filter dataType is set to 'Date', it might still be string if object was stringified and then parsed back.
// Date object is stringified into a UTC date string and then is parsed back as a string, instead of getting reconstructed as Date.
const dateToSqlDateTime = (date: Date | string): string => {
    const dateTypeObject: Date = typeof date === "string" ? new Date(date) : date;
    return fecha.format(dateTypeObject, "YYYY-MM-DD HH:mm:ss.SSS");
};
