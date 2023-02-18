import React, { useEffect }  from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { 
  fetchBestSwapSets,
  scanDataSelector,
  initFields,
} from './slices/scanData';
import HomePage from './pages/HomePage';
import TablePage from './pages/TablePage';

function App() {
  const dispatch = useDispatch()

  const {
    blockchainSelection,
    bestSwapSets
} = useSelector(scanDataSelector);

  useEffect(() => {
    dispatch(initFields());
    dispatch(fetchBestSwapSets(blockchainSelection, bestSwapSets));

  }, []);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/Tables" element={<TablePage />} />
    </Routes>
  );
}

export default App;