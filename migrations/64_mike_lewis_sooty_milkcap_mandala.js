const KnownOriginDigitalAsset = artifacts.require('KnownOriginDigitalAsset');

const loadSeedData = require('../scripts/migrations/loadSeedData');
const loadContractCredentials = require('../scripts/migrations/loadContractCredentials');
const blocktimestampPlusOne = require('../scripts/migrations/blocktimestampPlusOne');

const ARTWORK = {
  "ipfsPath": "mike_lewis_sooty_milkcap_mandala",
  "edition": "MKLSTYMLKCAPMD01",
  "numberOfEditions": 1,
  "costInEth": 0.15
};

const galleryData = {
  "artists": [
    {
      "name": "Mike Lewis",
      "artworks": [ARTWORK, ARTWORK, ARTWORK, ARTWORK, ARTWORK, ARTWORK, ARTWORK, ARTWORK, ARTWORK, ARTWORK]
    }
  ]
};

module.exports = async function (deployer, network, accounts) {

  try {
    let instance = await KnownOriginDigitalAsset.deployed();
    console.log(`Deployed contract to address = [${instance.address}] to network [${network}]`);

    const {_curatorAccount, _developerAccount, _artistAccount} = loadContractCredentials(network, accounts);
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
