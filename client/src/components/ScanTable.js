import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchScans,
  fetchData,
  switchSortingEnabling,
  changeSortedField,
  scanDataSelector,
} from '../slices/scanData';

const TableHeader = (props) => {

  const dispatch = useDispatch();

  const handleSort = (field) => {
    dispatch(switchSortingEnabling());
    dispatch(changeSortedField(field));
    dispatch(switchSortingEnabling());
  }
  return (
    <thead>
      <tr>
        {props.tableFields.map((fieldKey, index) => {
          const showDescending = props.sortedFieldsDescending[fieldKey];
          return (
            <th key={index} scope="col">
              {props.fields[fieldKey].name}
              <button className={`btn btn-light`} onClick={() => handleSort(fieldKey)} disabled={!props.enableSorting} >
                {showDescending === undefined ? 
                  <i className="bi bi-caret-down"></i>
                :
                  showDescending ? <i className="bi bi-caret-down-fill"></i> : <i className="bi bi-caret-up-fill"></i>
                }
              </button>
            </th>
          )
        })}
      </tr>
    </thead>
  )
}


const pretifyNumber = (numberInput) => {
  const number = parseFloat(numberInput);
  if(number < 1) {
    return number.toPrecision(3);
  } else if(number < 1000) {
    return number.toFixed(2);
  } else {
    const integerString = Math.trunc(number).toString();
    const integerArray = [];
    const separator = ' ';
    let digitGroupArray = [];
    for(let i = integerString.length - 1; i >= 0; i -=1) {
      const digit = integerString[i];
      digitGroupArray.unshift(digit);
      if (i === 0) {
        integerArray.unshift(...digitGroupArray);
      }
      else if(digitGroupArray.length >= 3 ) {
        digitGroupArray.unshift(separator);
        integerArray.unshift(...digitGroupArray);
        digitGroupArray = [];
      }
    }
    return integerArray.join('');
  }
}

const TableBody = (props) => {
  return (
    <tbody>
      {props.scanDataChunk.map((dataRow, indexRow) => {
        return (
          <tr key={indexRow}>
            {props.tableFields.map((fieldKey, indexField) => {
              if(fieldKey !== 'tokenSequence' && fieldKey !== 'exchangeSequence' && fieldKey !== 'timestamp') {
                let value = dataRow[props.fields[fieldKey].index];
                if(props.fields[fieldKey].isNumerical) value = pretifyNumber(value);
                return(
                  <td  key={indexField}><div className="d-flex flex-nowrap justify-content-center">{value}</div></td>
                );
              } else if (fieldKey === 'tokenSequence') {
                const tokenArray = dataRow[props.fields[fieldKey].index].split('=>');
                return(
                  <td key={indexField}>
                    <div className="d-flex justify-content-center">
                      {tokenArray.map((symbol, tokenIndex) => {
                        const token = props.tokenData[symbol];
                        return ( 
                          <span key={tokenIndex} className="d-flex flex-row">
                            {tokenIndex > 0 ? <i className="bi bi-caret-right text-dark mx-2"></i> : ''}
                            {token === undefined ? 
                              symbol :
                              <a className="d-flex flex-row text-decoration-none text-reset"
                                href={`${props.scannerDomain}${token[2].toLowerCase()}`}
                                target="_blank" rel="noreferrer noopener">
                                <img className="me-1 token-logo" src={token[4]}></img>{symbol}
                              </a>
                             }
                            </span>
                          )
                        })}
                    </div>
                  </td>
                );
              } else if (fieldKey === 'exchangeSequence') {
                const exchangeArray = dataRow[props.fields[fieldKey].index].split('=>');
                return(
                  <td key={indexField}>
                    <div className="d-flex justify-content-center">
                    {exchangeArray.map((symbol, exchangeIndex) => {
                      return ( 
                        <span key={exchangeIndex} className="d-flex flex-row">
                          {exchangeIndex > 0 ? <i className="bi bi-caret-right text-dark mx-2"></i> : ''}
                          <a className="d-flex flex-row text-decoration-none text-reset"
                          href=""
                          target="_blank" rel="noreferrer noopener">
                          <img className="me-1" src=""></img>{symbol}
                          </a></span>
                        )
                      })}
                    </div>
                  </td>
                );
              } else if (fieldKey === 'timestamp') {
                const dateArray = dataRow[props.fields[fieldKey].index];
                const timestamp = new Date(...dateArray);
                return (
                  <td key={indexField}>{`${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString()}`}</td>
                );
              }

            })}
          </tr>
        )        
      })
      }
    </tbody>
  )
}

const ScanTable = () => {
  const dispatch = useDispatch();

  const {
    loading,
    hasErrors,
    blockchainSelection,
    blockchainParameters,
    folderDatesObject,
    aggregateCategoryFolders,
    combinedData,
    fields,
    tableFields,
    sortingEnabled,
    sortedFieldsDescending,
    filteredFields
  } = useSelector(scanDataSelector);

  useEffect(() => {
    dispatch(fetchScans(blockchainSelection));

  }, [dispatch]);

  useEffect(() => {
      dispatch(fetchData(blockchainSelection, folderDatesObject, aggregateCategoryFolders));
  }, [folderDatesObject]);

  const sortData = (data) => {
    let sortedArray = [...data];

    for(let fieldKey in sortedFieldsDescending) {
      const field = fields[fieldKey];
      const descending = sortedFieldsDescending[fieldKey];
      const {isNumerical, index} = field
      const sortStart = new Date();
      
      if(isNumerical) {
          sortedArray.sort((a, b) => {
              if(descending) return parseFloat(b[index]) - parseFloat(a[index]);
              else return parseFloat(a[index]) - parseFloat(b[index]);
          });        
      } else if(fieldKey === 'timestamp') {
          sortedArray.sort((a, b) => {
              const dateA = new Date(...a[index]);
              const dateB = new Date(...b[index]);
              if(descending) return dateB - dateA;
              else return dateA - dateB;
          });  
      }
      else {
        sortedArray.sort((a, b) => {
          if(descending) return b[index] > a[index];
          else return b[index] < a[index];
        });
      }
      const sortEnd = new Date();
      console.log(`Data sorting took ${(sortEnd - sortStart) / 1000} seconds`)
    }
    return sortedArray;
}

  const filterData = (data) => {
    let filteredData = data;

    for (let fieldKey in filteredFields) {
      const field = fields[fieldKey];

      const fieldFilter = filteredFields[fieldKey];

      if (!field.isTimestamp && fieldFilter.value !== '') {

        const searchString = fieldFilter.value;
  
        const filterType = 1;

        if(field.isNumerical) {
          const operator = fieldFilter.operator;
          switch (operator) {
            case '=':
              filteredData = filteredData.filter((row) => {
                return parseFloat(row[field.index]) === parseFloat(searchString);
              });
              break;
            case '>':
              filteredData = filteredData.filter((row) => {
                return parseFloat(row[field.index]) > parseFloat(searchString);
              });
              break;
            case '>=':
              filteredData = filteredData.filter((row) => {
                return parseFloat(row[field.index]) >= parseFloat(searchString);
              });
              break;
            case '<':
              filteredData = filteredData.filter((row) => {
                return parseFloat(row[field.index]) < parseFloat(searchString);
              });
              break;
            case '<=':
              filteredData = filteredData.filter((row) => {
                return parseFloat(row[field.index]) <= parseFloat(searchString);
              });
              break;
          }
        } else {
          switch (filterType) {
            case 1: // 'contains' filter
              filteredData = filteredData.filter((row) => {
                return (row[field.index].toUpperCase()).includes(searchString.toUpperCase());
              });
              break;
            case 2: // 'does not contain' filter
              filteredData = filteredData.filter((row) => {
                return !(row[field.index].toUpperCase()).includes(searchString.toUpperCase());
              });
              break;
          }
        }
      }
      else if (field.isTimestamp && (fieldFilter.dateFrom !== '' || fieldFilter.dateUntil !== '')) {
        let dateFrom, dateUntil;
        if(fieldFilter.dateFrom !== '') dateFrom = new Date(fieldFilter.dateFrom);
        // Date until is considered to end at the end of that date, so 24 h are added
        if(fieldFilter.dateUntil !== '') {
          dateUntil = new Date(fieldFilter.dateUntil);
          dateUntil.setHours(dateUntil.getHours() + 24);
        }

        filteredData = filteredData.filter((row) => {
          const swapSetDate = new Date(...row[field.index]);
          if(dateFrom === undefined) return swapSetDate <= dateUntil;
          else if(dateUntil === undefined) return swapSetDate >= dateFrom;
          else return swapSetDate >= dateFrom && swapSetDate <= dateUntil;
        });
      }
    }

    return filteredData
  }

  const renderChart = () => {
    if(loading) return (
      <div className="d-flex w-100 align-items-center justify-content-between p-2">
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>        
      </div>

    )
    if(hasErrors) return <p>Unable to display data</p>

    let displayArray = filterData(combinedData);

    displayArray = sortData(displayArray);

    // sortedArray = filterScanData(sortedArray, fields.date.index, 1, '2022/08/11');

    // sortedArray = filterScanData(sortedArray, fields.date.index, 2, '2022/07/28');

    return (
      <table className="table">
        <TableHeader
          fields={fields}
          tableFields={tableFields}
          sortedFieldsDescending={sortedFieldsDescending}
          enableSorting={sortingEnabled} />
        <TableBody 
          scanDataChunk={displayArray.slice(0, 50)}
          tableFields={tableFields}
          fields={fields}
          tokenData={blockchainParameters[blockchainSelection].tokenData}
          scannerDomain={blockchainParameters[blockchainSelection].scannerDomain} />
      </table>
    );
  }

  return (
    <div className="container">
      {renderChart()}
    </div>
  )
}

export default ScanTable;