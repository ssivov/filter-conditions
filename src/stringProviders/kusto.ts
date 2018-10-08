import { FilterValue, IFilterCondition, RangeValue } from "../../types";
import { FilterOperator } from "../operator";

export const KustoOperatorStrings: {[key: string]: string} = {
    [FilterOperator.Equals]: '==',
    [FilterOperator.Contains]: 'contains',
    [FilterOperator.Greater]: '>',
    [FilterOperator.Less]: '<',
    [FilterOperator.GreaterOrEqual]: '>=',
    [FilterOperator.LessOrEqual]: '<=',
    [FilterOperator.IsTrue]: '== true',
    [FilterOperator.IsFalse]: '== false',
    [FilterOperator.IsEmptyString]: ' == ""'
};

export let getKustoCondition = (filter: IFilterCondition): string => {
    const operator = filter.operator;
    let condition = `${filter.field}`;
    let value: FilterValue = null;
    switch (filter.operator) {
        case FilterOperator.Range:
            value = <RangeValue>filter.value;
            const lessOrEqual = KustoOperatorStrings[FilterOperator.LessOrEqual];
            const greaterOrEqual = KustoOperatorStrings[FilterOperator.GreaterOrEqual];
            condition += ` ${greaterOrEqual} ${value.min} and ${filter.value} ${lessOrEqual} ${value.max}`;
            break;
        default:
            condition += ` ${KustoOperatorStrings[operator]}`;
            if (filter.value !== null) {
                condition += ` "filter.value"`;
            }
    }
    if (filter.invert) {
        condition = `not(${condition})`;
    }
    return condition;
};
