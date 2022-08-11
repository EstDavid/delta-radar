import React, { useEffect } from 'react';
import MetaMaskOnboarding from '@metamask/onboarding';
import { useDispatch, useSelector } from 'react-redux';
import { accountsSelector, checkProvider, loadBalances, loadProvider, loadAccount } from '../slices/accounts';
import { checkBlockchain, requestBlockchain, blockchainSelector } from '../slices/blockchain';

const OnboardingButton = (props) => {

  const dispatch = useDispatch();

  const {account, metamaskInstalled} = useSelector(accountsSelector);

  const { currentBlockchainId, defaultBlockchain, defaultBlockchainActive } = useSelector(blockchainSelector);
  
  const ONBOARD_TEXT = "Click here to install Metamask";
  const CONNECT_TEXT = "Connect Metamask";
  const SWITCH_TEXT = `Switch to ${defaultBlockchain.chainName}`;
  
  const onboarding = new MetaMaskOnboarding();

  let buttonText;
  let isDisabled = false;

  if(!metamaskInstalled) {
    buttonText = ONBOARD_TEXT;
  } else if (!defaultBlockchainActive && account !== undefined) {
    buttonText = SWITCH_TEXT;
  } else if (account !== undefined) {
    buttonText = `${account.slice(0,6)}...${account.slice(account.length - 4)}`;
    isDisabled = true;
    onboarding.stopOnboarding();
  } else {
    buttonText = CONNECT_TEXT;
  }

  const handleNewAccount = async () => {
    const provider = await dispatch(loadProvider());
    await dispatch(loadAccount(provider));
    const id = await dispatch(checkBlockchain(provider));
    if(!defaultBlockchainActive) {
      dispatch(requestBlockchain(provider, defaultBlockchain));
    }
  }

  useEffect(() => {
    dispatch(checkProvider());
  }, []);

  const onClick = () => {
    if (metamaskInstalled) {
      handleNewAccount();
    } else {
      onboarding.startOnboarding();
    }
  };
  return (
    <button 
      className="btn btn-warning alert-button col-md-auto mb-3 mb-md-0 me-md-3" 
      disabled={isDisabled}
      onClick={onClick}>
      {buttonText}
    </button>
  );
}

export default OnboardingButton;