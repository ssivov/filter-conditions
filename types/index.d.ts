import { FilterDataType } from "../src/datatype";
import { FilterOperator } from "../src/operator";
import { IFilterCondition } from "./filter";

interface IFilterConditionEnums {
    FilterDataType: FilterDataType;
    FilterOperator: FilterOperator;
}

declare const isValidFilterCondition: (condition: IFilterCondition) => boolean;

export * from "./filter";

export { FilterDataType, FilterOperator, isValidFilterCondition };
