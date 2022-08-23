import React, { useEffect }  from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { 
  fetchScans,
  fetchData,
  switchSortingEnabling,
  changeSortedField,
  scanDataSelector,
} from './slices/scanData';
import HomePage from './pages/HomePage';
import TablePage from './pages/TablePage';

function App() {
  const dispatch = useDispatch();

  const {
    blockchainSelection,
    folderDatesObject,
    aggregateCategoryFolders,
  } = useSelector(scanDataSelector);

  useEffect(() => {
    dispatch(fetchScans(blockchainSelection));

  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchScans(blockchainSelection));

  }, [blockchainSelection]);

  useEffect(() => {
      dispatch(fetchData(blockchainSelection, folderDatesObject, aggregateCategoryFolders));
  }, [folderDatesObject]);

  return (
    <Routes >
      <Route path="/" element={<HomePage />} />
      <Route path="/Tables" element={<TablePage />} />
    </Routes>
  );
}

export default App;