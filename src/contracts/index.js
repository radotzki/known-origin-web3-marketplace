/* global web3:true */
import Web3 from 'web3';

import contract from 'truffle-contract';

// import artifacts
import knownOriginDigitalAssetJSON from '../../build/contracts/KnownOriginDigitalAsset.json';
KnownOriginDigitalAsset = contract(knownOriginDigitalAssetJSON);

// create contracts
let KnownOriginDigitalAsset;

if (typeof web3 !== 'undefined') {
  KnownOriginDigitalAsset.setProvider(web3.currentProvider);
} else {
  KnownOriginDigitalAsset = contract(knownOriginDigitalAssetJSON);
  KnownOriginDigitalAsset.setProvider(new Web3.providers.HttpProvider("https://mainnet.infura.io/nbCbdzC6IG9CF6hmvAVQ"));
}

export {
  KnownOriginDigitalAsset
};
