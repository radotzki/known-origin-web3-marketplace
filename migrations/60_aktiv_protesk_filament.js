const KnownOriginDigitalAsset = artifacts.require('KnownOriginDigitalAsset');

const loadSeedData = require('../scripts/migrations/loadSeedData');
const loadContractCredentials = require('../scripts/migrations/loadContractCredentials');
const blocktimestampPlusOne = require('../scripts/migrations/blocktimestampPlusOne');

const ARTWORK = {
  "ipfsPath": "aktiv_protesk_filament",
  "edition": "AKPFILAMENT00DIG",
  "numberOfEditions": 1,
  "costInEth": 0.008
};

const galleryData = {
  "artists": [
    {
      "name": "Aktiv Protesk",
      "artworks": [ARTWORK, ARTWORK, ARTWORK, ARTWORK, ARTWORK, ARTWORK, ARTWORK, ARTWORK, ARTWORK, ARTWORK]
    }
  ]
};

const artistAccount = "0x7DEc37c03ea5ca2C47ad2509BE6abAf8C63CDB39";

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
