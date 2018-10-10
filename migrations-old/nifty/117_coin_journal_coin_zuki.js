const KnownOriginDigitalAsset = artifacts.require('KnownOriginDigitalAsset');

const loadSeedData = require('../../scripts/migrations/load-seed-data-v2');
const loadContractCredentials = require('../../scripts/migrations/loadContractCredentials');
const blocktimestampPlusOne = require('../../scripts/migrations/blocktimestampPlusOne');

const assetType = 'DIG'; // 3
const artistCode = 'CNJ'; // 3

const artworkCode = 'COINZUKI00'; // 10

const ARTWORK = {
  'ipfsPath': 'coin_journal_coin_zuki',
  'edition': `${artistCode}${artworkCode}${assetType}`,
  'costInEth': 0.022 // $10
};

const galleryData = {
  'artists': [
    {
      'artworks': [ARTWORK, ARTWORK, ARTWORK]
    }
  ]
};

module.exports = function (deployer, network, accounts) {

  // uses artist code to find ETH address
  const {_curatorAccount, _developerAccount, _artistAccount} = loadContractCredentials(
    network,
    accounts,
    null,
    artistCode
  );

  deployer
    .then(() => KnownOriginDigitalAsset.deployed())
    .then((instance) => {
      console.log(`Deployed contract to address = [${instance.address}] to network [${network}]`);

      const startOf24thJulyInUK = 1532386800;
      if (network === 'ganache' || network === 'live' || network === 'ropsten' || network === 'rinkeby') {
        return loadSeedData({web3, instance, network, _artistAccount, _openingTime: startOf24thJulyInUK, galleryData, _developerAccount});
      } else {
        console.log(`SKIPPING loading seed data as running on ${network}`);
      }

      return instance;
    });
};
