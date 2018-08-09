const assertRevert = require('../../helpers/assertRevert');
const etherToWei = require('../../helpers/etherToWei');

const advanceBlock = require('../../helpers/advanceToBlock');

const _ = require('lodash');

const BigNumber = web3.BigNumber;
const KnownOriginDigitalAsset = artifacts.require('KnownOriginDigitalAsset');
const KnownOriginDigitalAssetV2 = artifacts.require('KnownOriginDigitalAssetV2');
const TokenSwap = artifacts.require('KnownOriginV1TokenSwap');

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract.only('V1 to V2 TokenSwap', function (accounts) {
  const _owner = accounts[0];

  const account1 = accounts[1];
  const account2 = accounts[2];
  const account3 = accounts[4];

  const archieveAddress = accounts[6];

  const artistAccount = accounts[8];
  const artistCommission = 76;

  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {
    this.kodaV2 = await KnownOriginDigitalAssetV2.new({from: _owner});
    this.kodaV1 = await KnownOriginDigitalAsset.new(account1, {from: _owner});
    this.tokenSwap = await TokenSwap.new(this.kodaV1.address, this.kodaV2.address, archieveAddress, {from: _owner});

    // Ensure TokenSwap is added to white lsit spo it can mint
    this.kodaV2.addAddressToWhitelist(this.tokenSwap.address);

    // console.log(`V1 address = [${this.kodaV1.address}]`);
    // console.log(`V2 address = [${this.kodaV2.address}]`);
    // console.log(`TokenSwap address = [${this.tokenSwap.address}]`);
  });

  describe('constructor checks', async function () {
    it('should fail if missing kodaV1 address', async function () {
      await assertRevert(TokenSwap.new(ZERO_ADDRESS, this.kodaV2.address, archieveAddress, {from: _owner}));
    });

    it('should fail if missing kodaV2 address', async function () {
      await assertRevert(TokenSwap.new(this.kodaV1.address, ZERO_ADDRESS, archieveAddress, {from: _owner}));
    });

    it('should fail if missing achieve address', async function () {
      await assertRevert(TokenSwap.new(this.kodaV1.address, this.kodaV2.address, ZERO_ADDRESS, {from: _owner}));
    });
  });

  describe('validation token swap from V1 to V2', async function () {

    it('should fail if token does not exists', async function () {
      const invalidTokenId = 99999;
      await assertRevert(this.tokenSwap.tokenSwap(invalidTokenId));
    });

    describe('token is valid but does not match edition', async function () {
      const unknownEdition = "123ABC0000000DIG";
      const tokenIdMinted = 0;

      beforeEach(async function () {
        await this.kodaV1.mint("", unknownEdition, 0, 0, artistAccount, {
          from: _owner
        });

        await this.kodaV1.setApprovalForAll(this.tokenSwap.address, true, {from: _owner});

        let approved = await this.tokenSwap.isApprovedForTransfer(tokenIdMinted);
        approved.should.be.equal(true);
      });

      it('should fail if does not match edition from V2', async function () {
        await assertRevert(this.tokenSwap.tokenSwap(tokenIdMinted));
      });
    });

    describe('token is valid and matches but not contract not approved for the move', async function () {
      const edition = "FKAMARTIANBNGDIG";
      const tokenIdMinted = 0;

      const editionType = 1;
      const editionNumber = 6800;
      const editionData = "editionData";
      const editionTokenUri = "editionUri";
      const price = etherToWei(0.1);

      beforeEach(async function () {
        await this.kodaV1.mint("", edition, 0, 0, artistAccount, {from: _owner});
        await this.kodaV2.createEdition(editionNumber, editionData, editionType, 0, 0, artistAccount, artistCommission, price, editionTokenUri, 4, {from: _owner});
      });

      it('should fail if editions match but token swap not approved', async function () {
        let approved = await this.tokenSwap.isApprovedForTransfer(tokenIdMinted);
        approved.should.be.equal(false);

        let editionMapping = await this.tokenSwap.editionMapping(tokenIdMinted);
        editionMapping.should.be.bignumber.equal(editionNumber);

        await assertRevert(this.tokenSwap.tokenSwap(tokenIdMinted));

        await this.kodaV1.setApprovalForAll(this.tokenSwap.address, true, {from: _owner});

        approved = await this.tokenSwap.isApprovedForTransfer(tokenIdMinted);
        approved.should.be.equal(true);

        let tx = this.tokenSwap.tokenSwap(tokenIdMinted);
        console.log(tx);
      });

    });

  });

  describe('token swap from V1 to V2', function () {


  });

});
