import React, { useEffect }  from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import DeltaBadge from '../components/DeltaBadge';
import { 
    fetchBestSwapSets,
    scanDataSelector,
  } from '../slices/scanData';
import FetchingData from '../components/FetchingData';

function HomePage() {
    const { loading, bestSwapSets } = useSelector(scanDataSelector)

    return (
        <div className="App">
            <Navbar />
            <div className="container-fluid">
                {loading ? (
                    <FetchingData />
                ) : (
                    <div className="row">
                        <div className="col-md-2"></div>
                        <div className="col-12 col-md-8 gy-2">
                            <div className="row row-cols-1 row-cols-lg-2 g-4">
                                {bestSwapSets.map((swapSet, index) => {
                                    return (
                                        <DeltaBadge
                                            key={index}
                                            swapset={swapSet}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default HomePage;