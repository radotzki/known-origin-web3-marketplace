const Eth = require('ethjs');
const Web3 = require('web3');
const Promise = require('bluebird');
const _ = require('lodash');
const fs = require('fs');

(async function () {


  function assetInfo(contract, tokenId) {
    return contract.assetInfo(tokenId)
      .then((data) => {
        const priceInWei = data._priceInWei.toString(10);
        return {
          tokenId,
          owner: data._owner,
          purchaseState: data._purchaseState.toNumber(),
          priceInWei: priceInWei,
          priceInEther: Web3.utils.fromWei(priceInWei, 'ether').valueOf(),
          purchaseFromTime: data._purchaseFromTime.toString(10)
        };
      }).catch((e) => console.log(e));
  }

  function editionInfo(contract, tokenId) {
    return contract.editionInfo(tokenId)
      .then((data) => {
        let edition = Web3.utils.toAscii(data._edition);
        return {
          tokenId,
          edition,
          rawEdition: data._edition,
          editionNumber: data._editionNumber.toNumber(),
          tokenURI: data._tokenURI.toString(),
          artistAccount: data._artistAccount
        };
      }).catch((e) => console.log(e));
  }

  function getMarketplaceContractAddress(network) {
    switch (network) {
      case 'mainnet':
        return '0xdde2d979e8d39bb8416eafcfc1758f3cab2c9c72';
      case 'ropsten':
        return '0x986933d91344c7b4f98c747f8a7c98f0ce27cee2';
      case 'rinkeby':
        return '0xf0d6a41a3f011e06260f9133101b82b405539167';
      case 'local':
        // This may change if a clean deploy of KODA locally is not done
        return '0x194bafbf8eb2096e63c5d9296363d6dacdb32527';
      default:
        throw new Error(`Unknown network ID ${network}`);
    }
  }

})();
