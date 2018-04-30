const KnownOriginDigitalAsset = artifacts.require('KnownOriginDigitalAsset');

const loadSeedData = require('../scripts/migrations/loadSeedData');
const loadContractCredentials = require('../scripts/migrations/loadContractCredentials');
const blocktimestampPlusOne = require('../scripts/migrations/blocktimestampPlusOne');

const ARTWORK = {
  "ipfsPath": "tony_smith_theyre_watching",
  "edition": "TSMTHEYWATCH0001",
  "numberOfEditions": 1,
  "costInEth": 1.1
};

const galleryData = {
  "artists": [
    {
      "name": "Tony Smith",
      "artworks": [ARTWORK]
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
