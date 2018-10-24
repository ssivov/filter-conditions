import { Filter } from "../types";

export enum FilterType {
    SingleCondition,
    Connective,
    NotFilter
}

export const getFilterType = (filter: Filter): FilterType => {
    let filterType: FilterType = FilterType.NotFilter;
    if (hasKeys(filter, ["filters", "operator"])) {
        filterType = FilterType.Connective;
    } else if (hasKeys(filter, ["field", "dataType", "operator"])) {
        filterType = FilterType.SingleCondition;
    }
    return filterType;
};

const hasKeys = (obj: any, keys: string[]): boolean => {
    for (const key of keys) {
        if (!(key in obj)) {
            return false;
        }
    }
    return true;
};
