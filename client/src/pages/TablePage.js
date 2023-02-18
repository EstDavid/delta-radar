import React, { useEffect }  from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ScanTable from '../components/ScanTable';
import FiltersSidebar from '../components/FiltersSidebar';
import { useDispatch, useSelector } from 'react-redux';
import { fetchListSwapSets, scanDataSelector } from '../slices/scanData';

function TablePage() {
  const dispatch = useDispatch()

  const {
    blockchainSelection,
    sortedFields,
} = useSelector(scanDataSelector);

useEffect(() => {
  dispatch(fetchListSwapSets(blockchainSelection, sortedFields));

}, [blockchainSelection, sortedFields]);

  return (
    <div className="App">
      <Navbar />
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-2">
            <FiltersSidebar />
          </div>
          <div className="col-lg-9 col-12">
            <ScanTable />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TablePage;