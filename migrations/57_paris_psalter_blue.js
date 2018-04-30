
const KnownOriginDigitalAsset = artifacts.require('KnownOriginDigitalAsset');

const loadSeedData = require('../scripts/migrations/loadSeedData');
const loadContractCredentials = require('../scripts/migrations/loadContractCredentials');
const blocktimestampPlusOne = require('../scripts/migrations/blocktimestampPlusOne');

const ARTWORK = {
  "ipfsPath": "paris_salter_blue",
  "edition": "PSPBLUE000000DIG",
  "numberOfEditions": 1,
  "costInEth": 0.2
};

const galleryData = {
  "artists": [
    {
      "name": "Paris Psalter",
      "artworks": [ARTWORK, ARTWORK, ARTWORK, ARTWORK, ARTWORK]
    }
  ]
};

const artistAccount = "0x8d01Bdf55Fa7f1CCfef7b670a11B8c14faf827Bf";

module.exports = async function (deployer, network, accounts) {

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
};
