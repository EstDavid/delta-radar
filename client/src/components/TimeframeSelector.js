import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    changeTimeframe,
    priceDataSelector
  } from '../slices/priceData';
  
import {timeframes, topTimeframes} from '../helpers/timeframes';

const TimeframeSelector = () => {
    const dispatch = useDispatch();

    const { viewTimeframe } = useSelector(priceDataSelector);

    const allTimeframes = Object.keys(timeframes);

    const timeframeClick = (timeframe) => {
        dispatch(changeTimeframe(timeframe));
    }

    const abbreviateName = (name) => {
        let [number, timeUnit] = name.split(' ');
        return number.toString() + timeUnit.substring(0,1).toUpperCase();
    }

    const toptimeframeSelected = () => {
        for(let key of topTimeframes) {
            if(viewTimeframe === timeframes[key]) {
                return true;
            }            
        }
        return false
    }

    return (
        <div className="btn-group btn-group-sm" role="group" aria-label="Button group with nested dropdown">
            {topTimeframes.map((key, index) => {
                let timeframe = timeframes[key];
                let abbreviation = abbreviateName(timeframe.name);
                return (
                    <button
                        key={index}
                        type="button"
                        className={`btn btn-sm btn-outline-primary${timeframe === viewTimeframe ? ' active' : ''}`}
                        onClick={() => timeframeClick(timeframe)}
                    >{abbreviation}</button>
                )
            })}

            <div 
                className={`btn-group btn-group-sm${toptimeframeSelected() ? ' main-timeframe' : ' special-timeframe'}`} 
                role="group">
                <button
                    className={`btn btn-sm btn-primary dropdown-toggle`}
                    id="btnGroupDrop1"
                    type="button"
                    data-bs-toggle="dropdown"
                    data-bs-target="#timeframe-dropdown"
                    aria-expanded="false"
                    >
                    {toptimeframeSelected() ? 'More' : abbreviateName(viewTimeframe.name)}
                </button>
                <ul className="dropdown-menu" id="timeframe-dropdown" aria-labelledby="btnGroupDrop1">
                    {allTimeframes.map((key, index) => {
                        let timeframe = timeframes[key];
                        return <li key={index} onClick={() => timeframeClick(timeframe)}><a className="dropdown-item" href="#">{timeframe.name}</a></li>
                    })
                    }
                </ul>
            </div>
        </div>
    )
}

export default TimeframeSelector;