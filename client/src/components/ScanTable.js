import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchScans,
  fetchAggregateData,
  fetchLatestScanData,
  changeSortedField,
  scanDataSelector,
} from '../slices/scanData';

const TableHeader = (props) => {

  const dispatch = useDispatch();

  const handleSort = (field) => {
    dispatch(changeSortedField(field))
  }
  return (
    <thead>
      <tr>
        {props.tableFields.map((fieldKey, index) => {
          const showDescending = props.sortedFieldsDescending[fieldKey];
          return (
            <th key={index} scope="col">
              {props.fields[fieldKey].name}
              <button className="btn btn-light" onClick={() => handleSort(fieldKey)}>
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

const TableBody = (props) => {
  return (
    <tbody>
      {props.scanDataChunk.map((dataRow, indexRow) => {
        return (
          <tr key={indexRow}>
            {props.tableFields.map((fieldKey, indexField) => {
              if(fieldKey !== 'tokenSequence' && fieldKey !== 'exchangeSequence') {
                return(
                  <td key={indexField}>{dataRow[props.fields[fieldKey].index]}</td>
                );
              } else if (fieldKey === 'tokenSequence') {
                const tokenArray = dataRow[props.fields[fieldKey].index].split('=>');
                return(
                  <td key={indexField}>
                    <div className="d-flex justify-content-center">
                      {tokenArray.map((symbol, tokenIndex) => {
                        return ( 
                          <span key={tokenIndex} className="d-flex flex-row">
                            {tokenIndex > 0 ? <i className="bi bi-caret-right mx-2"></i> : ''}
                            <a className="d-flex flex-row text-decoration-none text-reset"
                            href={`https://etherscan.io/address/${props.tokenData[symbol][2].toLowerCase()}`}
                            target="_blank" rel="noreferrer noopener">
                            <img className="me-1" src={props.tokenData[symbol][4]}></img>{symbol}
                            </a></span>
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
                          {exchangeIndex > 0 ? <i className="bi bi-caret-right mx-2"></i> : ''}
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
              }

            })}
          </tr>
        )        
      })
      }
    </tbody>
  )
}

const sortScanData = (scanData, fieldIndex) => {
  const sortStart = new Date();
  const sortedArray = [...scanData];
  sortedArray.sort((a, b) => {
    return parseFloat(b[fieldIndex]) - parseFloat(a[fieldIndex]);
  });
  const sortEnd = new Date();
  console.log(`Data sorting took ${(sortEnd - sortStart) / 1000} seconds`)
  return sortedArray;
}

const filterScanData = (scanData, fieldIndex, filterType, searchString) => {
  switch(filterType) {
    case 1: // 'contains' filter
      return scanData.filter((row) => {
        return row[fieldIndex].includes(searchString);
      });
    case 2: // 'does not contain' filter
      return scanData.filter((row) => {
        return !row[fieldIndex].includes(searchString);
      });
  }
}

const ScanTable = () => {
  const dispatch = useDispatch();

  const {
    loading,
    hasErrors,
    latestDataLoading,
    latestDataHasErrors,
    blockchainSelection,
    tokenData,
    folderDatesObject,
    defaultCategoryFolder,
    aggregateCategoryFolders,
    aggregateData,
    latestData,
    fields,
    tableFields,
    sortedFieldsDescending,
  } = useSelector(scanDataSelector);

  useEffect(() => {
    dispatch(fetchScans(blockchainSelection));

  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAggregateData(blockchainSelection, folderDatesObject, aggregateCategoryFolders));
    dispatch(fetchLatestScanData(blockchainSelection));

  }, [folderDatesObject]);

  const renderChart = () => {
    if(loading) return (
      <div className="d-flex w-100 align-items-center justify-content-between p-2">
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>        
      </div>

    )
    if(hasErrors) return <p>Unable to display data</p>

    let sortedArray = aggregateData[defaultCategoryFolder];

    // sortedArray = filterScanData(sortedArray, fields.date.index, 2, '2022/07/29');

    // sortedArray = filterScanData(sortedArray, fields.date.index, 2, '2022/07/28');

    return (
      <table className="table">
        <TableHeader
          fields={fields}
          tableFields={tableFields}
          sortedFieldsDescending={sortedFieldsDescending} />
        <TableBody 
          scanDataChunk={sortedArray.slice(0, 50)}
          tableFields={tableFields}
          fields={fields}
          tokenData={tokenData[blockchainSelection]} />
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