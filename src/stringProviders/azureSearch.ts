import { Filter, FilterValue, IFilterCondition, IFilterConnective, RangeValue } from "../../types/filter";
import { ConnectiveOperator } from "../connective";
import { FilterDataType } from "../datatype";
import { FilterType, getFilterType } from "../filter";
import { FilterOperator } from "../operator";

export const AzureSearchOperatorStrings: {[key: string]: string} = {
    [FilterOperator.Equals]: 'eq',
    [FilterOperator.Contains]: 'N/A',
    [FilterOperator.Greater]: 'gt',
    [FilterOperator.Less]: 'lt',
    [FilterOperator.GreaterOrEqual]: 'ge',
    [FilterOperator.LessOrEqual]: 'le',
    [FilterOperator.IsTrue]: 'eq true',
    [FilterOperator.IsFalse]: 'eq false',
    [FilterOperator.IsEmptyString]: ' eq ""',
    [FilterOperator.ArrayContains]: 'N/A'
};

export const AzureSearchConnectiveStrings: {[key: string]: string} = {
    [ConnectiveOperator.And]: 'and',
    [ConnectiveOperator.Or]: 'or'
};

export const getAzureSearchCondition = (filter: Filter): string => {
    const filterType = getFilterType(filter);
    switch (filterType) {
        case FilterType.SingleCondition:
            return getSingleFilterAzureSearchCondition(<IFilterCondition>filter);
        case FilterType.Connective:
            const connectiveFilter = <IFilterConnective>filter;
            const parts = connectiveFilter.filters.map((subFilter: Filter): string => (
                `(${getAzureSearchCondition(subFilter)})`
            ));
            const joinedParts = parts.join(` ${AzureSearchConnectiveStrings[connectiveFilter.operator]} `);
            return connectiveFilter.invert ? `not (${joinedParts})` : joinedParts;
        default:
            return "";
    }
};

const getSingleFilterAzureSearchCondition = (filter: IFilterCondition): string => {
    const operator = filter.operator;
    const field = `${filter.field}`;
    let condition = field;
    let value: FilterValue = null;
    switch (operator) {
        case FilterOperator.Range:
            value = <RangeValue>filter.value;
            const minBoundOperator =
                AzureSearchOperatorStrings[value.minExclusive ? FilterOperator.Greater : FilterOperator.GreaterOrEqual];
            const maxBoundOperator = AzureSearchOperatorStrings[value.maxExclusive ? FilterOperator.Less : FilterOperator.LessOrEqual];
            const andConnective = AzureSearchConnectiveStrings[ConnectiveOperator.And];
            const minValueStr = getValueString(value.min, filter.dataType);
            const maxValueStr = getValueString(value.max, filter.dataType);
            condition += ` ${minBoundOperator} ${minValueStr} ${andConnective} ${field} ${maxBoundOperator} ${maxValueStr}`;
            break;
        case FilterOperator.Contains:
        case FilterOperator.ArrayContains:
            throw new SyntaxError("Contains are not supported for Azure Search");
            break;
        case FilterOperator.FunctionCall:
            throw new SyntaxError("Function Calls are not supported for Azure Search");
        default:
            condition += ` ${AzureSearchOperatorStrings[operator]}`;
            if (filter.value !== null) {
                condition += ` ${getValueString(filter.value, filter.dataType)}`;
            }
    }
    if (filter.invert) {
        condition = `not (${condition})`;
    }
    return condition;
};

// Azure Search requires single quotes for string values, but number values should not be quoted
const getValueString = (value: FilterValue, dataType: FilterDataType): string => {
    switch (dataType) {
        case FilterDataType.Number:
            return `${value}`;
        default:
            return `'${value}'`;
    }
};
