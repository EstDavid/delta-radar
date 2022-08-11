import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import OnboardingButton from './Onboarding';

const Navbar = () => {

  const dispatch = useDispatch();

  const symbolAll = `ALL`;

  return(
    <nav className="navbar navbar-expand-md navbar-dark bg-dark text-white pb-2" aria-label="UniCharts navbar">
      <div className="container-fluid">
        <a href="/" className="navbar-brand text-white text-decoration-none me-md-auto">
          <span>Delta Radar</span>
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar-menu" aria-controls="navbar-menu" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbar-menu">
          <div className="navbar-nav ms-auto flex-nowrap mt-3 mt-md-0">
            <OnboardingButton />
            <a
              role="button"
              className="btn btn-outline-light"
              href="https://github.com/Vandenynas/uniswapv3-charts"
              target="_blank"
              rel="noreferrer noopener"
            ><i className="bi bi-github"></i>View on Github</a>
          </div>
        </div>
      </div>
    </nav> 
  )
}

export default Navbar;