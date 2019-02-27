const assertRevert = require('../../../helpers/assertRevert');
const etherToWei = require('../../../helpers/etherToWei');
const _ = require('lodash');
const bnChai = require('bn-chai');
const bytesToString = require('../../../helpers/bytesToString');

const getBalance = require('../../../helpers/getBalance');
const toBN = require('../../../helpers/toBN');

const KnownOriginDigitalAssetV2 = artifacts.require('KnownOriginDigitalAssetV2');
const SelfServiceEditionCuration = artifacts.require('SelfServiceEditionCuration');

const ArtistAcceptingBidsV2 = artifacts.require('ArtistAcceptingBidsV2');

require('chai')
  .use(require('chai-as-promised'))
  .use(bnChai(web3.utils.BN))
  .should();

contract('SelfServiceEditionCuration tests', function (accounts) {

  const ROLE_KNOWN_ORIGIN = 1;
  const MAX_UINT32 = 4294967295;
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

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
    this.auction = await ArtistAcceptingBidsV2.new(this.koda.address, {from: _owner});

    // Create Minter
    this.minter = await SelfServiceEditionCuration.new(this.koda.address, this.auction.address, {from: _owner});

    // Whitelist the minting contract
    await this.koda.addAddressToAccessControl(this.minter.address, ROLE_KNOWN_ORIGIN, {from: _owner});

    // Whitelist the self service contract
    await this.auction.addAddressToWhitelist(this.minter.address, {from: _owner});
  });

  beforeEach(async function () {
    // Create 2 editions
    await this.koda.createActiveEdition(edition1.number, editionData, editionType, 0, 0, edition1.artist, artistCommission, edition1Price, edition1.tokenUri, edition1.total, {from: _owner});
    await this.koda.createActiveEdition(edition2.number, editionData, editionType, 0, 0, edition2.artist, artistCommission, edition1Price, edition2.tokenUri, edition2.total, {from: _owner});
  });

  describe('creating new editions', async function () {

    describe('success without enabling auctions', async function () {

      describe('when enabled for all artists', async function () {

        beforeEach(async function () {
          // enable for all artists on the platform
          await this.minter.setOpenToAllArtist(true, {from: _owner});
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
          await this.minter.setOpenToAllArtist(false, {from: _owner});
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

    describe('success an enabling auctions', async function () {

      beforeEach(async function () {
        await this.minter.setOpenToAllArtist(true, {from: _owner});
      });

      it('can mint new edition and enables auction', async function () {
        const edition3 = {
          total: 10,
          tokenUri: "ipfs://edition3",
          price: etherToWei(1)
        };

        const creator = edition1.artist;
        const expectedEditionNumber = 20200;

        // Check logs from creation call
        const {logs} = await this.minter.createEdition(edition3.total, edition3.tokenUri, edition3.price, true, {from: creator});
        logs[0].event.should.be.equal('SelfServiceEditionCreated');
        logs[0].args._editionNumber.should.be.eq.BN(expectedEditionNumber); // last edition no. is 20000 and has total of 100 in it
        logs[0].args._creator.should.be.equal(creator); // artist from edition 1 created it
        logs[0].args._priceInWei.should.be.eq.BN(edition3.price);
        logs[0].args._totalAvailable.should.be.eq.BN(edition3.total);

        // Check edition created in KODA
        const edition = await this.koda.detailsOfEdition(expectedEditionNumber);
        edition[1].should.be.eq.BN(1);
        edition[2].should.be.eq.BN(0);
        edition[3].should.be.eq.BN(MAX_UINT32);
        edition[4].should.be.equal(creator);
        edition[5].should.be.eq.BN(85); // reduced commission for KO with self service?
        edition[6].should.be.eq.BN(edition3.price);
        edition[7].should.be.equal(`https://ipfs.infura.io/ipfs/${edition3.tokenUri}`);
        edition[8].should.be.eq.BN(0);
        edition[9].should.be.eq.BN(edition3.total);
        edition[10].should.be.equal(true);

        // check auction details
        const {_enabled, _bidder, _value, _controller} = await this.auction.auctionDetails(expectedEditionNumber);
        _enabled.should.be.equal(true);
        _bidder.should.be.equal(ZERO_ADDRESS);
        _value.should.be.eq.BN(0);
        _controller.should.be.equal(creator);
      });

    });

    describe('failing validation', async function () {

      beforeEach(async function () {
        await this.minter.setOpenToAllArtist(true, {from: _owner});
      });

      it('should fail when creating editions larger than 100', async function () {
        await assertRevert(
          this.minter.createEdition(101, "123", etherToWei(1), false, {from: edition2.artist}),
          "Unable to create editions of this size at present"
        );
      });

      it('should fail when creating editions of size of zero', async function () {
        await assertRevert(
          this.minter.createEdition(0, "123", etherToWei(1), false, {from: edition2.artist}),
          "Unable to create editions of this size 0"
        );
      });

      it('should fail if artist not on the KO platform and minter NOT open to all', async function () {
        await assertRevert(
          this.minter.createEdition(10, "123", etherToWei(1), false, {from: _owner}),
          "Can only mint your own once we have enabled you on the platform"
        );
      });

      it('should fail when token URI not defined', async function () {
        await assertRevert(
          this.minter.createEdition(100, "", etherToWei(1), false, {from: edition2.artist}),
          "Token URI is missing"
        );
      });

      it('should fail if artist not on the KO platform and minter IS open to all', async function () {
        await assertRevert(
          this.minter.createEdition(100, "232323", etherToWei(1), false, {from: koCommission}),
          "Can only mint your own once we have enabled you on the platform"
        );
      });
    });

  });

});
