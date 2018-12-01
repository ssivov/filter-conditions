import { Filter } from "../types/filter";
import { ConnectiveOperator } from "./connective";

export enum FilterType {
    SingleCondition,
    Connective,
    NotFilter
}

export const getFilterType = (filter: Filter): FilterType => {
    let filterType: FilterType = FilterType.NotFilter;
    if (filter) {
        if (hasKeys(filter, ["filters", "operator"])) {
            filterType = FilterType.Connective;
        } else if (hasKeys(filter, ["field", "dataType", "operator"])) {
            filterType = FilterType.SingleCondition;
        }
    }
    return filterType;
};

export const connectFilters = (operator: ConnectiveOperator, filters: Filter[]): Filter => {
    let connectedFilter: Filter = null;
    const definedFilters = filters ? filters.filter((filter: Filter) => !!filter) : [];
    if (definedFilters.length > 0) {
        connectedFilter = (
            definedFilters.length === 1
            ? definedFilters[0]
            : {
                operator,
                filters: definedFilters
            }
        );
    }
    return connectedFilter;
};

const hasKeys = (obj: any, keys: string[]): boolean => {
    for (const key of keys) {
        if (!(key in obj)) {
            return false;
        }
    }
    return true;
};
