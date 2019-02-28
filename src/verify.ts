import { IFilterCondition, IFilterConnective, RangeValue, SingleValue } from "../types/filter";
import { ConnectiveOperator } from "./connective";
import { FilterDataType } from "./datatype";
import { FilterOperator } from "./operator";

import isNumber from "is-number";

export const isValidConnective = (connective: IFilterConnective): boolean => {
    return (
        !!connective
        && connective.operator in ConnectiveOperator
        && connective.filters
        && connective.filters.length > 0
    );
};

// High-level filter condition sanitizing
// This could be useful when building a filter condition from users' input in the UI
export const isValidFilterCondition = (condition: IFilterCondition): boolean => {
    return (
        !!condition
        && condition.dataType in FilterDataType
        && condition.operator in FilterOperator
        && isValueValid(condition)
    );
};

const isValueValid = (condition: IFilterCondition): boolean => {
    if (isValueRequired(condition.operator)) {
        if (condition.operator === FilterOperator.FunctionCall) {
            return condition.dataType === FilterDataType.Other && Array.isArray(condition.value);
        } else if (condition.operator === FilterOperator.Range) {
            return isValidRangeValue(condition.dataType, <RangeValue>condition.value);
        } else {
            return isValidSingleValue(condition.dataType, <SingleValue>condition.value);
        }
    }
    return true;
};

const isValidSingleValue = (dataType: FilterDataType, value: SingleValue): boolean => {
    switch (dataType) {
        case FilterDataType.String:
            return typeof value === "string";
        case FilterDataType.Number:
            return isNumber(value);
        case FilterDataType.Boolean:
            return typeof value === "boolean";
        case FilterDataType.Date:
            return value instanceof Date && value.toString() !== "Invalid Date";
        case FilterDataType.Other:
            return true;
        default:
            return false;
    }
};

const isValidRangeValue = (rangeDataType: FilterDataType, value: RangeValue): boolean => {
    const valueIsRangeObject =  (
        typeof value === "object"
            && "min" in value
            && "max" in value
    );
    return (
        valueIsRangeObject
        ? isValidSingleValue(rangeDataType, value.min) && isValidSingleValue(rangeDataType, value.max)
        : false
    );
};

const isValueRequired = (operator: FilterOperator): boolean => {
    switch (operator) {
        case FilterOperator.IsTrue:
        case FilterOperator.IsFalse:
        case FilterOperator.IsEmptyString:
            return false;
        default:
            return true;
    }
};
