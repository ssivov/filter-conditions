import { FilterDataType } from "../src/datatype";
import { FilterOperator } from "../src/operator";
import { IFilterCondition } from "./filter";

interface IFilterConditionEnums {
    FilterDataType: FilterDataType;
    FilterOperator: FilterOperator;
}

declare const isValidFilterCondition: (condition: IFilterCondition) => boolean;
declare const getSqlCondition: (condition: IFilterCondition) => string;
declare const getKustoCondition: (condition: IFilterCondition) => string;

export * from "./filter";

export {
    FilterDataType,
    FilterOperator,
    isValidFilterCondition,
    getSqlCondition,
    getKustoCondition
};
