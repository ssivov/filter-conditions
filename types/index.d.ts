import { ConnectiveOperator } from "../src/connective";
import { FilterDataType } from "../src/datatype";
import { FilterOperator } from "../src/operator";
import { Filter, IFilterCondition, IFilterConnective } from "./filter";

interface IFilterConditionEnums {
    FilterDataType: FilterDataType;
    FilterOperator: FilterOperator;
}

declare const isValidConnective: (connective: IFilterConnective) => boolean;
declare const isValidFilterCondition: (condition: IFilterCondition) => boolean;
declare const getSqlCondition: (filter: Filter) => string;
declare const getCosmosDbCondition: (filter: Filter, tableAlias: string) => string;

export * from "./filter";

export {
    ConnectiveOperator,
    FilterDataType,
    FilterOperator,
    getCosmosDbCondition,
    getSqlCondition,
    isValidFilterCondition
};
