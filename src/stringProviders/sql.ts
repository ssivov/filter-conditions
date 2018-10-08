import { FilterValue, IFilterCondition, RangeValue } from "../../types";
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

export let getSqlCondition = (filter: IFilterCondition): string => {
    const operator = filter.operator;
    let condition = `${filter.field}`;
    let value: FilterValue = null;
    switch (filter.operator) {
        case FilterOperator.Range:
            value = <RangeValue>filter.value;
            const minBound = SqlOperatorStrings[value.minExclusive ? FilterOperator.Greater : FilterOperator.GreaterOrEqual];
            const maxBound = SqlOperatorStrings[value.maxExclusive ? FilterOperator.Less : FilterOperator.LessOrEqual];
            condition += ` ${minBound} ${value.min} AND ${maxBound} ${value.max}`;
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
