import { createSlice } from '@reduxjs/toolkit';
import tokensETH from '../helpers/tokensETH.json';
import tokensBSC from '../helpers/tokensBSC.json';
import { getBestSwapSetByPeriod } from '../helpers/helpers';

const port = process.env.PORT;

const aggregateDataFolder = '21';
const scansFolder = 'SCANS';

export const initialState = {
    loading: true,
    hasErrors: false,
    aggregateDataLoading: true,
    latestDataLoading: true,
    aggregateDataHasErrors: false,
    latestDataHasErrors: false,
    blockchainSelection: 'ETH',
    blockchainParameters: {
        ETH: {
            tokenData: tokensETH,
            scannerDomain: 'https://etherscan.io/address/'
        },
        BSC: {
            tokenData: tokensBSC,
            scannerDomain: 'https://bscscan.com.io/address/'
        }
    },
    folderDatesObject: {},
    aggregateData: {},
    latestData: [],
    combinedData: [],
    aggregateCategoryFolders: {
        deltaPercentage: 'DELTAPERC',
        deltaRefToken: 'DELTAREFTOKEN'
    },
    defaultCategoryFolder: 'deltaRefToken',
    bestSwapSets: [
        { 
            name: '24 hours',
            timespanHours: 24,
            swapSetCategories: {
                theoreticalDeltaPercentage: [],
                theoreticalDeltaRefToken: []
            }
        },
        { 
            name: '7 days',
            timespanHours: 24 * 7,
            swapSetCategories: {
                theoreticalDeltaPercentage: [],
                theoreticalDeltaRefToken: []
            }
        },
        { 
            name: '30 days',
            timespanHours: 24 * 30,
            swapSetCategories: {
                theoreticalDeltaPercentage: [],
                theoreticalDeltaRefToken: []
            }
        },
        { 
            name: 'all time',
            timespanHours: undefined,
            swapSetCategories: {
                theoreticalDeltaPercentage: [],
                theoreticalDeltaRefToken: []
            }
        },
    ],
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
        theoreticalDelta: { name: 'Delta', index: 11, isNumerical: true },
        theoreticalDeltaPercentage: { name: 'Delta %', index: 12, isNumerical: true },
        theoreticalDeltaRefToken: { name: 'Delta Ref. Token', index: 13, isNumerical: true },
        trueDelta: { name: 'True Delta', index: 14, isNumerical: true },
        deltaAge: { name: 'Delta Age', index: 15, isNumerical: true },
        timestamp : { name: 'Timestamp', index: 16, isNumerical: false, isTimestamp: true }
    },
    tableFields: [
        // 'date',
        // 'time',
        'timestamp',
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
        // 'deltaAge',   
    ],
    sortingEnabled: true,
    sortedFieldsDescending: {},
    filterableFields: [
        'timestamp',
        'inputQty',
        'tokenSequence',
        'exchangeSequence',
        'theoreticalDeltaPercentage',
        'theoreticalDeltaRefToken',
    ],
    filteredFields: {
    },
    numericalOperators: ['=', '>', '>=', '<', '<=']
}

export const scanDataSlice = createSlice({
    name: 'scanData',
    initialState,
    reducers: {
        selectBlockchain: (state, {payload}) => {
            state.blockchainSelection = payload;
        },
        getScanData: (state) => {
            state.loading = true;
        },
        folderDatesDownloaded: (state, {payload}) => {
            state.folderDatesObject = payload;
        },
        getFolderDatesFailure: (state) => {
            state.loading = false;
            state.hasErrors = true;
        },
        getAggregateDataSuccess: (state, {payload}) => {
            for(let key in payload) {
                const dataAggregate = payload[key];
                const dateIndex = state.fields.date.index;
                const timeIndex = state.fields.time.index
                state.aggregateData[key] = addTimestampToData(dataAggregate, dateIndex, timeIndex);
            }
            state.aggregateDataLoading = false;
            state.aggregateDataHasErrors = false;
        },
        getAggregateDataFailure: (state) => {
            state.aggregateDataLoading = false;
            state.aggregateDataHasErrors = true;
        },
        getLatestDataSuccess: (state, {payload}) => {
            const dateIndex = state.fields.date.index;
            const timeIndex = state.fields.time.index
            state.latestData = addTimestampToData(payload, dateIndex, timeIndex);

            state.latestDataLoading = false;
            state.latestDataHasErrors = false;
        },
        getLatestDataFailure: (state) => {
            state.latestDataLoading = false;
            state.latestDataHasErrors = true;
        },
        getCombinedDataSuccess: (state, {payload}) => {
            state.combinedData = payload.latestData;

            let earliestTimestamp = new Date();

            for(let swapSetArray of payload.latestData) {
                const dateArray = swapSetArray[state.fields.timestamp.index];
                const timestamp = new Date(...dateArray);
                if( timestamp < earliestTimestamp) {
                    earliestTimestamp = timestamp;
                }
            }

            const aggregateData = payload.aggregateData[state.defaultCategoryFolder].filter((swapSetArray) => {
                const dateArray = swapSetArray[state.fields.timestamp.index];
                const timestamp = new Date(...dateArray);
                return timestamp < earliestTimestamp;
            });

            state.combinedData.push(...aggregateData);

            state.loading = false;
            state.hasErrors = false;
        },
        getCombinedDataFailure: (state) => {
            state.loading = false;
            state.hasErrors = true;
        },
        sortingEnabledSwitched: (state) => {
            state.sortingEnabled = !state.sortingEnabled;
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
        },
        filterChanged: (state, {payload}) => {
            if(payload.dateKey === undefined) {
                state.filteredFields[payload.key].value = payload.value;
            } else {
                state.filteredFields[payload.key][payload.dateKey] = payload.value;
            }
        },
        operatorChanged: (state, {payload}) => {
            state.filteredFields[payload.key].operator = payload.value;
        },
        setFilteredFields: (state) => {
            for(let fieldKey of state.filterableFields) {
                const field = state.fields[fieldKey];
                state.filteredFields[fieldKey] = {};
                state.filteredFields[fieldKey].value = '';
                if(field.isNumerical) {
                    state.filteredFields[fieldKey].operator = state.numericalOperators[0];
                }
                if(field.isTimestamp) {
                    state.filteredFields[fieldKey].dateFrom= '';
                    state.filteredFields[fieldKey].dateUntil = '';
                }
            }
        },
        bestSwapSetsRetrieved: (state) => {
            for (let i = 0; i < state.bestSwapSets.length; i += 1) {
                const swapSetParams = state.bestSwapSets[i];
                for (let categoryKey in swapSetParams.swapSetCategories) {
                    state.bestSwapSets[i].swapSetCategories[categoryKey] = getBestSwapSetByPeriod(
                        state.combinedData,
                        swapSetParams.timespanHours,
                        state.fields.timestamp.index,
                        state.fields[categoryKey].index,
                    )
                }
            }
        }
    }
});

// export slice.actions
export const {
    selectBlockchain,
    getScanData,
    folderDatesDownloaded,
    getFolderDatesFailure,
    getAggregateDataSuccess,
    getAggregateDataFailure,
    getLatestDataSuccess,
    getLatestDataFailure,
    getCombinedDataSuccess,
    getCombinedDataFailure,
    sortingEnabledSwitched,
    sortedFieldChanged,
    filterChanged,
    operatorChanged,
    setFilteredFields,
    bestSwapSetsRetrieved
} = scanDataSlice.actions;

// Helper functions
const addTimestampToData = (dataArray, dateIndex, timeIndex) => {
    return dataArray.map((swapSetArray) => {
        const dateArray = swapSetArray[dateIndex].split('/');
        const timeArray = swapSetArray[timeIndex].split(':');

        dateArray[1] -= 1;

        swapSetArray[dateIndex] = '';
        swapSetArray[timeIndex] = '';
        swapSetArray.push([...dateArray, ...timeArray, 0]);
        return swapSetArray;
    })
}
// export selector
export const scanDataSelector = (state) => state.scanData;

// export reducer
export default scanDataSlice.reducer;

// export asynchronous thunk action

export function fetchScans(blockchainSelection) {
    return async (dispatch) => {
        dispatch(setFilteredFields());

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
            dispatch(getFolderDatesFailure());
        }
    }
}

export function fetchData(blockchainSelection, folderDatesObject, aggregateCategoryFolders) {
    return async (dispatch) => {

        try {
            let aggregateData, latestData;

            try{
                aggregateData = await fetchAggregateData(blockchainSelection, folderDatesObject, aggregateCategoryFolders);
                if(aggregateData !== undefined) dispatch(getAggregateDataSuccess(aggregateData));
            } catch {
                dispatch(getAggregateDataFailure());
                throw('Aggregate data failure')
            }

            try {
                latestData = await fetchLatestData(blockchainSelection, dispatch);
                if(latestData !== undefined) dispatch(getLatestDataSuccess(latestData));
            } catch {
                dispatch(getLatestDataFailure());
                throw('Latest data failure')
            }

            if(aggregateData !== undefined && latestData !== undefined) {
                dispatch(getCombinedDataSuccess({aggregateData, latestData}));
                dispatch(bestSwapSetsRetrieved());
            }
            
        } catch(error) {
            console.log(error);
            dispatch(getCombinedDataFailure()); 
        }
    }
}

async function fetchAggregateData(blockchainSelection, folderDatesObject, aggregateCategoryFolders) {
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
                        const blockArray = JSON.parse(block);
                        data.push(...blockArray);
                    }
    
                    aggregateData[aggregateCategoryFolder] = data;
        
                } catch(error) {
                    // console.log(error);
                }
            }
        }

        if(Object.keys(aggregateData).length > 0) return aggregateData;
        else return undefined;
    }
}

async function fetchLatestData(blockchainSelection) {
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
                const blockArray = JSON.parse(block);
                latestData.push(...blockArray);
            }

        } catch(error) {
            // console.log(error);
        }
    }

    if(latestData.length > 0) return latestData;
}

export function switchBlockchain(blockchain) {
    return async (dispatch) => {
        dispatch(selectBlockchain(blockchain));
    }
}

export function switchSortingEnabling() {
    return async (dispatch) => {
        dispatch(sortingEnabledSwitched());
    }
}

export function changeSortedField(key) {
    return async (dispatch) => {
        dispatch(sortedFieldChanged(key));
    }
}

export function updateFilter(value, key, dateKey) {
    return async (dispatch) => {
        dispatch(filterChanged({value, key, dateKey}));
    }
}

export function updateOperator(value, key) {
    return async (dispatch) => {
        dispatch(operatorChanged({value, key}));
    }
}