import { createSlice } from '@reduxjs/toolkit';
import tokensETH from '../helpers/tokensETH.json';
import tokensBSC from '../helpers/tokensBSC.json';

const port = process.env.PORT;

const aggregateDataFolder = '21';
const scansFolder = 'SCANS';

export const initialState = {
    loading: true,
    latestDataLoading: true,
    hasErrors: false,
    latestDataHasErrors: false,
    blockchainSelection: 'ETH',
    tokenData: {
        ETH: tokensETH,
        BSC: tokensBSC
    },
    folderDatesObject: {},
    aggregateData: {},
    latestData: [],
    aggregateCategoryFolders: {
        deltaPercentage: 'DELTAPERC',
        deltaRefToken: 'DELTAREFTOKEN'
    },
    defaultCategoryFolder: 'deltaRefToken',
    fields: {
        date: { name: 'date', index: 0, isNumerical: false },
        time: { name: 'time', index: 1, isNumerical: false },
        type: { name: 'type', index: 2, isNumerical: false },
        inputQty: { name: 'Input Qty.', index: 3, isNumerical: true },
        delta: { name: 'Delta', index: 4, isNumerical: true },
        deltaPercentage: { name: 'Delta %', index: 5, isNumerical: true },
        deltaRefToken: { name: 'Delta Ref. Token', index: 6, isNumerical: true },
        tokenSequence: { name: 'Token Sequence', index: 7, isNumerical: false },
        exchangeSequence: { name: 'Exchange Sequence', index: 8, isNumerical: false },
        optimizedInput: { name: 'Optimized Input', index: 9, isNumerical: false },
        tradeTriggered: { name: 'Trade Triggered', index: 10, isNumerical: false },
        theoreticalDelta: { name: 'Theor. Delta', index: 11, isNumerical: true },
        theoreticalDeltaPercentage: { name: 'Theor. Delta %', index: 12, isNumerical: true },
        theoreticalDeltaRefToken: { name: 'Theor. Delta Ref. Token', index: 13, isNumerical: true },
        trueDelta: { name: 'True Delta', index: 14, isNumerical: true },
        deltaAge: { name: 'Delta Age', index: 15, isNumerical: true }
    },
    tableFields: [
        'date',
        'time',
        // 'type',
        'inputQty',
        // 'delta',
        // 'deltaPercentage',
        // 'deltaRefToken',
        'tokenSequence',
        'exchangeSequence',
        // 'optimizedInput',
        // 'tradeTriggered',
        'theoreticalDelta',
        'theoreticalDeltaPercentage',
        'theoreticalDeltaRefToken',
        // 'trueDelta',
        // 'deltaAge'        
    ], sortedFieldsDescending: {}
}

export const scanDataSlice = createSlice({
    name: 'priceData',
    initialState,
    reducers: {
        getScanData: (state) => {
            state.loading = true;
        },
        getAggregateDataSuccess: (state, {payload}) => {
            state.aggregateData = payload;
            state.loading = false;
            state.hasErrors = false;
        },
        getAggregateDataFailure: (state) => {
            state.loading = false;
            state.hasErrors = true;
        },
        getLatestDataSuccess: (state, {payload}) => {
            state.latestData = payload;
            state.latestDataLoading = false;
            state.latestDataHasErrors = false;
        },
        folderDatesDownloaded: (state, {payload}) => {
            state.folderDatesObject = payload;
        },
        sortedFieldChanged: (state, {payload}) => {
            const sortedFieldsKeys = Object.keys(state.sortedFieldsDescending);

            if(!sortedFieldsKeys.includes(payload)) {
                state.sortedFieldsDescending[payload] = true;
            } else if(state.sortedFieldsDescending[payload] === true) {
                state.sortedFieldsDescending[payload] = false;
            } else {
                const { [payload]:value ,...rest} = state.sortedFieldsDescending;
                state.sortedFieldsDescending = rest;
            }

            for(let fieldKey in state.sortedFieldsDescending) {
                const field = state.fields[fieldKey];
                const descending = state.sortedFieldsDescending[fieldKey];
                state.aggregateData[state.defaultCategoryFolder] = 
                sortScanData(state.aggregateData[state.defaultCategoryFolder], field, descending);
            }
        }
    }
});


// export slice.actions
export const {
    getScanData,
    getAggregateDataSuccess,
    getAggregateDataFailure,
    getLatestDataSuccess,
    folderDatesDownloaded,
    sortedFieldChanged
} = scanDataSlice.actions;

const sortScanData = (scanData, field, descending) => {
    const {isNumerical, index} = field
    const sortStart = new Date();
    const sortedArray = [...scanData];
    if(isNumerical) {
        sortedArray.sort((a, b) => {
            if(descending) return parseFloat(b[index]) - parseFloat(a[index]);
            else return parseFloat(a[index]) - parseFloat(b[index]);
        });        
    } else {
        if(descending) sortedArray.reverse();
        else sortedArray.sort();    
    }
    const sortEnd = new Date();
    console.log(`Data sorting took ${(sortEnd - sortStart) / 1000} seconds`)
    return sortedArray;
  }

// export selector
export const scanDataSelector = (state) => state.scanData;

// export reducer
export default scanDataSlice.reducer;

// export asynchronous thunk action
export function fetchScans(blockchainSelection) {
    return async (dispatch) => {
        dispatch(getScanData());

        try {
            console.log(`Fetching index data for ${blockchainSelection} blockchain`);
            const response = await fetch(`/get-files/${blockchainSelection}`);

            const filenames = await response.json();

            const folderDatesObject = {};

            for(let filename of filenames) {
                const filenameArray = filename.split('/');

                const yearString = filenameArray[1].slice(0, 4);
                const monthString = filenameArray[1].slice(4);
                const dayString = filenameArray[2];

                if(folderDatesObject[yearString] === undefined) {
                    folderDatesObject[yearString] = {[monthString]: [dayString] };
                } else if (folderDatesObject[yearString][monthString] === undefined) {
                    folderDatesObject[yearString][monthString] = [dayString];
                } else if(!folderDatesObject[yearString][monthString].includes(dayString)) {
                    folderDatesObject[yearString][monthString].push(dayString)
                }
            }

            dispatch(folderDatesDownloaded(folderDatesObject));

            return folderDatesObject;

        } catch(error) {
            dispatch(getAggregateDataFailure())
        }
    }
}

export function fetchAggregateData(blockchainSelection, folderDatesObject, aggregateCategoryFolders) {
    return async (dispatch) => {
        const aggregateData = {};

        if(Object.keys(folderDatesObject).length > 0) {
            for(let yearString in folderDatesObject) {
                for(let aggregateCategoryFolder in aggregateCategoryFolders) {
                    const data = [];
    
                    const categoryFolderName = aggregateCategoryFolders[aggregateCategoryFolder];
                    console.log(`Fetching aggregated data for year ${yearString} and ${categoryFolderName} category`);
                    const endPath = `${categoryFolderName}-COMPOSED`
                    try {
                        const fileResponse = await fetch(`get-file/${blockchainSelection}/${yearString}/${aggregateDataFolder}/${aggregateDataFolder}/${endPath}`);
    
                        const contentText = await fileResponse.text();
                        const contentArray = contentText.split("\n");
                
                        for(let block of contentArray) {
                            if(block === "") continue;
                            const array = JSON.parse(block);
                            data.push(...array);
                        }
        
                        aggregateData[aggregateCategoryFolder] = data;
            
                    } catch(error) {
                        // console.log(error);
                    }
                }
            }
    
            if(Object.keys(aggregateData).length > 0) dispatch(getAggregateDataSuccess(aggregateData));
        }
    }
}

export function fetchLatestScanData(blockchainSelection) {
    return async (dispatch) => {

        const currentDateTime = new Date();

        const latestData = [];

        for(let i = 0; i <= 1; i += 1) {
            const yearString = currentDateTime.getFullYear().toString();
            const monthString = (currentDateTime.getMonth() + 1).toString().padStart(2, 0);
            const dayString = currentDateTime.getDate().toString().padStart(2, 0);

            currentDateTime.setDate(currentDateTime.getDate() - 1);

            const endPath = `${scansFolder}-COMPOSED`
            try {
                const fileResponse = await fetch(`get-file/${blockchainSelection}/${yearString}/${monthString}/${dayString}/${endPath}`);

                const contentText = await fileResponse.text();
                const contentArray = contentText.split("\n");
        
                for(let block of contentArray) {
                    if(block === "") continue;
                    const array = JSON.parse(block);
                    latestData.push(...array);
                }
    
            } catch(error) {
                // console.log(error);
            }
        }
    
        if(latestData.length > 0) dispatch(getLatestDataSuccess(latestData));
        
    }
}

export function changeSortedField(key) {
    return async (dispatch) => {
        dispatch(sortedFieldChanged(key));
    }
}
