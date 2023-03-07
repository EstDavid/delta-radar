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
    const dispatch = useDispatch()

    const { 
        loading, 
        blockchainSelection,
        bestSwapSets 
    } = useSelector(scanDataSelector)

    useEffect(() => {
        dispatch(fetchBestSwapSets(blockchainSelection, bestSwapSets));
      
    }, [blockchainSelection]);

    return (
        <div className="App">
            <Navbar />
            <div className="container-fluid">
                {loading ? (
                    <FetchingData />
                ) : (
                    <div className="row d-flex justify-content-center">
                        <div className="col-12 col-xl-10 gy-2">
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