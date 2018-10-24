import { Filter, FilterValue, IFilterCondition, IFilterConnective, RangeValue } from "../../types/filter";
import { ConnectiveOperator } from "../connective";
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
            return parts.join(` ${SqlConnectiveStrings[connectiveFilter.operator]} `);
        default:
            return "";
    }
};

const getSingleFilterSqlCondition = (filter: IFilterCondition): string => {
    const operator = filter.operator;
    let condition = `${filter.field}`;
    let value: FilterValue = null;
    switch (filter.operator) {
        case FilterOperator.Range:
            value = <RangeValue>filter.value;
            const minBound = SqlOperatorStrings[value.minExclusive ? FilterOperator.Greater : FilterOperator.GreaterOrEqual];
            const maxBound = SqlOperatorStrings[value.maxExclusive ? FilterOperator.Less : FilterOperator.LessOrEqual];
            const andConnective = SqlConnectiveStrings[ConnectiveOperator.And];
            condition += ` ${minBound} ${value.min} ${andConnective} ${filter.field} ${maxBound} ${value.max}`;
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
