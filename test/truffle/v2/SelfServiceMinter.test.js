const assertRevert = require('../../helpers/assertRevert');
const etherToWei = require('../../helpers/etherToWei');
const _ = require('lodash');
const bnChai = require('bn-chai');

const getBalance = require('../../helpers/getBalance');
const toBN = require('../../helpers/toBN');

const KnownOriginDigitalAssetV2 = artifacts.require('KnownOriginDigitalAssetV2');
const SelfServiceMinter = artifacts.require('SelfServiceMinter');

require('chai')
  .use(require('chai-as-promised'))
  .use(bnChai(web3.utils.BN))
  .should();

contract.only('SelfServiceMinter tests', function (accounts) {

  const ROLE_KNOWN_ORIGIN = 1;

  const _owner = accounts[0];
  const koCommission = accounts[1];

  const editionType = 1;
  const editionData = web3.utils.asciiToHex("editionData");
  const edition1Price = etherToWei(0.1);

  const artistCommission = 76;

  const edition1 = {
    number: 10000,
    artist: accounts[2],
    tokenUri: "edition1",
    total: 100
  };

  const edition2 = {
    number: 20000,
    artist: accounts[3],
    tokenUri: "edition2",
    total: 100
  };

  beforeEach(async function () {
    // Create contracts
    this.koda = await KnownOriginDigitalAssetV2.new({from: _owner});
    this.minter = await SelfServiceMinter.new(this.koda.address, {from: _owner});

    // Whitelist the minting contract
    await this.koda.addAddressToAccessControl(this.minter.address, ROLE_KNOWN_ORIGIN, {from: _owner});
  });

  beforeEach(async function () {
    // Create 2 editions
    await this.koda.createActiveEdition(edition1.number, editionData, editionType, 0, 0, edition1.artist, artistCommission, edition1Price, edition1.tokenUri, edition1.total, {from: _owner});
    await this.koda.createActiveEdition(edition2.number, editionData, editionType, 0, 0, edition2.artist, artistCommission, edition1Price, edition2.tokenUri, edition2.total, {from: _owner});
  });

  describe('creating new editions', async function () {


    describe.only('successfully', async function () {

      describe('when enabled for all artists', async function () {

        beforeEach(async function () {
          // enable for all artists on the platform
          await this.minter.setOpenToAllArtist(true, {from: _owner});
        });

        it('should be able to create edition', async function () {
          const edition3 = {
            total: 10,
            tokenUri: "ipfs://edition3",
            price: etherToWei(1)
          };
          const newEditionNumber = await this.minter.createEdition.call(edition3.total, edition3.tokenUri, edition3.price, {from: edition1.artist});

          console.log(newEditionNumber);

          // TODO verify created edition
        });

        it('unknown artists should NOT be able to create edition', async function () {
          const edition3 = {
            total: 10,
            tokenUri: "ipfs://edition3",
            price: etherToWei(1)
          };
          await assertRevert(
            this.minter.createEdition(edition3.total, edition3.tokenUri, edition3.price, {from: accounts[6]}),
            "Can only mint your own once we have enabled you on the platform"
          );
        });

      });

      describe('when enabled for selected artists', async function () {
        beforeEach(async function () {
          // enable only for edition1.artist
          await this.minter.setAllowedArtist(edition1.artist, true, {from: _owner});
        });

        it('artist 1 should be able to create edition', async function () {
          const edition3 = {
            total: 10,
            tokenUri: "ipfs://edition3",
            price: etherToWei(1)
          };
          await this.minter.createEdition(edition3.total, edition3.tokenUri, edition3.price, {from: edition1.artist});
        });

        it('artist 2 should NOT be able to create edition', async function () {
          const edition3 = {
            total: 10,
            tokenUri: "ipfs://edition3",
            price: etherToWei(1)
          };
          await assertRevert(
            this.minter.createEdition(edition3.total, edition3.tokenUri, edition3.price, {from: edition2.artist}),
            "Only allowed artists can create editions for now"
          );
        });
      });

    });

    describe('failing validation', async function () {

      it('should fail when creating editions larger than 100', async function () {

      });

      it('should fail if artist not on the KO platform and minter NOT open to all', async function () {

      });

      it('should fail if artist not on the KO platform and minter IS open to all', async function () {

      });

      it('should fail when creating editions of size of zero', async function () {

      });

      it('should fail when token URI not found', async function () {

      });

    });


  });

});
