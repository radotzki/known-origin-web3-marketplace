const ArtistAcceptingBids = artifacts.require('ArtistAcceptingBids');

const HDWalletProvider = require('truffle-hdwallet-provider');
const infuraApikey = 'nbCbdzC6IG9CF6hmvAVQ';

module.exports = async function (deployer, network, accounts) {

  let _koAccount = accounts[0];

  // Load in other accounts for different networks
  if (network === 'ropsten' || network === 'rinkeby') {
    _koAccount = new HDWalletProvider(require('../../mnemonic'), `https://${network}.infura.io/${infuraApikey}`, 0).getAddress();
  }

  if (network === 'live') {
    _koAccount = new HDWalletProvider(require('../../mnemonic_live'), `https://mainnet.infura.io/${infuraApikey}`, 0).getAddress();
  }

  console.log(`Running within network = ${network}`);
  console.log(`_koAccount = ${_koAccount}`);

  let auction = await ArtistAcceptingBids.deployed();

  return auction.setArtistsAddressAndEnabledEdition(18600, "0xa2cD656f8461d2C186D69fFB8A4a5c10EFF0914d");
};
