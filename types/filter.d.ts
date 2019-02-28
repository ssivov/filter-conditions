import { ConnectiveOperator } from "../src/connective";
import { FilterDataType } from "../src/datatype";
import { FilterType } from "../src/filter";
import { FilterOperator } from "../src/operator";

export { FilterType } from "../src/filter";

export declare type SingleValue = string | number | boolean | Date;
export declare type RangeDataType = number | Date;
export declare type Param = {
    value: SingleValue;
    prependTable: boolean;
}
export declare type ParamListValue = Param[];
export declare type RangeValue = Range<RangeDataType>;
export declare type FilterValue = SingleValue | RangeValue | ParamListValue;

export type Range<T> = {
    min: T;
    max: T;
    minExclusive?: boolean;
    maxExclusive?: boolean;
};

export interface IFilterCondition {
    field: string;
    dataType: FilterDataType;
    operator: FilterOperator;
    value?: FilterValue;
    invert?: boolean;
}

export interface IFilterConnective {
    filters: Filter[];
    operator: ConnectiveOperator;
    invert?: boolean;
}

export type Filter = IFilterCondition | IFilterConnective;

export const getFilterType: (filter: Filter) => FilterType;
export const connectFilters: (operator: ConnectiveOperator, filters: Filter[]) => Filter;
