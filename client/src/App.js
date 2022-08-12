import React  from 'react';
import Navbar from './components/Navbar';
import ScanTable from './components/ScanTable';
import FiltersSidebar from './components/FiltersSidebar';

function App() {
  return (
    <div className="App">
      <Navbar />
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-3">
            <FiltersSidebar />
          </div>
          <div className="col-sm-9">
            <ScanTable />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;