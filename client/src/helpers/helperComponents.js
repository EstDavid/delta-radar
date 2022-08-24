import React from 'react';
import {exchangeLogos} from './exchangeLogos';

export const TokenSequence = (props) => {
    return (
        <div className="d-flex justify-content-center flex-wrap">
            {props.tokenArray.map((symbol, tokenIndex) => {
                const token = props.tokenData[symbol];
                return (
                    <span key={tokenIndex} className="d-flex flex-row">
                        {tokenIndex > 0 ? <i className={`bi bi-caret-right text-${props.color} mx-2`}></i> : ''}
                        {token === undefined ?
                            symbol :
                            <a className="d-flex flex-row text-decoration-none text-reset"
                                href={`${props.scannerDomain}${token[2].toLowerCase()}`}
                                target="_blank" rel="noreferrer noopener">
                                <img className="me-1 token-logo" src={token[4]}></img>{symbol}
                            </a>
                        }
                    </span>
                )
            })}
        </div>
    )
}

export const ExchangeSequence = (props) => {
    return (
        <div className="d-flex justify-content-center flex-wrap">
            {props.exchangeArray.map((symbol, exchangeIndex) => {
                return (
                    <span key={exchangeIndex} className="d-flex flex-row">
                        {exchangeIndex > 0 ? <i className={`bi bi-caret-right text-${props.color} mx-2`}></i> : ''}
                        <a className="d-flex flex-row text-decoration-none text-reset"
                            href=""
                            target="_blank" rel="noreferrer noopener">
                            <img className="me-1 token-logo" src={exchangeLogos[symbol] ? exchangeLogos[symbol]: ''}></img>{symbol}
                        </a>
                    </span>
                )
            })}
        </div>
    )
}