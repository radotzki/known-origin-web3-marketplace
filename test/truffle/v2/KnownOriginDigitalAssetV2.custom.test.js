const assertRevert = require('../../helpers/assertRevert');
const {sendTransaction} = require('../../helpers/sendTransaction');
const etherToWei = require('../../helpers/etherToWei');
const {shouldSupportInterfaces} = require('./SupportsInterface.behavior');

const advanceBlock = require('../../helpers/advanceToBlock');

const _ = require('lodash');

const BigNumber = web3.BigNumber;
const KnownOriginDigitalAssetV2 = artifacts.require('KnownOriginDigitalAssetV2');
const ERC721Receiver = artifacts.require('ERC721ReceiverMockV2.sol');

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract.only('KnownOriginDigitalAssetV2 - custom', function (accounts) {
  const _owner = accounts[0];

  const account1 = accounts[1];
  const account2 = accounts[2];
  const account3 = accounts[4];

  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

  const artistAccount = accounts[8];
  const artistCommission = 76;

  const editionType = 1;

  const editionNumber1 = 100000;
  const editionData1 = "editionData1";
  const editionTokenUri1 = "edition1";
  const edition1Price = etherToWei(0.1);

  const editionNumber2 = 200000;
  const editionData2 = "editionData2";
  const editionTokenUri2 = "edition2";
  const edition2Price = etherToWei(0.2);

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {
    this.token = await KnownOriginDigitalAssetV2.new({from: _owner});
  });

  describe('ko developer account set correctly', async function () {
    it('is set on creation', async function () {
      let koCommissionAccount = await this.token.koCommissionAccount();
      koCommissionAccount.should.be.equal(_owner);
    });

    it('can be changed', async function () {
      await this.token.updateKoCommissionAccount(account1);

      let koCommissionAccount = await this.token.koCommissionAccount();
      koCommissionAccount.should.be.equal(account1);
    });

    it('only invokable from KO', async function () {
      await assertRevert(this.token.updateKoCommissionAccount(account1, {from: account1}));
    });

    it('cannot set invalid address', async function () {
      await assertRevert(this.token.updateKoCommissionAccount(ZERO_ADDRESS));
    });
  });

  describe('updateTokenBaseURI', function () {

  });

  describe('edition setup and control', async function () {

    beforeEach(async function () {
      await this.token.createEdition(editionNumber1, editionData1, editionType, 0, 0, artistAccount, artistCommission, edition1Price, editionTokenUri1, 3, {from: _owner});
      await this.token.createEdition(editionNumber2, editionData2, editionType, 0, 0, artistAccount, artistCommission, edition2Price, editionTokenUri2, 4, {from: _owner});
    });

    describe('checking raw edition data on creation', function () {

      it('edition 1 setup correctly', async function () {
        let edition = await this.token.getRawEditionData(editionNumber1);

        edition[0].should.be.bignumber.equal(editionNumber1); //_editionNumber
        web3.toAscii(edition[1]).replace(/\0/g, '').should.be.equal(editionData1); //_editionData
        edition[2].should.be.bignumber.equal(editionType); //_editionType
        edition[3].should.be.bignumber.equal(0); // _auctionStartDate
        edition[4].should.be.bignumber.equal(4294967295); // _auctionEndDate
        edition[5].should.be.equal(artistAccount); // _artistAccount
        edition[6].should.be.bignumber.equal(artistCommission); // _artistCommission
        edition[7].should.be.bignumber.equal(edition1Price); // _priceInWei
        edition[8].should.be.equal(editionTokenUri1); // _tokenURI
        edition[9].should.be.bignumber.equal(0); // _minted
        edition[10].should.be.bignumber.equal(3); // _available
        edition[11].should.be.equal(true); // _active
      });

      it('edition 2 setup correctly', async function () {
        let edition = await this.token.getRawEditionData(editionNumber2);

        edition[0].should.be.bignumber.equal(editionNumber2); //_editionNumber
        web3.toAscii(edition[1]).replace(/\0/g, '').should.be.equal(editionData2); //_editionData
        edition[2].should.be.bignumber.equal(editionType); //_editionType
        edition[3].should.be.bignumber.equal(0); // _auctionStartDate
        edition[4].should.be.bignumber.equal(4294967295); // _auctionEndDate
        edition[5].should.be.equal(artistAccount); // _artistAccount
        edition[6].should.be.bignumber.equal(artistCommission); // _artistCommission
        edition[7].should.be.bignumber.equal(edition2Price); // _priceInWei
        edition[8].should.be.equal(editionTokenUri2); // _tokenURI
        edition[9].should.be.bignumber.equal(0); // _minted
        edition[10].should.be.bignumber.equal(4); // _available
        edition[11].should.be.equal(true); // _active
      });

      it('editionsForType', async function () {
        let editions = await this.token.editionsForType(editionType);
        editions.map(e => e.toNumber()).should.be.deep.equal([editionNumber1, editionNumber2]);
      });

      describe('edition 1 query methods', function () {

        it('purchaseDatesEdition', async function () {
          let dates = await this.token.purchaseDatesEdition(editionNumber1);
          dates[0].should.be.bignumber.equal(0);
          dates[1].should.be.bignumber.equal(4294967295);
        });

        it('priceInWeiEdition', async function () {
          let priceInWei = await this.token.priceInWeiEdition(editionNumber1);
          priceInWei.should.be.bignumber.equal(edition1Price);
        });

        it('tokensOfEdition', async function () {
          let tokensOfEdition = await this.token.tokensOfEdition(editionNumber1);
          tokensOfEdition.should.be.deep.equal([]);
        });

        it('editionActive', async function () {
          let editionActive = await this.token.editionActive(editionNumber1);
          editionActive.should.be.equal(true);
        });

        it('totalRemaining', async function () {
          let totalRemaining = await this.token.totalRemaining(editionNumber1);
          totalRemaining.should.be.bignumber.equal(3);
        });

        it('numberMinted', async function () {
          let numberMinted = await this.token.numberMinted(editionNumber1);
          numberMinted.should.be.bignumber.equal(0);
        });

        it('numberAvailable', async function () {
          let numberAvailable = await this.token.numberAvailable(editionNumber1);
          numberAvailable.should.be.bignumber.equal(3);
        });

        it('tokenURIEdition', async function () {
          let tokenURIEdition = await this.token.tokenURIEdition(editionNumber1);
          tokenURIEdition.should.be.equal(`https://ipfs.infura.io/ipfs/${editionTokenUri1}`);
        });

      });

      describe('updateAuctionStartDate', function () {
        it('can be updated by whitelist', async function () {
          await this.token.updateAuctionStartDate(editionNumber1, 123456);
          let dates = await this.token.purchaseDatesEdition(editionNumber1);
          dates[0].should.be.bignumber.equal(123456);
          dates[1].should.be.bignumber.equal(4294967295);
        });

        it('should fail when not whitelisted', async function () {
          await assertRevert(this.token.updateAuctionStartDate(editionNumber1, 123456, {from: account1}));
        });
      });

      describe('updateAuctionEndDate', function () {
        it('can be updated by whitelist', async function () {
          await this.token.updateAuctionEndDate(editionNumber1, 123456);
          let dates = await this.token.purchaseDatesEdition(editionNumber1);
          dates[0].should.be.bignumber.equal(0);
          dates[1].should.be.bignumber.equal(123456);
        });

        it('should fail when not whitelisted', async function () {
          await assertRevert(this.token.updateAuctionEndDate(editionNumber1, 123456, {from: account1}));
        });
      });

      describe('updateAvailable', function () {
        it('can be updated by whitelist', async function () {
          await this.token.updateAvailable(editionNumber1, 100);
          let available = await this.token.numberAvailable(editionNumber1);
          available.should.be.bignumber.equal(100);
        });

        it('should fail when not whitelisted', async function () {
          await assertRevert(this.token.updateAvailable(editionNumber1, 100, {from: account1}));
        });
      });

      describe('updateActive', function () {
        it('can be updated by whitelist', async function () {
          await this.token.updateActive(editionNumber1, false);
          let active = await this.token.editionActive(editionNumber1);
          active.should.be.equal(false);
        });

        it('should fail when not whitelisted', async function () {
          await assertRevert(this.token.updateActive(editionNumber1, false, {from: account1}));
        });
      });

      describe('updateArtistsAccount', function () {
        it('can be updated by whitelist', async function () {
          let currentArtistEditions = await this.token.editionsOfArtists(artistAccount);
          currentArtistEditions.map(e => e.toNumber()).should.be.deep.equal([editionNumber1, editionNumber2]);

          let newArtistEditions = await this.token.editionsOfArtists(account3);
          newArtistEditions.map(e => e.toNumber()).should.be.deep.equal([]);

          await this.token.updateArtistsAccount(editionNumber1, account3);

          currentArtistEditions = await this.token.editionsOfArtists(artistAccount);
          currentArtistEditions.map(e => e.toNumber()).should.be.deep.equal([0, editionNumber2]);

          newArtistEditions = await this.token.editionsOfArtists(account3);
          newArtistEditions.map(e => e.toNumber()).should.be.deep.equal([editionNumber1]);
        });

        it('should fail when not whitelisted', async function () {
          await assertRevert(this.token.updateArtistsAccount(editionNumber1, account3, {from: account1}));
        });
      });

      describe('updateEditionType', function () {
        it('can be updated by whitelist', async function () {
          const type2 = 99;

          let currentEditions = await this.token.editionsForType(editionType);
          currentEditions.map(e => e.toNumber()).should.be.deep.equal([editionNumber1, editionNumber2]);

          let newEditions = await this.token.editionsForType(type2);
          newEditions.map(e => e.toNumber()).should.be.deep.equal([]);

          await this.token.updateEditionType(editionNumber1, type2);

          currentEditions = await this.token.editionsForType(editionType);
          currentEditions.map(e => e.toNumber()).should.be.deep.equal([0, editionNumber2]);

          newEditions = await this.token.editionsForType(type2);
          newEditions.map(e => e.toNumber()).should.be.deep.equal([editionNumber1]);
        });

        it('should fail when not whitelisted', async function () {
          await assertRevert(this.token.updateArtistsAccount(editionNumber1, account3, {from: account1}));
        });
      });

      describe('updatePriceInWei', function () {
        it('can be updated by whitelist', async function () {
          await this.token.updatePriceInWei(editionNumber1, etherToWei(1));
          let price = await this.token.priceInWeiEdition(editionNumber1);
          price.should.be.bignumber.equal(etherToWei(1));
        });

        it('should fail when not whitelisted', async function () {
          await assertRevert(this.token.updatePriceInWei(editionNumber1, etherToWei(1), {from: account1}));
        });
      });

      describe('updateEditionTokenURI', function () {
        it('can be updated by whitelist', async function () {
          await this.token.updateEditionTokenURI(editionNumber1, "newUri");
          let uri = await this.token.tokenURIEdition(editionNumber1);
          uri.should.be.equal("https://ipfs.infura.io/ipfs/newUri");
        });

        it('should fail when not whitelisted', async function () {
          await assertRevert(this.token.updateEditionTokenURI(editionNumber1, "newUri", {from: account1}));
        });
      });
    });

    describe('creating disabled editions', function () {

      const editionNumber3 = 300000;
      const editionData3 = "editionData3";
      const editionTokenUri3 = "edition3";
      const edition3Price = etherToWei(0.3);

      beforeEach(async function () {
        await this.token.createDisabledEdition(editionNumber3, editionData3, editionType, 0, 0, artistAccount, artistCommission, edition3Price, editionTokenUri3, 1, {from: _owner});
      });

      it('edition 3 setup correctly', async function () {
        let edition = await this.token.getRawEditionData(editionNumber3);

        edition[0].should.be.bignumber.equal(editionNumber3); //_editionNumber
        web3.toAscii(edition[1]).replace(/\0/g, '').should.be.equal(editionData3); //_editionData
        edition[2].should.be.bignumber.equal(editionType); //_editionType
        edition[3].should.be.bignumber.equal(0); // _auctionStartDate
        edition[4].should.be.bignumber.equal(4294967295); // _auctionEndDate
        edition[5].should.be.equal(artistAccount); // _artistAccount
        edition[6].should.be.bignumber.equal(artistCommission); // _artistCommission
        edition[7].should.be.bignumber.equal(edition3Price); // _priceInWei
        edition[8].should.be.equal(editionTokenUri3); // _tokenURI
        edition[9].should.be.bignumber.equal(0); // _minted
        edition[10].should.be.bignumber.equal(1); // _available
        edition[11].should.be.equal(false); // _active
      });

      it('editionActive', async function () {
        let active = await this.token.editionActive(editionNumber3);
        active.should.be.equal(false);
      });

    });

  });

});
