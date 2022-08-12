import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    fetchScans,
    fetchData,
    switchSortingEnabling,
    changeSortedField,
    updateFilter,
    updateOperator,
    scanDataSelector,
} from '../slices/scanData';

const FiltersSidebar = () => {
    const dispatch = useDispatch();

    const { fields, filteredFields, numericalOperators } = useSelector(scanDataSelector);

    const handleFilter = (event, fieldKey) => {
        dispatch(updateFilter(
            event.target.value,
            fieldKey
        ))
    };

    const handleOperatorChange = (event, fieldKey) => {
        dispatch(updateOperator(
            event.target.value,
            fieldKey
        ))
    };

    const filterableFields = Object.keys(filteredFields);

    return (
        <div className="flex-shrink-0 p-3 bg-white" style={{ width: "280px" }}>
            <div className="d-flex align-items-center pb-3 mb-3 text-decoration-none border-bottom">
                <svg className="bi me-2" width="30" height="24"></svg>
                <span className="fs-5 fw-semibold">Filters</span>
            </div>
            <ul className="list-unstyled ps-0">
                {filterableFields.map((fieldKey, index) => {
                    const field = fields[fieldKey];
                    return (
                        <li className="fs-6 fw-semibold" key={index} >
                            <div className="mb-1" key={index}>
                                <button
                                    className="btn btn-toggle align-items-center rounded collapsed"
                                    data-bs-toggle="collapse" data-bs-target={`#dashboard-collapse-${index}`}
                                    aria-expanded="false"
                                >
                                    {field.name}
                                </button>
                                <div className="row collapse justify-content-center gx-2 mt-2" id={`dashboard-collapse-${index}`}>
                                    <div className="col" >
                                        <input
                                            type="text"
                                            className="form-control"
                                            // placeholder={`Filter by ${field.name} ...`}
                                            id={`search-${field.name.toLowerCase()}`}
                                            onChange={(event) => handleFilter(event, fieldKey)}
                                            value={filteredFields[fieldKey].value}
                                        />
                                    </div>
                                    {field.isNumerical ?
                                        <div className="col-auto">
                                            <select
                                                className="form-control form-select form-select-sm"
                                                aria-label="Array select"
                                                id={`array-type-${index}`}
                                                defaultValue={numericalOperators[0]}
                                                onChange={(event) => handleOperatorChange(event, fieldKey)}>
                                                {numericalOperators.map((operator, operatorIndex) => {
                                                    return <option key={operatorIndex} value={operator}>{operator}</option>
                                                })}
                                            </select>
                                        </div> 
                                    : ''}
                                    </div>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

export default FiltersSidebar;