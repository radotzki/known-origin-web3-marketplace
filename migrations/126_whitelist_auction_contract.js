const ArtistAcceptingBids = artifacts.require('ArtistAcceptingBids');
const KnownOriginDigitalAssetV2 = artifacts.require('KnownOriginDigitalAssetV2');

module.exports = async function (deployer, network, accounts) {

  let _koAccount = accounts[0];
  console.log(`Running within network = ${network}`);
  console.log(`_koAccount = ${_koAccount}`);

  const ROLE_MINTER = 2;

  const koda = await KnownOriginDigitalAssetV2.deployed();
  const auction = await ArtistAcceptingBids.deployed();

  console.log("Auction address", auction.address);

  await koda.addAddressToAccessControl(auction.address, ROLE_MINTER, {from: _koAccount});
};
