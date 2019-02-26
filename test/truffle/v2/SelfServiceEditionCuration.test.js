const assertRevert = require('../../helpers/assertRevert');
const etherToWei = require('../../helpers/etherToWei');
const _ = require('lodash');
const bnChai = require('bn-chai');

const getBalance = require('../../helpers/getBalance');
const toBN = require('../../helpers/toBN');

const KnownOriginDigitalAssetV2 = artifacts.require('KnownOriginDigitalAssetV2');
const SelfServiceEditionCuration = artifacts.require('SelfServiceEditionCuration');

// FIXME upgrade to V2
const ArtistAcceptingBids = artifacts.require('ArtistAcceptingBids');

require('chai')
  .use(require('chai-as-promised'))
  .use(bnChai(web3.utils.BN))
  .should();

contract.only('SelfServiceEditionCuration tests', function (accounts) {

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
    // Create KODA
    this.koda = await KnownOriginDigitalAssetV2.new({from: _owner});

    // Create Auction
    this.auction = await ArtistAcceptingBids.new(this.koda.address, {from: _owner});

    // Create Minter
    this.minter = await SelfServiceEditionCuration.new(this.koda.address, this.auction.address, {from: _owner});

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
          const newEditionNumber = await this.minter.createEdition.call(edition3.total, edition3.tokenUri, edition3.price, false, {from: edition1.artist});

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
            this.minter.createEdition(edition3.total, edition3.tokenUri, edition3.price, false, {from: accounts[6]}),
            "Can only mint your own once we have enabled you on the platform"
          );
        });

      });

      describe('when enabled for selected artists', async function () {
        beforeEach(async function () {
          // enable only for edition1.artist
          await this.minter.setAllowedArtist(edition1.artist, true, {from: _owner});
        });

        it('artist 1 should be able to create multiple editions', async function () {
          const edition3 = {
            total: 10,
            tokenUri: "ipfs://edition3",
            price: etherToWei(1)
          };

          const {logs: edition1Logs} = await this.minter.createEdition(edition3.total, edition3.tokenUri, edition3.price, false, {from: edition1.artist});
          edition1Logs[0].event.should.be.equal('SelfServiceEditionCreated');
          edition1Logs[0].args._editionNumber.should.be.eq.BN(20200); // last edition no. is 20000 and has total of 100 in it
          edition1Logs[0].args._creator.should.be.equal(edition1.artist); // artist from edition 1 created it
          edition1Logs[0].args._priceInWei.should.be.eq.BN(edition3.price);
          edition1Logs[0].args._totalAvailable.should.be.eq.BN(edition3.total);

          const edition4 = {
            total: 50,
            tokenUri: "ipfs://edition4",
            price: etherToWei(2)
          };
          const {logs: edition2Logs} = await this.minter.createEdition(edition4.total, edition4.tokenUri, edition4.price, false, {from: edition1.artist});
          console.log(edition2Logs);

          edition2Logs[0].event.should.be.equal('SelfServiceEditionCreated');
          edition2Logs[0].args._editionNumber.should.be.eq.BN(20300); // last edition no. is 20200 and has total of 10 in it = 20210 - rounded up to nearest 100 = 20300
          edition2Logs[0].args._creator.should.be.equal(edition1.artist); // artist from edition 1 created it
          edition2Logs[0].args._priceInWei.should.be.eq.BN(edition4.price);
          edition2Logs[0].args._totalAvailable.should.be.eq.BN(edition4.total);
        });

        it('artist 2 should NOT be able to create edition', async function () {
          const edition3 = {
            total: 10,
            tokenUri: "ipfs://edition3",
            price: etherToWei(1)
          };
          await assertRevert(
            this.minter.createEdition(edition3.total, edition3.tokenUri, edition3.price, false, {from: edition2.artist}),
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
