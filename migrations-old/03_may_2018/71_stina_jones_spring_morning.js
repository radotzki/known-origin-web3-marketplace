const KnownOriginDigitalAsset = artifacts.require('KnownOriginDigitalAsset');

const loadSeedData = require('../../scripts/migrations/load-seed-data-v1');
const loadContractCredentials = require('../../scripts/migrations/loadContractCredentials');
const blocktimestampPlusOne = require('../../scripts/migrations/blocktimestampPlusOne');

const ARTWORK = {
  "ipfsPath": "stina_jones_spring_morning",
  "edition": "STJSPGMRN0001DIG",
  "costInEth": 0.085 //$50
};

const galleryData = {
  "artists": [
    {
      'name': 'Stina Jones',
      "artworks": [ARTWORK, ARTWORK, ARTWORK/*, ARTWORK, ARTWORK*/]
    }
  ]
};

const artistAccount = "0x92baffdd6cfb11a4e57a58ffec4833b4d1abd25d";

module.exports = function (deployer, network, accounts) {

  const {_curatorAccount, _developerAccount, _artistAccount} = loadContractCredentials(network, accounts, artistAccount);

  deployer
    .then(() => KnownOriginDigitalAsset.deployed())
    .then((instance) => {
      console.log(`Deployed contract to address = [${instance.address}] to network [${network}]`);

      return blocktimestampPlusOne(web3).then((_openingTime) => {
        return {
          instance,
          _openingTime
        }
      });
    })
    .then(({instance, _openingTime}) => {

      if (network === 'ganache' || network === 'live' || network === 'ropsten' || network === 'rinkeby') {
        return loadSeedData(instance, _artistAccount, _openingTime, galleryData, _developerAccount);
      } else {
        console.log(`SKIPPING loading seed data as running on ${network}`);
      }

      return instance;
    });

};
