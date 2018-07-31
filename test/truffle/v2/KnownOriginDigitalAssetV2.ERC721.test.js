const assertRevert = require('../../helpers/assertRevert');
const {sendTransaction} = require('../../helpers/sendTransaction');
const etherToWei = require('../../helpers/etherToWei');
const {shouldSupportInterfaces} = require('./SupportsInterface.behavior');

const advanceBlock = require('../../helpers/advanceToBlock');

const _ = require('lodash');

const BigNumber = web3.BigNumber;
const KnownOriginDigitalAssetV2 = artifacts.require('KnownOriginDigitalAssetV2');

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract.only('KnownOriginDigitalAssetV2 - ERC721Token', function (accounts) {
  const _owner = accounts[0];

  const account1 = accounts[1];

  const account2 = accounts[2];

  const artistAccount = accounts[8];

  const name = 'KnownOriginDigitalAsset';
  const symbol = 'KODA';

  const editionType = 1;

  const editionNumber1 = 100000;
  const editionData1 = "editionData1";
  const editionTokenUri1 = "edtion1";
  const edition1Price = etherToWei(0.1);

  const editionNumber2 = 200000;
  const editionData2 = "editionData2";
  const editionTokenUri2 = "edtion2";
  const edition2Price = etherToWei(0.1);

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {

    this.token = await KnownOriginDigitalAssetV2.new({from: _owner});
  });

  beforeEach(async function () {
    await this.token.createEdition(editionNumber1, editionData1, editionType, 0, 0, artistAccount, edition1Price, editionTokenUri1, 3, {from: _owner});
    await this.token.createEdition(editionNumber2, editionData2, editionType, 0, 0, artistAccount, edition2Price, editionTokenUri2, 3, {from: _owner});
  });

  // TODO expand on this, just checking the data goes up
  describe('validate created edition content', async function () {

    it('edition 1', async function () {
      let data = await this.token.getRawEditionData(editionNumber1);
      console.log(data);
    });

    it('edition 2', async function () {
      let data = await this.token.getRawEditionData(editionNumber2);
      console.log(data);
    });

  });

  describe.only('like a full ERC721', function () {
    const firstTokenId = 100001;
    const secondTokenId = 200001;

    beforeEach(async function () {
      await this.token.mint(editionNumber1, {from: account1, value: edition1Price}); // tokenId 100001
      await this.token.mint(editionNumber2, {from: account1, value: edition2Price}); // tokenId 200001
    });

    describe('mint', function () {
      const thirdTokenId = 100002;

      beforeEach(async function () {
        await this.token.mintTo(account2, editionNumber1, {from: account2, value: edition1Price});
      });

      it(`adjusts owner tokens by index - [${firstTokenId}]`, async function () {
        const token = await this.token.tokenOfOwnerByIndex(account1, 0);
        token.toNumber().should.be.equal(firstTokenId);
      });

      it(`adjusts all tokens list - [${secondTokenId}]`, async function () {
        const newToken = await this.token.tokenByIndex(1);
        newToken.toNumber().should.be.equal(secondTokenId);
      });

      it('adjusts owner tokens by index', async function () {
        const token = await this.token.tokenOfOwnerByIndex(account2, 0);
        token.toNumber().should.be.equal(thirdTokenId);
      });

      it('adjusts all tokens list', async function () {
        const newToken = await this.token.tokenByIndex(2);
        newToken.toNumber().should.be.equal(thirdTokenId);
      });
    });

    describe('burn', function () {
      const sender = account1;

      beforeEach(async function () {
        await this.token.burn(firstTokenId, {from: sender});
      });

      it('removes that token from the token list of the owner', async function () {
        const token = await this.token.tokenOfOwnerByIndex(sender, 0);
        token.toNumber().should.be.equal(secondTokenId);
      });

      it('adjusts all tokens list', async function () {
        const token = await this.token.tokenByIndex(0);
        token.toNumber().should.be.equal(secondTokenId);
      });

      it('burns all tokens', async function () {
        await this.token.burn(secondTokenId, {from: sender});
        const total = await this.token.totalSupply();
        total.toNumber().should.be.equal(0);
        await assertRevert(this.token.tokenByIndex(0));
      });
    });

    describe('metadata', function () {
      const sampleUri = 'updatedTokenMetadata';

      it('has a name', async function () {
        const tokenName = await this.token.name();
        tokenName.should.be.equal(name);
      });

      it('has a symbol', async function () {
        const tokenSymbol = await this.token.symbol();
        tokenSymbol.should.be.equal(symbol);
      });

      it('sets and returns metadata for a token id', async function () {
        await this.token.setTokenURI(firstTokenId, sampleUri);
        const uri = await this.token.tokenURI(firstTokenId);
        uri.should.be.equal(`https://ipfs.infura.io/ipfs/${sampleUri}`);
      });

      it('can burn token with metadata', async function () {
        await this.token.setTokenURI(firstTokenId, sampleUri);
        await this.token.burn(firstTokenId, {from: account1});
        const exists = await this.token.exists(firstTokenId);
        exists.should.be.false;
      });

      it('returns setup metadata for token', async function () {
        const uri = await this.token.tokenURI(firstTokenId);
        uri.should.be.equal(`https://ipfs.infura.io/ipfs/edtion1`);
      });

      it('reverts when querying metadata for non existent token id', async function () {
        await assertRevert(this.token.tokenURI(500));
      });
    });

    describe('totalSupply', function () {
      it('returns total token supply', async function () {
        const totalSupply = await this.token.totalSupply();
        totalSupply.should.be.bignumber.equal(2);
      });
    });

    describe('tokenOfOwnerByIndex', function () {
      const owner = account1;
      const another = account2;

      describe('when the given index is lower than the amount of tokens owned by the given address', function () {
        it('returns the token ID placed at the given index', async function () {
          const tokenId = await this.token.tokenOfOwnerByIndex(owner, 0);
          tokenId.should.be.bignumber.equal(firstTokenId);
        });
      });

      describe('when the index is greater than or equal to the total tokens owned by the given address', function () {
        it('reverts', async function () {
          await assertRevert(this.token.tokenOfOwnerByIndex(owner, 2));
        });
      });

      describe('when the given address does not own any token', function () {
        it('reverts', async function () {
          await assertRevert(this.token.tokenOfOwnerByIndex(another, 0));
        });
      });

      describe('after transferring all tokens to another user', function () {
        beforeEach(async function () {
          await this.token.transferFrom(owner, another, firstTokenId, {from: owner});
          await this.token.transferFrom(owner, another, secondTokenId, {from: owner});
        });

        it('returns correct token IDs for target', async function () {
          const count = await this.token.balanceOf(another);
          count.toNumber().should.be.equal(2);
          const tokensListed = await Promise.all(_.range(2).map(i => this.token.tokenOfOwnerByIndex(another, i)));
          tokensListed.map(t => t.toNumber()).should.have.members([firstTokenId, secondTokenId]);
        });

        it('returns empty collection for original owner', async function () {
          const count = await this.token.balanceOf(owner);
          count.toNumber().should.be.equal(0);
          await assertRevert(this.token.tokenOfOwnerByIndex(owner, 0));
        });
      });
    });

    describe('tokenByIndex', function () {
      it('should return all tokens', async function () {
        const tokensListed = await Promise.all(_.range(2).map(i => this.token.tokenByIndex(i)));
        tokensListed.map(t => t.toNumber()).should.have.members([firstTokenId, secondTokenId]);
      });

      it('should revert if index is greater than supply', async function () {
        await assertRevert(this.token.tokenByIndex(2));
      });

      [{
        tokenId: firstTokenId,
        edition: editionNumber1,
        value: edition1Price,
        newIds: [100002, 100003]
      }, {
        tokenId: secondTokenId,
        edition: editionNumber2,
        value: edition1Price,
        newIds: [200002, 200003]
      }].forEach(function ({tokenId, edition, value, newIds}) {
        it(`should return all tokens after burning token ${tokenId} and minting new tokens in edition ${edition}`, async function () {
          const from = account1;

          await this.token.burn(tokenId, {from});

          await this.token.mint(edition, {from, value});
          await this.token.mint(edition, {from, value});

          const count = await this.token.totalSupply();
          count.toNumber().should.be.equal(3);

          const tokensListed = await Promise.all(_.range(3).map(i => this.token.tokenByIndex(i)));

          const expectedTokens = _.filter(
            [firstTokenId, secondTokenId, ...newIds],
            x => (x !== tokenId)
          );
          const toNumberTokens = tokensListed.map(t => t.toNumber());
          toNumberTokens.should.have.members(expectedTokens);
        });
      });
    });

    shouldSupportInterfaces([
      'ERC165',
      'ERC721',
      'ERC721Exists',
      'ERC721Enumerable',
      'ERC721Metadata',
    ]);

  });

});
