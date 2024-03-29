const SwapSet = require('../models/swapSet')

export const sortDataByFields = (data, fields, sortedFields) => {
    let sortedArray = [...data];

    for(let fieldObject of sortedFields) {
      const field = fields[fieldObject.field];
      const descending = fieldObject.descending;
      const {isNumerical, index} = field
      const sortStart = new Date();
      
      if(isNumerical) {
          sortedArray.sort((a, b) => {
              if(descending) return parseFloat(b[index]) - parseFloat(a[index]);
              else return parseFloat(a[index]) - parseFloat(b[index]);
          });        
      } else if(fieldObject.field === 'timestamp') {
          sortedArray.sort((a, b) => {
              const dateA = new Date(...a.timestamp);
              const dateB = new Date(...b.timestamp);
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

export const filterDataByFields = (data, filteredFields, fields) => {
    let filteredData = data;

    for (let fieldName in filteredFields) {
      const field = fields[fieldName];

      const fieldFilter = filteredFields[fieldName];

      if (!field.isTimestamp && fieldFilter.value !== '') {

        const searchString = fieldFilter.value;
  
        const filterType = 1;

        if(field.isNumerical) {
          const operator = fieldFilter.operator;
          switch (operator) {
            case '=':
              filteredData = filteredData.filter((row) => {
                return parseFloat(row[fieldName]) === parseFloat(searchString);
              });
              break;
            case '>':
              filteredData = filteredData.filter((row) => {
                return parseFloat(row[fieldName]) > parseFloat(searchString);
              });
              break;
            case '>=':
              filteredData = filteredData.filter((row) => {
                return parseFloat(row[fieldName]) >= parseFloat(searchString);
              });
              break;
            case '<':
              filteredData = filteredData.filter((row) => {
                return parseFloat(row[fieldName]) < parseFloat(searchString);
              });
              break;
            case '<=':
              filteredData = filteredData.filter((row) => {
                return parseFloat(row[fieldName]) <= parseFloat(searchString);
              });
              break;
          }
        } else {
          switch (filterType) {
            case 1: // 'contains' filter
              filteredData = filteredData.filter((row) => {
                return (row[fieldName].toUpperCase()).includes(searchString.toUpperCase());
              });
              break;
            case 2: // 'does not contain' filter
              filteredData = filteredData.filter((row) => {
                return !(row[fieldName].toUpperCase()).includes(searchString.toUpperCase());
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
          const swapSetDate = new Date(row[fieldName]);
          if(dateFrom === undefined) return swapSetDate <= dateUntil;
          else if(dateUntil === undefined) return swapSetDate >= dateFrom;
          else return swapSetDate >= dateFrom && swapSetDate <= dateUntil;
        });
      }
    }

    return filteredData
}

export const pretifyNumber = (numberInput) => {
    const number = parseFloat(numberInput);
    if (number < 1) {
        return number.toPrecision(3);
    } else if (number < 1000) {
        return number.toFixed(2);
    } else {
        const integerString = Math.trunc(number).toString();
        const integerArray = [];
        const separator = ' ';
        let digitGroupArray = [];
        for (let i = integerString.length - 1; i >= 0; i -= 1) {
            const digit = integerString[i];
            digitGroupArray.unshift(digit);
            if (i === 0) {
                integerArray.unshift(...digitGroupArray);
            }
            else if (digitGroupArray.length >= 3) {
                digitGroupArray.unshift(separator);
                integerArray.unshift(...digitGroupArray);
                digitGroupArray = [];
            }
        }
        return integerArray.join('');
    }
}