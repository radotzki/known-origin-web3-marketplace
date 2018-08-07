const assertRevert = require('../../helpers/assertRevert');
const etherToWei = require('../../helpers/etherToWei');
const advanceBlock = require('../../helpers/advanceToBlock');

const _ = require('lodash');

const BigNumber = web3.BigNumber;
const KnownOriginDigitalAssetV2 = artifacts.require('KnownOriginDigitalAssetV2');

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract.only('KnownOriginDigitalAssetV2 - custom', function (accounts) {
  const _owner = accounts[0];

  const account1 = accounts[1];
  const account2 = accounts[2];
  const account3 = accounts[4];
  const account4 = accounts[5];

  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

  const artistAccount = accounts[8];
  const artistShare = 76;

  const editionType = 1;

  const editionNumber1 = 100000;
  const editionData1 = "editionData1";
  const editionTokenUri1 = "edition1";
  const edition1Price = etherToWei(0.1);

  const editionNumber2 = 200000;
  const editionData2 = "editionData2";
  const editionTokenUri2 = "edition2";
  const edition2Price = etherToWei(0.2);

  const BASE_URI = "https://ipfs.infura.io/ipfs/";
  const MAX_UINT32 = 4294967295;

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {
    this.token = await KnownOriginDigitalAssetV2.new({from: _owner});
  });

  describe('updateKoCommissionAccount', async function () {
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
    it('is set on creation', async function () {
      let tokenBaseURI = await this.token.tokenBaseURI();
      tokenBaseURI.should.be.equal('https://ipfs.infura.io/ipfs/');
    });

    it('can be changed', async function () {
      await this.token.updateTokenBaseURI("http://a-new-ipfs.com");

      let tokenBaseURI = await this.token.tokenBaseURI();
      tokenBaseURI.should.be.equal("http://a-new-ipfs.com");
    });

    it('only invokable from KO', async function () {
      await assertRevert(this.token.updateTokenBaseURI("http://a-new-ipfs.com", {from: account1}));
    });

    it('cannot set invalid address', async function () {
      await assertRevert(this.token.updateTokenBaseURI(""));
    });
  });

  describe('edition setup and control', async function () {

    beforeEach(async function () {
      await this.token.createEdition(editionNumber1, editionData1, editionType, 0, 0, artistAccount, artistShare, edition1Price, editionTokenUri1, 3, {from: _owner});
      await this.token.createEdition(editionNumber2, editionData2, editionType, 0, 0, artistAccount, artistShare, edition2Price, editionTokenUri2, 4, {from: _owner});
    });

    describe('checking raw edition data on creation', function () {

      it('edition 1 setup correctly', async function () {
        let edition = await this.token.allEditionData(editionNumber1);

        web3.toAscii(edition[0]).replace(/\0/g, '').should.be.equal(editionData1); //_editionData
        edition[1].should.be.bignumber.equal(editionType); //_editionType
        edition[2].should.be.bignumber.equal(0); // _auctionStartDate
        edition[3].should.be.bignumber.equal(MAX_UINT32); // _auctionEndDate
        edition[4].should.be.equal(artistAccount); // _artistAccount
        edition[5].should.be.bignumber.equal(artistShare); // _artistCommission
        edition[6].should.be.bignumber.equal(edition1Price); // _priceInWei
        edition[7].should.be.equal(`${BASE_URI}${editionTokenUri1}`); // _tokenURI
        edition[8].should.be.bignumber.equal(0); // _minted
        edition[9].should.be.bignumber.equal(3); // _available
        edition[10].should.be.equal(true); // _active
      });

      it('edition 2 setup correctly', async function () {
        let edition = await this.token.allEditionData(editionNumber2);

        web3.toAscii(edition[0]).replace(/\0/g, '').should.be.equal(editionData2); //_editionData
        edition[1].should.be.bignumber.equal(editionType); //_editionType
        edition[2].should.be.bignumber.equal(0); // _auctionStartDate
        edition[3].should.be.bignumber.equal(MAX_UINT32); // _auctionEndDate
        edition[4].should.be.equal(artistAccount); // _artistAccount
        edition[5].should.be.bignumber.equal(artistShare); // _artistCommission
        edition[6].should.be.bignumber.equal(edition2Price); // _priceInWei
        edition[7].should.be.equal(`${BASE_URI}${editionTokenUri2}`); // _tokenURI
        edition[8].should.be.bignumber.equal(0); // _minted
        edition[9].should.be.bignumber.equal(4); // _available
        edition[10].should.be.equal(true); // _active
      });

      it('editionsForType', async function () {
        let editions = await this.token.editionsForType(editionType);
        editions.map(e => e.toNumber()).should.be.deep.equal([editionNumber1, editionNumber2]);
      });

      describe('edition 1 query methods', function () {

        it('purchaseDatesEdition', async function () {
          let dates = await this.token.purchaseDatesEdition(editionNumber1);
          dates[0].should.be.bignumber.equal(0);
          dates[1].should.be.bignumber.equal(MAX_UINT32);
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
          dates[1].should.be.bignumber.equal(MAX_UINT32);
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

        it('reverts if updating available to below the minted amount', async function () {
          // Sell one
          await this.token.mint(editionNumber1, {from: account1, value: edition1Price});

          // attempt to update available to less than minted amount
          await assertRevert(this.token.updateAvailable(editionNumber1, 0, {from: _owner}));
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
          let currentArtistEditions = await this.token.artistsEditions(artistAccount);
          currentArtistEditions.map(e => e.toNumber()).should.be.deep.equal([editionNumber1, editionNumber2]);

          let newArtistEditions = await this.token.artistsEditions(account3);
          newArtistEditions.map(e => e.toNumber()).should.be.deep.equal([]);

          await this.token.updateArtistsAccount(editionNumber1, account3);

          currentArtistEditions = await this.token.artistsEditions(artistAccount);
          currentArtistEditions.map(e => e.toNumber()).should.be.deep.equal([0, editionNumber2]);

          newArtistEditions = await this.token.artistsEditions(account3);
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
        await this.token.createDisabledEdition(editionNumber3, editionData3, editionType, 0, 0, artistAccount, artistShare, edition3Price, editionTokenUri3, 1, {from: _owner});
      });

      it('edition 3 setup correctly', async function () {
        let edition = await this.token.allEditionData(editionNumber3);

        web3.toAscii(edition[0]).replace(/\0/g, '').should.be.equal(editionData3); //_editionData
        edition[1].should.be.bignumber.equal(editionType); //_editionType
        edition[2].should.be.bignumber.equal(0); // _auctionStartDate
        edition[3].should.be.bignumber.equal(MAX_UINT32); // _auctionEndDate
        edition[4].should.be.equal(artistAccount); // _artistAccount
        edition[5].should.be.bignumber.equal(artistShare); // _artistCommission
        edition[6].should.be.bignumber.equal(edition3Price); // _priceInWei
        edition[7].should.be.equal(`${BASE_URI}${editionTokenUri3}`); // _tokenURI
        edition[8].should.be.bignumber.equal(0); // _minted
        edition[9].should.be.bignumber.equal(1); // _available
        edition[10].should.be.equal(false); // _active
      });

      it('editionActive', async function () {
        let active = await this.token.editionActive(editionNumber3);
        active.should.be.equal(false);
      });

    });

    describe('edition creation validation', async function () {

      describe('createEdition', async function () {
        it('reverts if editionNumber zero', async function () {
          await assertRevert(
            this.token.createEdition(0, editionData1, editionType, 0, 0, artistAccount, artistShare, edition1Price, editionTokenUri1, 3, {from: _owner})
          );
        });

        it('reverts if editionType zero', async function () {
          await assertRevert(
            this.token.createEdition(editionNumber1, editionData1, 0, 0, 0, artistAccount, artistShare, edition1Price, editionTokenUri1, 3, {from: _owner})
          );
        });

        it('reverts if tokenURI is not provided', async function () {
          await assertRevert(
            this.token.createEdition(editionNumber1, editionData1, editionType, 0, 0, artistAccount, artistShare, edition1Price, "", 3, {from: _owner})
          );
        });

        it('reverts if artistAccount is not valid', async function () {
          await assertRevert(
            this.token.createEdition(editionNumber1, editionData1, editionType, 0, 0, ZERO_ADDRESS, artistShare, edition1Price, editionTokenUri1, 3, {from: _owner})
          );
        });

        it('reverts if artistShare is greater than 100%', async function () {
          await assertRevert(
            this.token.createEdition(editionNumber1, editionData1, editionType, 0, 0, artistAccount, 101, edition1Price, editionTokenUri1, 3, {from: _owner})
          );
        });

        it('reverts if artistShare is less than 0%', async function () {
          await assertRevert(
            this.token.createEdition(editionNumber1, editionData1, editionType, 0, 0, artistAccount, -1, edition1Price, editionTokenUri1, 3, {from: _owner})
          );
        });

        it('reverts if editionNumber already defined', async function () {
          await assertRevert(
            this.token.createEdition(editionNumber1, editionData1, editionType, 0, 0, artistAccount, artistShare, edition1Price, editionTokenUri1, 3, {from: _owner})
          );
        });
      });

      describe('createDisabledEdition', async function () {
        it('reverts if editionNumber zero', async function () {
          await assertRevert(
            this.token.createDisabledEdition(0, editionData1, editionType, 0, 0, artistAccount, artistShare, edition1Price, editionTokenUri1, 3, {from: _owner})
          );
        });

        it('reverts if editionType zero', async function () {
          await assertRevert(
            this.token.createDisabledEdition(editionNumber1, editionData1, 0, 0, 0, artistAccount, artistShare, edition1Price, editionTokenUri1, 3, {from: _owner})
          );
        });

        it('reverts if tokenURI is not provided', async function () {
          await assertRevert(
            this.token.createDisabledEdition(editionNumber1, editionData1, editionType, 0, 0, artistAccount, artistShare, edition1Price, "", 3, {from: _owner})
          );
        });

        it('reverts if artistAccount is not valid', async function () {
          await assertRevert(
            this.token.createDisabledEdition(editionNumber1, editionData1, editionType, 0, 0, ZERO_ADDRESS, artistShare, edition1Price, editionTokenUri1, 3, {from: _owner})
          );
        });

        it('reverts if artistShare is greater than 100%', async function () {
          await assertRevert(
            this.token.createDisabledEdition(editionNumber1, editionData1, editionType, 0, 0, artistAccount, 101, edition1Price, editionTokenUri1, 3, {from: _owner})
          );
        });

        it('reverts if artistShare is less than 0%', async function () {
          await assertRevert(
            this.token.createDisabledEdition(editionNumber1, editionData1, editionType, 0, 0, artistAccount, -1, edition1Price, editionTokenUri1, 3, {from: _owner})
          );
        });

        it('reverts if editionNumber already defined', async function () {
          await assertRevert(
            this.token.createDisabledEdition(editionNumber1, editionData1, editionType, 0, 0, artistAccount, artistShare, edition1Price, editionTokenUri1, 3, {from: _owner})
          );
        });
      });
    });
  });

  describe('token setup and controls', async function () {

    const tokenId1 = 100001;
    const tokenId2 = 200001;
    const tokenId3 = 100002;
    const tokenId4 = 200002;

    beforeEach(async function () {
      await this.token.createEdition(editionNumber1, editionData1, editionType, 0, 0, artistAccount, artistShare, edition1Price, editionTokenUri1, 3, {from: _owner});
      await this.token.createEdition(editionNumber2, editionData2, editionType, 0, 0, artistAccount, artistShare, edition2Price, editionTokenUri2, 4, {from: _owner});
    });

    beforeEach(async function () {
      await this.token.mint(editionNumber1, {from: account1, value: edition1Price}); // tokenId 100001
      await this.token.mint(editionNumber2, {from: account2, value: edition2Price}); // tokenId 200001
      await this.token.mint(editionNumber1, {from: account2, value: edition1Price}); // tokenId 100002
      await this.token.mint(editionNumber2, {from: account3, value: edition2Price}); // tokenId 200002
    });

    describe('setTokenURI', async function () {
      it('can be changed by KO', async function () {
        let tokenURI = await this.token.tokenURI(tokenId1);
        tokenURI.should.be.equal(`${BASE_URI}${editionTokenUri1}`);

        const newTokenUri = "my-new-token-uri";
        await this.token.setTokenURI(tokenId1, newTokenUri);

        tokenURI = await this.token.tokenURI(tokenId1);
        tokenURI.should.be.equal(`${BASE_URI}${newTokenUri}`);
      });

      it('is rejected unless whitelisted', async function () {
        await assertRevert(this.token.setTokenURI(tokenId1, "new-uri", {from: account3}));
      });
    });

    describe('tokenIdEditionNumber', async function () {

      it('will return the correct edition ', async function () {
        let result1 = await this.token.tokenIdEditionNumber(tokenId1);
        result1.should.be.bignumber.equal(editionNumber1);

        let result2 = await this.token.tokenIdEditionNumber(tokenId2);
        result2.should.be.bignumber.equal(editionNumber2);

        let result3 = await this.token.tokenIdEditionNumber(tokenId3);
        result3.should.be.bignumber.equal(editionNumber1);

        let result4 = await this.token.tokenIdEditionNumber(tokenId4);
        result4.should.be.bignumber.equal(editionNumber2);
      });

      // TODO test this after a burn

    });

    describe('tokenURI', async function () {

      it('will return the correct edition ', async function () {
        let result1 = await this.token.tokenURI(tokenId1);
        result1.should.be.equal(`${BASE_URI}${editionTokenUri1}`);

        let result2 = await this.token.tokenURI(tokenId2);
        result2.should.be.equal(`${BASE_URI}${editionTokenUri2}`);

        let result3 = await this.token.tokenURI(tokenId3);
        result3.should.be.equal(`${BASE_URI}${editionTokenUri1}`);

        let result4 = await this.token.tokenURI(tokenId4);
        result4.should.be.equal(`${BASE_URI}${editionTokenUri2}`);
      });

      it('will revert when invalid token ID', async function () {
        await assertRevert(this.token.tokenURI(99));
      });

      // TODO test this after a burn

    });

    describe('tokenURISafe', async function () {

      it('will return the correct edition ', async function () {
        let result1 = await this.token.tokenURISafe(tokenId1);
        result1.should.be.equal(`${BASE_URI}${editionTokenUri1}`);

        let result2 = await this.token.tokenURISafe(tokenId2);
        result2.should.be.equal(`${BASE_URI}${editionTokenUri2}`);

        let result3 = await this.token.tokenURISafe(tokenId3);
        result3.should.be.equal(`${BASE_URI}${editionTokenUri1}`);

        let result4 = await this.token.tokenURISafe(tokenId4);
        result4.should.be.equal(`${BASE_URI}${editionTokenUri2}`);
      });

      it('will NOT revert when invalid token ID', async function () {
        let result = await this.token.tokenURISafe(99);
        result.should.be.equal(`${BASE_URI}`);
      });

      // TODO test this after a burn

    });

    describe('tokensOfEdition', async function () {

      it('will return the correct edition ', async function () {
        let result1 = await this.token.tokensOfEdition(editionNumber1);
        result1.map(e => e.toNumber()).should.be.deep.equal([tokenId1, tokenId3]);

        let result2 = await this.token.tokensOfEdition(editionNumber2);
        result2.map(e => e.toNumber()).should.be.deep.equal([tokenId2, tokenId4]);
      });
    });

    describe('purchaseDatesToken', async function () {

      it('will return the correct edition ', async function () {
        let result1 = await this.token.purchaseDatesToken(tokenId1);
        result1
          .map(e => e.toNumber())
          .should.be.deep.equal([0, MAX_UINT32]);

        let result2 = await this.token.purchaseDatesToken(tokenId2);
        result2
          .map(e => e.toNumber())
          .should.be.deep.equal([0, MAX_UINT32]);

        let result3 = await this.token.purchaseDatesToken(tokenId3);
        result3
          .map(e => e.toNumber())
          .should.be.deep.equal([0, MAX_UINT32]);

        let result4 = await this.token.purchaseDatesToken(tokenId4);
        result4
          .map(e => e.toNumber())
          .should.be.deep.equal([0, MAX_UINT32]);
      });

    });

    describe('priceInWeiToken', async function () {

      it('will return the correct edition ', async function () {
        let result1 = await this.token.priceInWeiToken(tokenId1);
        result1.should.be.bignumber.equal(edition1Price);

        let result2 = await this.token.priceInWeiToken(tokenId2);
        result2.should.be.bignumber.equal(edition2Price);

        let result3 = await this.token.priceInWeiToken(tokenId3);
        result3.should.be.bignumber.equal(edition1Price);

        let result4 = await this.token.priceInWeiToken(tokenId4);
        result4.should.be.bignumber.equal(edition2Price);
      });

    });

    describe('artistsEditions', async function () {

      it('will return the correct data ', async function () {
        let editions = await this.token.artistsEditions(artistAccount);
        editions.map(e => e.toNumber())
          .should.be.deep.equal([editionNumber1, editionNumber2]);
      });

    });
  });

  describe('mint', async function () {

    beforeEach(async function () {
      await this.token.createEdition(editionNumber1, editionData1, editionType, 0, 0, artistAccount, artistShare, edition1Price, editionTokenUri1, 3, {from: _owner});
      await this.token.createEdition(editionNumber2, editionData2, editionType, 0, 0, artistAccount, artistShare, edition2Price, editionTokenUri2, 4, {from: _owner});
    });

    describe('validation', async function () {
      it('reverts if edition sold out', async function () {
        await this.token.mint(editionNumber1, {from: account1, value: edition1Price});
        await this.token.mint(editionNumber1, {from: account1, value: edition1Price});
        await this.token.mint(editionNumber1, {from: account1, value: edition1Price});

        // Reverts on 4 mint as sold out
        await assertRevert(this.token.mint(editionNumber1, {from: account1, value: edition1Price}));
      });

      it('reverts if edition not active', async function () {
        await this.token.updateActive(editionNumber1, false, {from: _owner});

        // reverts as inactive
        await assertRevert(this.token.mint(editionNumber1, {from: account1, value: edition1Price}));
      });

      it('reverts if edition invalid', async function () {
        await this.token.updateAvailable(editionNumber1, 0, {from: _owner});

        // reverts as edition sat to zero available
        await assertRevert(this.token.mint(editionNumber1, {from: account1, value: edition1Price}));
      });

      it('reverts if edition auction not started', async function () {
        // TODO
      });

      it('reverts if edition auction closed', async function () {
        // TODO
      });

      it('reverts if purchase price not provided', async function () {
        await assertRevert(this.token.mint(editionNumber1, {from: account1, value: 0}));
      });
    });

    describe('purchase successful', async function () {
      const tokenId1_1 = 100001;
      const tokenId1_2 = 100002;
      const tokenId1_3 = 100003;

      const tokenId2_1 = 200001;
      const tokenId2_2 = 200002;
      const tokenId2_3 = 200003;

      beforeEach(async function () {
        // 3 from edition 2
        await this.token.mint(editionNumber1, {from: account1, value: edition1Price});
        await this.token.mint(editionNumber1, {from: account2, value: edition1Price});
        await this.token.mint(editionNumber1, {from: account3, value: edition1Price});

        // 3 from edition 1
        await this.token.mint(editionNumber2, {from: account1, value: edition2Price});
        await this.token.mint(editionNumber2, {from: account2, value: edition2Price});
        await this.token.mint(editionNumber2, {from: account3, value: edition2Price});
      });

      it('sets token Uri', async function () {
        [tokenId1_1, tokenId1_2, tokenId1_3].forEach(async (id) => {
          let result = await this.token.tokenURI(id);
          result.should.be.equal(`${BASE_URI}${editionTokenUri1}`);
        });

        [tokenId2_1, tokenId2_2, tokenId2_3].forEach(async (id) => {
          let result = await this.token.tokenURI(id);
          result.should.be.equal(`${BASE_URI}${editionTokenUri2}`);
        });
      });

      it('adds to the number minted counter', async function () {
        let totalNumberMinted = await this.token.totalNumberMinted();
        totalNumberMinted.should.be.bignumber.equal(6);
      });

      it('adds to the number of wei collected', async function () {
        let expect = (edition1Price * 3) + (edition2Price * 3);

        let totalPurchaseValueInWei = await this.token.totalPurchaseValueInWei();
        totalPurchaseValueInWei.should.be.bignumber.equal(expect);
      });

      it('adds to edition <-> tokenId[] mappings', async function () {
        let edition1Tokens = await this.token.tokensOfEdition(editionNumber1);
        edition1Tokens
          .map(e => e.toNumber())
          .should.be.deep.equal([tokenId1_1, tokenId1_2, tokenId1_3]);

        let edition2Tokens = await this.token.tokensOfEdition(editionNumber2);
        edition2Tokens
          .map(e => e.toNumber())
          .should.be.deep.equal([tokenId2_1, tokenId2_2, tokenId2_3]);
      });

      it('adds to tokenId <-> edition mappings', async function () {
        [tokenId1_1, tokenId1_2, tokenId1_3].forEach(async (id) => {
          let result = await this.token.tokenIdEditionNumber(id);
          result.should.be.bignumber.equal(editionNumber1);
        });

        [tokenId2_1, tokenId2_2, tokenId2_3].forEach(async (id) => {
          let result = await this.token.tokenIdEditionNumber(id);
          result.should.be.bignumber.equal(editionNumber2);
        });
      });

      it('tokensOf', async function () {
        let account1Results = await this.token.tokensOf(account1);
        account1Results
          .map(e => e.toNumber())
          .should.be.deep.equal([tokenId1_1, tokenId2_1]);

        let account2Results = await this.token.tokensOf(account2);
        account2Results
          .map(e => e.toNumber())
          .should.be.deep.equal([tokenId1_2, tokenId2_2]);

        let account3Results = await this.token.tokensOf(account3);
        account3Results
          .map(e => e.toNumber())
          .should.be.deep.equal([tokenId1_3, tokenId2_3]);
      });

    });

    describe('handling of funds', async function () {
      let originalAccount1Balance;
      let originalAccount2Balance;
      let originalKoAccountBalance;
      let originalArtistAccountBalance;

      let postAccount1Balance;
      let postAccount2Balance;
      let postKoAccountBalance;
      let postArtistAccountBalance;

      let receiptAccount1;
      let receiptAccount2;

      let account1GasFees;
      let account2GasFees;

      beforeEach(async function () {
        // pre balances
        originalAccount1Balance = await web3.eth.getBalance(account1);
        originalAccount2Balance = await web3.eth.getBalance(account2);
        originalKoAccountBalance = await web3.eth.getBalance(await this.token.koCommissionAccount());
        originalArtistAccountBalance = await web3.eth.getBalance(artistAccount);

        // account 1 purchases edition 1
        receiptAccount1 = await this.token.mint(editionNumber1, {from: account1, value: edition1Price});
        account1GasFees = await getGasCosts(receiptAccount1);

        // account 2 purchases another from edition 1
        receiptAccount2 = await this.token.mint(editionNumber1, {from: account2, value: edition1Price});
        account2GasFees = await getGasCosts(receiptAccount2);

        // post balances
        postAccount1Balance = await web3.eth.getBalance(account1);
        postAccount2Balance = await web3.eth.getBalance(account2);
        postKoAccountBalance = await web3.eth.getBalance(await this.token.koCommissionAccount());
        postArtistAccountBalance = await web3.eth.getBalance(artistAccount);
      });

      async function getGasCosts(receipt) {
        let tx = await web3.eth.getTransaction(receipt.tx);
        let gasPrice = tx.gasPrice;
        return gasPrice.mul(receipt.receipt.gasUsed);
      }

      it('splits funds between artist and KO account', async function () {
        console.log(`GasUsed Account 1: ${account1GasFees}`);
        console.log(`GasUsed Account 2: ${account2GasFees}`);

        // account 1 should be equal the cost of transaction, minus the edition cost
        postAccount1Balance.should.be.bignumber.equal(
          originalAccount1Balance.sub(
            account1GasFees.add(edition1Price)
          )
        );

        // account 2 should be equal the cost of transaction, minus the edition cost
        postAccount2Balance.should.be.bignumber.equal(
          originalAccount2Balance.sub(
            account2GasFees.add(edition1Price)
          )
        );

        // ensure KO gets a the correct cut
        postKoAccountBalance.should.be.bignumber.equal(
          originalKoAccountBalance.add(
            edition1Price.dividedBy(100)
              .times(24) // 24% goes to KO
              .times(2) // 2 x sales for edition 1
          )
        );

        // ensure artists get the correct 76% commission
        postArtistAccountBalance.should.be.bignumber.equal(
          originalArtistAccountBalance.add(
            edition1Price.dividedBy(100)
              .times(76) // 24% goes to KO
              .times(2) // 2 x sales for edition 1
          )
        );
      });

      it('Transfer event emitted', async function () {
        let {logs} = receiptAccount1;

        let transferEvent = logs[0];

        transferEvent.event.should.be.equal('Transfer');

        let {_from, _to, _tokenId} = transferEvent.args;
        _from.should.be.equal('0x0000000000000000000000000000000000000000');
        _to.should.be.equal('0x6704fbfcd5ef766b287262fa2281c105d57246a6');
        _tokenId.should.be.bignumber.equal(editionNumber1 + 1);
      });

      it('Minted event emitted', async function () {
        let {logs} = receiptAccount1;

        let mintedEvent = logs[1];

        mintedEvent.event.should.be.equal('Minted');

        let {_buyer, _editionNumber, _tokenId} = mintedEvent.args;
        _buyer.should.be.equal(account1);
        _editionNumber.should.be.bignumber.equal(editionNumber1);
        _tokenId.should.be.bignumber.equal(editionNumber1 + 1);
      });

      it('Purchase event emitted', async function () {
        let {logs} = receiptAccount1;

        let purchasedEvent = logs[2];

        purchasedEvent.event.should.be.equal('Purchase');

        let {_buyer, _costInWei, _tokenId} = purchasedEvent.args;
        _buyer.should.be.equal(account1);
        _costInWei.should.be.bignumber.equal(edition1Price);
        _tokenId.should.be.bignumber.equal(editionNumber1 + 1);
      });

    });

    describe('tokenIdentificationData', async function () {
      const tokenId1 = editionNumber1 + 1;
      const tokenId2 = editionNumber2 + 1;
      const tokenIdInvalid = 999;

      beforeEach(async function () {
        await this.token.mint(editionNumber1, {from: account1, value: edition1Price});
        await this.token.mint(editionNumber2, {from: account2, value: edition2Price});
      });

      it('should revert is token ID not valid', async function () {
        await assertRevert(this.token.tokenIdentificationData(tokenIdInvalid));
      });

      it(`token id [${tokenId1}]`, async function () {
        let results = await this.token.tokenIdentificationData(tokenId1);

        results[0].should.be.bignumber.equal(editionNumber1);
        results[1].should.be.bignumber.equal(editionType);
        web3.toAscii(results[2]).replace(/\0/g, '').should.be.equal(editionData1);
        results[3].should.be.equal(`https://ipfs.infura.io/ipfs/edition1`);
        results[4].should.be.equal(account1);
      });

      it(`token id [${tokenId2}]`, async function () {
        let results = await this.token.tokenIdentificationData(tokenId2);

        results[0].should.be.bignumber.equal(editionNumber2);
        results[1].should.be.bignumber.equal(editionType);
        web3.toAscii(results[2]).replace(/\0/g, '').should.be.equal(editionData2);
        results[3].should.be.equal(`https://ipfs.infura.io/ipfs/edition2`);
        results[4].should.be.equal(account2);
      });
    });

    describe('tokenEditionData', async function () {
      const tokenId1 = editionNumber1 + 1;
      const tokenId2 = editionNumber2 + 1;
      const tokenIdInvalid = 999;

      beforeEach(async function () {
        await this.token.mint(editionNumber1, {from: account1, value: edition1Price});
        await this.token.mint(editionNumber2, {from: account2, value: edition2Price});
      });

      it('should revert is token ID not valid', async function () {
        await assertRevert(this.token.tokenEditionData(tokenIdInvalid));
      });

      it(`token id [${tokenId1}]`, async function () {
        let results = await this.token.tokenEditionData(tokenId1);

        results[0].should.be.bignumber.equal(editionNumber1);
        results[1].should.be.bignumber.equal(editionType);
        results[2].should.be.bignumber.equal(0);
        results[3].should.be.bignumber.equal(MAX_UINT32);
        results[4].should.be.equal(artistAccount);
        results[5].should.be.bignumber.equal(artistShare);
        results[6].should.be.bignumber.equal(edition1Price);
        results[7].should.be.bignumber.equal(3);
        results[8].should.be.bignumber.equal(1);
      });

      it(`token id [${tokenId2}]`, async function () {
        let results = await this.token.tokenEditionData(tokenId2);

        results[0].should.be.bignumber.equal(editionNumber2);
        results[1].should.be.bignumber.equal(editionType);
        results[2].should.be.bignumber.equal(0);
        results[3].should.be.bignumber.equal(MAX_UINT32);
        results[4].should.be.equal(artistAccount);
        results[5].should.be.bignumber.equal(artistShare);
        results[6].should.be.bignumber.equal(edition2Price);
        results[7].should.be.bignumber.equal(4);
        results[8].should.be.bignumber.equal(1);
      });
    });
  });

  describe('koMint', async function () {

    beforeEach(async function () {
      await this.token.createEdition(editionNumber1, editionData1, editionType, 0, 0, artistAccount, artistShare, edition1Price, editionTokenUri1, 3, {from: _owner});
      await this.token.createEdition(editionNumber2, editionData2, editionType, 0, 0, artistAccount, artistShare, edition2Price, editionTokenUri2, 4, {from: _owner});
    });

    it('will revert if not called by whitelist', async function () {
      await assertRevert(this.token.koMint(account3, editionNumber1, {from: account1}));
    });

    it('once added to whitelist can mint successfully', async function () {
      let tokens = await this.token.tokensOf(account3);
      tokens
        .map(e => e.toNumber())
        .should.be.deep.equal([]);

      await assertRevert(this.token.koMint(account3, editionNumber1, {from: account1}));

      await this.token.addAddressToWhitelist(account1, {from: _owner});

      await this.token.koMint(account3, editionNumber1, {from: account1});

      tokens = await this.token.tokensOf(account3);
      tokens
        .map(e => e.toNumber())
        .should.be.deep.equal([editionNumber1 + 1]);
    });

    describe('successful mint without paying fee', async function () {

      const tokenId1 = editionNumber1 + 1;
      const tokenId2 = editionNumber2 + 1;

      let receipt;

      beforeEach(async function () {
        receipt = await this.token.koMint(account3, editionNumber1, {from: _owner});
        await this.token.koMint(account4, editionNumber2, {from: _owner});
      });

      describe('tokenIdentificationData', async function () {
        it(`token id [${tokenId1}]`, async function () {
          let results = await this.token.tokenIdentificationData(tokenId1);

          results[0].should.be.bignumber.equal(editionNumber1);
          results[1].should.be.bignumber.equal(editionType);
          web3.toAscii(results[2]).replace(/\0/g, '').should.be.equal(editionData1);
          results[3].should.be.equal(`https://ipfs.infura.io/ipfs/edition1`);
          results[4].should.be.equal(account3);
        });

        it(`token id [${tokenId2}]`, async function () {
          let results = await this.token.tokenIdentificationData(tokenId2);

          results[0].should.be.bignumber.equal(editionNumber2);
          results[1].should.be.bignumber.equal(editionType);
          web3.toAscii(results[2]).replace(/\0/g, '').should.be.equal(editionData2);
          results[3].should.be.equal(`https://ipfs.infura.io/ipfs/edition2`);
          results[4].should.be.equal(account4);
        });
      });

      describe('tokenEditionData', async function () {
        it(`token id [${tokenId1}]`, async function () {
          let results = await this.token.tokenEditionData(tokenId1);

          results[0].should.be.bignumber.equal(editionNumber1);
          results[1].should.be.bignumber.equal(editionType);
          results[2].should.be.bignumber.equal(0);
          results[3].should.be.bignumber.equal(MAX_UINT32);
          results[4].should.be.equal(artistAccount);
          results[5].should.be.bignumber.equal(artistShare);
          results[6].should.be.bignumber.equal(edition1Price);
          results[7].should.be.bignumber.equal(3);
          results[8].should.be.bignumber.equal(1);
        });

        it(`token id [${tokenId2}]`, async function () {
          let results = await this.token.tokenEditionData(tokenId2);

          results[0].should.be.bignumber.equal(editionNumber2);
          results[1].should.be.bignumber.equal(editionType);
          results[2].should.be.bignumber.equal(0);
          results[3].should.be.bignumber.equal(MAX_UINT32);
          results[4].should.be.equal(artistAccount);
          results[5].should.be.bignumber.equal(artistShare);
          results[6].should.be.bignumber.equal(edition2Price);
          results[7].should.be.bignumber.equal(4);
          results[8].should.be.bignumber.equal(1);
        });
      });

      describe('tokensOf', async function () {
        it(`ownership of [${tokenId1}] is defined`, async function () {
          let tokens = await this.token.tokensOf(account3);
          tokens
            .map(e => e.toNumber())
            .should.be.deep.equal([tokenId1]);
        });

        it(`ownership of [${tokenId2}] is defined`, async function () {
          let tokens = await this.token.tokensOf(account4);
          tokens
            .map(e => e.toNumber())
            .should.be.deep.equal([tokenId2]);
        });
      });

      describe(`events emitted [${tokenId1}]`, async function () {

        it('Transfer event emitted', async function () {
          let {logs} = receipt;

          let transferEvent = logs[0];

          transferEvent.event.should.be.equal('Transfer');

          let {_from, _to, _tokenId} = transferEvent.args;
          _from.should.be.equal('0x0000000000000000000000000000000000000000');
          _to.should.be.equal(account3);
          _tokenId.should.be.bignumber.equal(tokenId1);
        });

        it('Minted event emitted', async function () {
          let {logs} = receipt;

          let mintedEvent = logs[1];

          mintedEvent.event.should.be.equal('Minted');

          let {_buyer, _editionNumber, _tokenId} = mintedEvent.args;
          _buyer.should.be.equal(account3);
          _editionNumber.should.be.bignumber.equal(editionNumber1);
          _tokenId.should.be.bignumber.equal(tokenId1);
        });

      });
    });

  });

  describe('burn', async function () {

  });

});
