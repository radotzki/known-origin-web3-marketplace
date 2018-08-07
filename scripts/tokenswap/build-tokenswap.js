// query main contract
// query for each asset
// download data
// download IPFS data
// build token swap per edition

const web3 = require('web3');


(async function () {

// Connect to the contract
  let contract = new Eth(new Eth.HttpProvider(`https://mainnet.infura.io/nbCbdzC6IG9CF6hmvAVQ`))
    .contract(require('./koda-abi'))
    .at("0xdde2d979e8d39bb8416eafcfc1758f3cab2c9c72");

  let tokenIdPointer = await contract.tokenIdPointer();
  console.log(`Token pointer at [${tokenIdPointer[0]}]`);

  let supply = _.range(0, tokenIdPointer[0]);

  _.map(supply, async (index) => {

    let edition = await this.token.editionOf(index);

    let owner = await this.token.ownerOf(index);

  });

})();
