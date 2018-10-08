import { FilterDataType } from "./datatype";
import { FilterOperator } from "./operator";

export const enums = {
    datatype: FilterDataType,
    operator: FilterOperator
};

export { isValidFilterCondition } from "./verify";
