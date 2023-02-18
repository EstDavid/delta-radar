import React  from 'react';
import { useSelector } from 'react-redux';
import { 
    scanDataSelector,
} from '../slices/scanData';
import { pretifyNumber } from '../helpers/helpers';
import { TokenSequence, ExchangeSequence } from '../helpers/helperComponents';

const DeltaBadge = (props) => {
    const {
        loading,
        hasErrors,
        blockchainParameters,
        blockchainSelection,
        fields
    } = useSelector(scanDataSelector);

    const { name, timespanHours, swapSetCategories } = props.swapset;

    const swapSet = swapSetCategories.theoreticalDeltaRefToken;

    const {tokenData, scannerDomain, symbolNativeToken} = blockchainParameters[blockchainSelection];

    let timestamp, tokenSequence, exchangeSequence, delta, deltaPerc, deltaRefToken;
    if(!loading && !hasErrors) {
        timestamp = swapSet.timestamp;
        tokenSequence = swapSet.tokenSequence.split('=>');
        exchangeSequence = swapSet.exchangeSequence.split('=>');
        delta = swapSet.theoreticalDelta;
        deltaPerc = swapSet.theoreticalDeltaPercentage;
        deltaRefToken = swapSet.theoreticalDeltaRefToken;
    }

    return (
        <div className="col">
            <div className="card">
                <div className="card-header bg-warning fw-bold">
                    <h5>Best Delta{timespanHours !== undefined ? ` in the last ${name}`: ` of ${name}`}</h5>
                </div>
                <div className="card-body bg-dark text-white">
                    {loading || hasErrors || swapSet.length === 0 ? 
                    <span>Data loading...</span>
                    :
                        <div>
                            <div className="d-flex my-2 align-items-center">
                                <h4><span className="badge bg-primary me-2">Date:</span></h4>
                                <p className="card-text">{timestamp.toLocaleString() + ' :'}</p>
                            </div>    
                            <div className="d-flex my-2 align-items-center flex-wrap">
                                <h4><span className="badge bg-primary me-2">Token Sequence:</span></h4>
                                <TokenSequence
                                    color="white"
                                    tokenData={tokenData}
                                    tokenArray={tokenSequence}
                                    scannerDomain={scannerDomain} 
                                />
                            </div>
                            <div className="d-flex my-2 align-items-center flex-wrap">
                                <h4><span className="badge bg-primary me-2">Exchange Sequence:</span></h4>
                                <ExchangeSequence color="white" exchangeArray={exchangeSequence} />
                            </div>
                            <div className="d-flex my-2 align-items-center flex-wrap">
                                <h3><span className="badge bg-primary me-2">Delta: </span></h3>
                                <h4>
                                    <span className="badge rounded-pill  bg-light text-dark mx-2">{`${pretifyNumber(delta)} ${tokenSequence[0]}`}</span>
                                    <span className="badge rounded-pill  bg-info text-dark mx-2">{`(${pretifyNumber(deltaRefToken)} ${symbolNativeToken})`}</span>
                                </h4>
                                <h5>
                                    <span className="fs-6 me-4">({pretifyNumber(deltaPerc/100)} %)</span>
                                </h5>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default DeltaBadge;
