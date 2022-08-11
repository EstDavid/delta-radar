import React  from 'react';
import Navbar from './components/Navbar';
import ScanTable from './components/ScanTable';

function App() {
  return (
    <div className="App">
      <Navbar />
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-1">
          </div>
          <div className="col-sm-10">
            <ScanTable />
          </div>
          <div className="col-sm-1">
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;