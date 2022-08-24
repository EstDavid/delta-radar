import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { switchBlockchain, scanDataSelector } from '../slices/scanData';

const Navbar = () => {
  const dispatch = useDispatch();

  const {
    blockchainSelection,
    blockchainParameters,
  } = useSelector(scanDataSelector);

  const handleBlockchainChange = (event) => {
    const blockchainKey = event.target.firstChild.nodeValue;
    if(blockchainSelection !== blockchainKey) dispatch(switchBlockchain(blockchainKey));
  }

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-dark text-white pb-2" aria-label="UniCharts navbar">
      <div className="container-fluid">
        <a href="/" className="navbar-brand text-white text-decoration-none me-md-auto">
          <span>Delta Radar</span>
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar-menu" aria-controls="navbar-menu" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse ms-5" id="navbarsExample03">
          <ul className="navbar-nav me-auto mb-2 mb-sm-0">
            <li className="nav-item">
              <NavLink
                to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link inactive')}
              >Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/Tables" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link inactive')}
              >Tables</NavLink>
            </li>
          </ul>
        </div>

        <div className="collapse navbar-collapse" id="navbar-menu">
          <div className="ms-auto d-flex mt-3 mt-md-0">

            <div className="btn-group mx-3" role="group" aria-label="Button group with nested dropdown">
              <button type="button" className="btn btn-light" disabled>Select blockchain</button>

              <div className="btn-group btn-group-light" role="group">
                <button type="button" className="btn btn-light dropdown-toggle"
                  data-bs-toggle="dropdown" aria-expanded="false">
                  {blockchainSelection}
                </button>
                <ul className="dropdown-menu" onClick={handleBlockchainChange}>
                  {Object.keys(blockchainParameters).map((blockchainKey, index) => {
                    return (
                      <li key={index}><span className="dropdown-item" value={blockchainKey}>{blockchainKey}</span></li>
                    )
                  })}
                </ul>
              </div>
            </div>

            <a
              role="button"
              className="btn btn-outline-light"
              href="https://github.com/EstDavid/delta-radar"
              target="_blank"
              rel="noreferrer noopener"
            ><i className="bi bi-github me-2"></i>View on Github</a>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar;