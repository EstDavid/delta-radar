import {configureStore} from '@reduxjs/toolkit';
import scanDataReducer from './slices/scanData';
import accountsReducer from './slices/accounts';
import blockchainReducer from './slices/blockchain';

export const store = configureStore({
    reducer: {
        scanData: scanDataReducer,
        accounts: accountsReducer,
        blockchain: blockchainReducer
    }
});