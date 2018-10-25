import { ConnectiveOperator } from "../src/connective";
import { FilterDataType } from "../src/datatype";
import { FilterOperator } from "../src/operator";

export declare type SingleValue = string | number | boolean | Date;
export declare type RangeDataType = number | Date;
export declare type RangeValue = Range<RangeDataType>;
export declare type FilterValue = SingleValue | RangeValue;

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
