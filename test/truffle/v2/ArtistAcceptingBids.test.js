const assertRevert = require('../../helpers/assertRevert');
const etherToWei = require('../../helpers/etherToWei');
const advanceBlock = require('../../helpers/advanceToBlock');
const {duration, increaseTimeTo} = require('../../helpers/increaseTime');
const latestTime = require('../../helpers/latestTime');

const _ = require('lodash');

const BigNumber = web3.BigNumber;
const KnownOriginDigitalAssetV2 = artifacts.require('KnownOriginDigitalAssetV2');
const ArtistAcceptingBids = artifacts.require('ArtistAcceptingBids');

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('ArtistAcceptingBids', function (accounts) {

  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

  const ROLE_KNOWN_ORIGIN = 1;
  const ROLE_MINTER = 2;
  const ROLE_UNDER_MINTER = 3;

  const _owner = accounts[0];
  const koCommission = accounts[1];

  const artistAccount1 = accounts[2];
  const artistAccount2 = accounts[3];

  const bidder1 = accounts[4];
  const bidder2 = accounts[5];
  const bidder3 = accounts[6];
  const bidder4 = accounts[7];
  const editionNumber1 = 100000;
  const editionType = 1;
  const editionData1 = "editionData1";
  const editionTokenUri1 = "edition1";
  const edition1Price = etherToWei(0.1);
  const artistCommission = 76;
  const totalAvailable = 5;

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {
    // Create contracts
    this.koda = await KnownOriginDigitalAssetV2.new({from: _owner});
    this.auction = await ArtistAcceptingBids.new(this.koda.address, {from: _owner});

    // Update the commission account to be something different than owner
    await this.auction.setKoCommissionAccount(koCommission, {from: _owner});

    // Whitelist the auction contract
    await this.koda.addAddressToAccessControl(this.auction.address, ROLE_MINTER, {from: _owner});

    // Grab the min bid amount
    this.minBidAmount = await this.auction.minBidAmount();
  });

  beforeEach(async function () {
    // Create a new edition, unsold with 5 available
    await this.koda.createActiveEdition(editionNumber1, editionData1, editionType, 0, 0, artistAccount1, artistCommission, edition1Price, editionTokenUri1, totalAvailable, {from: _owner});
  });

  describe('constructed properly', async function () {
    it('owner is set', async function () {
      let owner = await this.auction.owner();
      owner.should.be.equal(_owner);
    });

    it('KODA address is set', async function () {
      let kodaAddress = await this.auction.kodaAddress();
      kodaAddress.should.be.equal(this.koda.address);
    });

    it('min bid is set', async function () {
      let minBidAmount = await this.auction.minBidAmount();
      minBidAmount.should.be.bignumber.equal(etherToWei(0.01));
    });
  });

  describe('placing a bid', async function () {

    it('fails if not set up', async function () {
      await assertRevert(this.auction.placeBid(editionNumber1, {from: bidder1, value: this.minBidAmount}));
    });

    describe('once auction setup enabled', async function () {

      beforeEach(async function () {
        // Enable the edition and use a different artist address than the original KODA edition artist
        await this.auction.setArtistsAddressAndEnabledEdition(editionNumber1, artistAccount2);
      });

      it('should be enabled', async function () {
        let isEditionEnabled = await this.auction.isEditionEnabled(editionNumber1);
        isEditionEnabled.should.be.equal(true);
      });

      it('should have an edition controller', async function () {
        let editionController = await this.auction.editionController(editionNumber1);
        editionController.should.be.equal(artistAccount2);
      });

      it('should not have a highest bid yet', async function () {
        let details = await this.auction.highestBidForEdition(editionNumber1);
        details[0].should.be.equal(ZERO_ADDRESS);
        details[1].should.be.bignumber.equal(0);
      });

      describe('can make a simple bid', async function () {

        beforeEach(async function () {
          await this.auction.placeBid(editionNumber1, {from: bidder1, value: this.minBidAmount});
        });

        it('should be highest bidder', async function () {
          let details = await this.auction.highestBidForEdition(editionNumber1);
          details[0].should.be.equal(bidder1);
          details[1].should.be.bignumber.equal(this.minBidAmount);
        });

        it('another bidder cant place a bid at the same value as you', async function () {
          assertRevert(this.auction.placeBid(editionNumber1, {from: bidder2, value: this.minBidAmount}));
        });

        it('another bidder cant place a bid below value of yours', async function () {
          assertRevert(this.auction.placeBid(editionNumber1, {from: bidder2, value: this.minBidAmount.sub(1)}));
        });

        it('contract holds bid value', async function () {
          let auctionBalance = await web3.eth.getBalance(this.auction.address);
          auctionBalance.should.be.bignumber.equal(this.minBidAmount);
        });

        describe('once a bid is made you can increase it', async function () {
          it('will fail if the same bidder makes another bid', async function () {
            await assertRevert(this.auction.placeBid(editionNumber1, {
              from: bidder1,
              value: this.minBidAmount.mul(2)
            }));
          });

          it('can still increase bid once set', async function () {
            await this.auction.increaseBid(editionNumber1, {
              from: bidder1,
              value: this.minBidAmount
            });

            // Check still highest bid
            let details = await this.auction.highestBidForEdition(editionNumber1);
            details[0].should.be.equal(bidder1);
            details[1].should.be.bignumber.equal(this.minBidAmount.mul(2));

            // contract balance updated
            let auctionBalance = await web3.eth.getBalance(this.auction.address);
            auctionBalance.should.be.bignumber.equal(this.minBidAmount.mul(2));
          });
        });

        describe('once a bid is made you can withdraw it', async function () {
          let bidder1BeforeBalance;
          let bidder1AfterBalance;

          let txGasCosts;

          let auctionBeforeBalance;
          let auctionAfterBalance;

          beforeEach(async function () {
            bidder1BeforeBalance = await web3.eth.getBalance(bidder1);
            auctionBeforeBalance = await web3.eth.getBalance(this.auction.address);

            let tx = await this.auction.withdrawBid(editionNumber1, {from: bidder1});
            txGasCosts = await getGasCosts(tx);

            bidder1AfterBalance = await web3.eth.getBalance(bidder1);
            auctionAfterBalance = await web3.eth.getBalance(this.auction.address);
          });

          it('should refund funds', async function () {
            // Check bidder 1 has funds returned
            bidder1AfterBalance.should.be.bignumber.equal(
              bidder1BeforeBalance
                .add(this.minBidAmount) // refunds the bid amount
                .sub(txGasCosts) // minus the gas costs
            );

            // Check auction contract not holding any funds
            auctionAfterBalance.should.be.bignumber.equal(0);
          });

          it('should revert to not having a highest bid yet', async function () {
            let details = await this.auction.highestBidForEdition(editionNumber1);
            details[0].should.be.equal(ZERO_ADDRESS);
            details[1].should.be.bignumber.equal(0);
          });
        });

        describe('cancelling an auction one a bid is made', async function () {

          describe('when not owner', async function () {
            it('fails', async function () {
              await assertRevert(this.auction.cancelAuction(editionNumber1, {from: bidder1}));
            });
          });

          describe('when owner', async function () {
            let bidder1BeforeBalance;
            let bidder1AfterBalance;

            beforeEach(async function () {
              bidder1BeforeBalance = await web3.eth.getBalance(bidder1);

              await this.auction.cancelAuction(editionNumber1, {from: _owner});

              bidder1AfterBalance = await web3.eth.getBalance(bidder1);
            });

            it('reverts bidders funds', async function () {
              // Check bidder 1 has funds returned
              bidder1AfterBalance.should.be.bignumber.equal(
                bidder1BeforeBalance.add(this.minBidAmount)
              );
            });

            it('no more funds held in contract', async function () {
              let auctionBalance = await web3.eth.getBalance(this.auction.address);
              auctionBalance.should.be.bignumber.equal(0);
            });

            it('set edition auction disable', async function () {
              let isEditionEnabled = await this.auction.isEditionEnabled(editionNumber1);
              isEditionEnabled.should.be.equal(false);
            });

            it('should revert to not having a highest bid yet', async function () {
              let details = await this.auction.highestBidForEdition(editionNumber1);
              details[0].should.be.equal(ZERO_ADDRESS);
              details[1].should.be.bignumber.equal(0);
            });
          });

        });

        describe('artist can accept the bid', async function () {

          describe('when not controlling address', async function () {
            it('fails', async function () {
              await assertRevert(this.auction.acceptBid(editionNumber1, {from: _owner}));
            });
          });

          describe('when is controlling address', async function () {
            let artistAccount2BalanceBefore;
            let artistAccount2BalanceAfter;

            let artistAccount1BalanceBefore;
            let artistAccount1BalanceAfter;

            let koAccount2BalanceBefore;
            let koAccount2BalanceAfter;

            let contractBalanceBefore;
            let contractBalanceAfter;

            let bidderBalanceBefore;
            let bidderBalanceAfter;

            let txGasCosts;

            beforeEach(async function () {
              artistAccount1BalanceBefore = await web3.eth.getBalance(artistAccount1);
              artistAccount2BalanceBefore = await web3.eth.getBalance(artistAccount2);
              bidderBalanceBefore = await web3.eth.getBalance(bidder1);
              koAccount2BalanceBefore = await web3.eth.getBalance(koCommission);
              contractBalanceBefore = await web3.eth.getBalance(this.auction.address);

              let tx = await this.auction.acceptBid(editionNumber1, {from: artistAccount2});
              txGasCosts = await getGasCosts(tx);

              artistAccount1BalanceAfter = await web3.eth.getBalance(artistAccount1);
              artistAccount2BalanceAfter = await web3.eth.getBalance(artistAccount2);
              bidderBalanceAfter = await web3.eth.getBalance(bidder1);
              koAccount2BalanceAfter = await web3.eth.getBalance(koCommission);
              contractBalanceAfter = await web3.eth.getBalance(this.auction.address);
            });

            it('tokenId is generated correctly', async function () {
              let tokens = await this.koda.tokensOf(bidder1);
              tokens
                .map(e => e.toNumber())
                .should.be.deep.equal([editionNumber1 + 1]);
            });

            it('total minted is correctly updated', async function () {
              let total = await this.koda.totalSupplyEdition(editionNumber1);
              total.should.be.bignumber.equal(1);
            });

            it('funds get sent to the artists based on commission percentage', async function () {
              const expectedArtistCommission = contractBalanceBefore.div(100).mul(artistCommission);

              artistAccount1BalanceAfter.should.be.bignumber.equal(
                artistAccount1BalanceBefore.add(expectedArtistCommission)
              );
            });

            it('funds get sent to the ko commission account', async function () {
              const remainingCommission = (100 - artistCommission);
              remainingCommission.should.be.equal(24); // remaining commission of 24%

              const expectedKoCommission = contractBalanceBefore.div(100).mul(remainingCommission);

              koAccount2BalanceAfter.should.be.bignumber.equal(
                koAccount2BalanceBefore.add(expectedKoCommission)
              );
            });

            it('calling controller address pays the gas', async function () {
              artistAccount2BalanceAfter.should.be.bignumber.equal(
                artistAccount2BalanceBefore.sub(txGasCosts)
              );
            });

            it('no more funds held in contract', async function () {
              // Confirm funds originally held
              contractBalanceBefore.should.be.bignumber.equal(this.minBidAmount);

              // Confirm funds now gone
              contractBalanceAfter.should.be.bignumber.equal(0);
            });

            it('bidder balance does not change', async function () {
              bidderBalanceBefore.should.be.bignumber.equal(bidderBalanceAfter);
            });

          });
        });
      });
    });
  });

  describe('withdrawing a bid', async function () {

    const theBidder = bidder1;
    const anotherBidder = bidder2;

    beforeEach(async function () {
      // Enable the edition and use a different artist address than the original KODA edition artist
      await this.auction.setArtistsAddressAndEnabledEdition(editionNumber1, artistAccount2);

      // Place a bid on the edition
      await this.auction.placeBid(editionNumber1, {from: theBidder, value: this.minBidAmount});
    });

    it('bid has been placed', async function () {
      let details = await this.auction.highestBidForEdition(editionNumber1);
      details[0].should.be.equal(theBidder);
      details[1].should.be.bignumber.equal(this.minBidAmount);
    });

    it('cant be withdrawn when not the originally bidder', async function () {
      await assertRevert(this.auction.withdrawBid(editionNumber1, {from: anotherBidder}));
    });

    it('cant be withdrawn when no bid exists', async function () {
      await assertRevert(this.auction.withdrawBid(123456, {from: theBidder}));
    });

    describe('when paused', async function () {

      beforeEach(async function () {
        await this.auction.pause({from: _owner});
      });

      it('cant be withdrawn when paused', async function () {
        await assertRevert(this.auction.withdrawBid(editionNumber1, {from: bidder1}));

        await this.auction.unpause({from: _owner});

        await this.auction.withdrawBid(editionNumber1, {from: bidder1});

        let details = await this.auction.highestBidForEdition(editionNumber1);
        details[0].should.be.equal(ZERO_ADDRESS);
        details[1].should.be.bignumber.equal(0);
      });
    });

    describe('when withdrawing the bid', async function () {

      let txGasCosts;
      let bidderBalanceBefore;
      let bidderBalanceAfter;

      let contractBalanceBefore;
      let contractBalanceAfter;

      beforeEach(async function () {
        bidderBalanceBefore = await web3.eth.getBalance(theBidder);
        contractBalanceBefore = await web3.eth.getBalance(this.auction.address);

        let tx = await this.auction.withdrawBid(editionNumber1, {from: theBidder});
        txGasCosts = await getGasCosts(tx);

        contractBalanceAfter = await web3.eth.getBalance(this.auction.address);
        bidderBalanceAfter = await web3.eth.getBalance(theBidder);
      });

      it('clears down the highest bid', async function () {
        let details = await this.auction.highestBidForEdition(editionNumber1);
        details[0].should.be.equal(ZERO_ADDRESS);
        details[1].should.be.bignumber.equal(0);
      });

      it('no more funds held in contract', async function () {
        // Confirm funds originally held
        contractBalanceBefore.should.be.bignumber.equal(this.minBidAmount);

        // Confirm funds now gone
        contractBalanceAfter.should.be.bignumber.equal(0);
      });

      it('should return the finds to the bidder', async function () {
        bidderBalanceAfter.should.be.bignumber.equal(
          bidderBalanceBefore
            .add(this.minBidAmount) // refund the bid
            .sub(txGasCosts) // pay for the transaction
        );
      });

      it('cant increase your bid once its been withdrawn', async function () {
        await assertRevert(this.auction.increaseBid(editionNumber1, {from: theBidder, value: this.minBidAmount}));
      });

      it('cant withdraw your bid once its been withdrawn', async function () {
        await assertRevert(this.auction.withdrawBid(editionNumber1, {from: theBidder}));
      });

      it('can place a new bid once its been withdrawn', async function () {
        await this.auction.placeBid(editionNumber1, {from: theBidder, value: this.minBidAmount});

        let details = await this.auction.highestBidForEdition(editionNumber1);
        details[0].should.be.equal(theBidder);
        details[1].should.be.bignumber.equal(this.minBidAmount);
      });

    });

  });

  describe('increasing a bid', async function () {

    beforeEach(async function () {
      await this.auction.setArtistsAddressAndEnabledEdition(editionNumber1, artistAccount2);
    });

    it('cant increase it when no bid exists', async function () {
      await assertRevert(this.auction.increaseBid(editionNumber1, {from: bidder1, value: this.minBidAmount}));
    });

    describe('when the bid is made', async function () {
      const theBidder = bidder1;

      beforeEach(async function () {
        await this.auction.placeBid(editionNumber1, {from: theBidder, value: this.minBidAmount});
      });

      it('cant increase your bid by less than min value', async function () {
        await assertRevert(this.auction.increaseBid(editionNumber1, {from: bidder1, value: this.minBidAmount.sub(1)}));
      });

      it('cant increase your bid if you are no longer the top bidder', async function () {

        await this.auction.placeBid(editionNumber1, {from: bidder2, value: this.minBidAmount.mul(2)});

        await assertRevert(this.auction.increaseBid(editionNumber1, {from: bidder1, value: this.minBidAmount}));
      });

      it('cant increase your bid if paused', async function () {
        await this.auction.pause({from: _owner});
        await assertRevert(this.auction.placeBid(editionNumber1, {from: bidder2, value: this.minBidAmount.mul(2)}));

        await this.auction.unpause({from: _owner});
        await this.auction.placeBid(editionNumber1, {from: bidder2, value: this.minBidAmount.mul(2)});
      });

      it('can increase the bid once you are the highest bidder', async function () {
        let balanceBefore = await web3.eth.getBalance(this.auction.address);
        balanceBefore.should.be.bignumber.equal(this.minBidAmount);

        let detailsBefore = await this.auction.highestBidForEdition(editionNumber1);
        detailsBefore[0].should.be.equal(bidder1);
        detailsBefore[1].should.be.bignumber.equal(this.minBidAmount);

        await this.auction.increaseBid(editionNumber1, {from: bidder1, value: this.minBidAmount});

        let detailsAfter = await this.auction.highestBidForEdition(editionNumber1);
        detailsAfter[0].should.be.equal(bidder1);
        detailsAfter[1].should.be.bignumber.equal(this.minBidAmount.mul(2));

        let balanceAfter = await web3.eth.getBalance(this.auction.address);
        balanceAfter.should.be.bignumber.equal(this.minBidAmount.mul(2));
      });

      it('can increase your bid multiple times', async function () {
        await this.auction.increaseBid(editionNumber1, {from: bidder1, value: this.minBidAmount});
        await this.auction.increaseBid(editionNumber1, {from: bidder1, value: this.minBidAmount});
        await this.auction.increaseBid(editionNumber1, {from: bidder1, value: this.minBidAmount});
        await this.auction.increaseBid(editionNumber1, {from: bidder1, value: this.minBidAmount});

        let detailsAfter = await this.auction.highestBidForEdition(editionNumber1);
        detailsAfter[0].should.be.equal(bidder1);
        detailsAfter[1].should.be.bignumber.equal(this.minBidAmount.mul(5));

        let balanceAfter = await web3.eth.getBalance(this.auction.address);
        balanceAfter.should.be.bignumber.equal(this.minBidAmount.mul(5));
      });
    });
  });

  describe('create multiple bids', async function () {

  });


});


async function getGasCosts(receipt) {
  let tx = await web3.eth.getTransaction(receipt.tx);
  let gasPrice = tx.gasPrice;
  return gasPrice.mul(receipt.receipt.gasUsed);
};
