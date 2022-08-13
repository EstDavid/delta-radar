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

const FilterForm = (props) => {
    const { filteredFields, numericalOperators } = useSelector(scanDataSelector);

    const dispatch = useDispatch();


    const handleFilter = (event, fieldKey, dateKey) => {
        dispatch(updateFilter(
            event.target.value,
            fieldKey,
            dateKey
        ))
    };

    const handleOperatorChange = (event, fieldKey) => {
        dispatch(updateOperator(
            event.target.value,
            fieldKey
        ))
    };

    if (!props.field.isTimestamp) {
        return (
            <div className="row collapse justify-content-center gx-2 mt-2" id={`dashboard-collapse-${props.index}`}>
                <div className="col" >
                    <input
                        type="text"
                        className="form-control"
                        // placeholder={`Filter by ${field.name} ...`}
                        id={`filter-${props.fieldKey.toLowerCase()}`}
                        onChange={(event) => handleFilter(event, props.fieldKey)}
                        value={filteredFields[props.fieldKey].value}
                    />
                </div>
                {props.field.isNumerical ?
                    <div className="col-auto">
                        <select
                            className="form-control form-select form-select-sm"
                            aria-label="Array select"
                            id={`array-type-${props.index}`}
                            defaultValue={numericalOperators[0]}
                            onChange={(event) => handleOperatorChange(event, props.fieldKey)}>
                            {numericalOperators.map((operator, operatorIndex) => {
                                return <option key={operatorIndex} value={operator}>{operator}</option>
                            })}
                        </select>
                    </div>
                    : ''}
            </div>
        )
    } else {
        return (
            <div className="row collapse justify-content-center gx-2 mt-2" id={`dashboard-collapse-${props.index}`}>
                <div>
                    <label htmlFor="from-date">Date from:</label>
                    <input
                        type="date"
                        className="form-control"
                        name="from-date"
                        id={`date-from-${props.fieldKey.toLowerCase()}`}
                        onChange={(event) => handleFilter(event, props.fieldKey, 'dateFrom')}
                        value={filteredFields[props.fieldKey].dateFrom}
                    />
                </div>
                <div>
                    <label htmlFor="until-date">Date until:</label>
                    <input
                        type="date"
                        className="form-control"
                        name="until-date"
                        id={`date-${props.fieldKey.toLowerCase()}`}
                        onChange={(event) => handleFilter(event, props.fieldKey, 'dateUntil')}
                        value={filteredFields[props.fieldKey].dateUntil}
                    />
                </div>
            </div>
        )
    }
}

const FiltersSidebar = () => {

    const { fields, filteredFields } = useSelector(scanDataSelector);

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
                                <FilterForm field={field} fieldKey={fieldKey} index={index} />
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

export default FiltersSidebar;