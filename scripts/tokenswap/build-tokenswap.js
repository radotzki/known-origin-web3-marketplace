// query main contract
// query for each asset
// download data
// download IPFS data
// build token swap per edition

const Eth = require('ethjs');
const Web3 = require('web3');
const Promise = require('bluebird');
const _ = require('lodash');


(async function () {

// Connect to the contract
  let contract = new Eth(new Eth.HttpProvider(`https://mainnet.infura.io/nbCbdzC6IG9CF6hmvAVQ`))
    .contract(require('./koda-abi'))
    .at("0xdde2d979e8d39bb8416eafcfc1758f3cab2c9c72");

  let tokenIdPointer = await contract.tokenIdPointer();
  console.log(`Token pointer at [${tokenIdPointer[0]}]`);

  let supply = _.range(0, tokenIdPointer[0]);

  _.forEach(supply, async (tokenId) => {

    let exists = await contract.exists(tokenId);

    if (exists) {
      Promise.props({
        assetInfo: assetInfo(contract, tokenId),
        editionInfo: editionInfo(contract, tokenId)
      })
        .then(({assetInfo, editionInfo}) => {
          console.log(assetInfo, editionInfo);
        });
    }
  });

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

})();
