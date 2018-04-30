const KnownOriginDigitalAsset = artifacts.require('KnownOriginDigitalAsset');

const loadSeedData = require('../scripts/migrations/loadSeedData');
const loadContractCredentials = require('../scripts/migrations/loadContractCredentials');
const blocktimestampPlusOne = require('../scripts/migrations/blocktimestampPlusOne');

const ARTWORK = {
  "ipfsPath": "lee_holland_priestess",
  "edition": "LHDPRIESTESS0001",
  "numberOfEditions": 1,
  "costInEth": 0.09
};

const galleryData = {
  "artists": [
    {
      "name": "Lee Holland",
      "artworks": [ARTWORK, ARTWORK, ARTWORK, ARTWORK, ARTWORK]
    }
  ]
};

const artistAccount = "0x109ab2d5d70229bebfb4961821feafc66fa90150";

module.exports = async function (deployer, network, accounts) {

  try {
    let instance = await KnownOriginDigitalAsset.deployed();
    console.log(`Deployed contract to address = [${instance.address}] to network [${network}]`);

    const {_curatorAccount, _developerAccount, _artistAccount} = loadContractCredentials(network, accounts, artistAccount);
    const _openingTime = await blocktimestampPlusOne(web3);

    if (network === 'ganache' || network === 'live' || network === 'ropsten' || network === 'rinkeby') {
      return loadSeedData(instance, _artistAccount, _openingTime, galleryData, _developerAccount);
    } else {
      console.log(`SKIPPING loading seed data as running on ${network}`);
    }

    return instance;
  } catch (e) {
    // handle the rejection here
    console.log("Failure", e);
  }
};
