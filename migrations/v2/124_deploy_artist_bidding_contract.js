const KnownOriginDigitalAssetV2 = artifacts.require('KnownOriginDigitalAssetV2');
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

  let koda = await KnownOriginDigitalAssetV2.deployed();

  return deployer.deploy(ArtistAcceptingBids, koda.address);
};
