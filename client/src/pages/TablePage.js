import React  from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ScanTable from '../components/ScanTable';
import FiltersSidebar from '../components/FiltersSidebar';

function TablePage() {
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