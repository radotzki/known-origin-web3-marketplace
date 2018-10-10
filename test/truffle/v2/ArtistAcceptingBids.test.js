const assertRevert = require('../../helpers/assertRevert');
const etherToWei = require('../../helpers/etherToWei');
const advanceBlock = require('../../helpers/advanceToBlock');
const {duration, increaseTimeTo} = require('../../helpers/increaseTime');
const latestTime = require('../../helpers/latestTime');
const {ethSendTransaction, ethGetBalance} = require('../../helpers/web3');

const _ = require('lodash');

const BigNumber = web3.BigNumber;
const ForceEther = artifacts.require('ForceEther');
const KnownOriginDigitalAssetV2 = artifacts.require('KnownOriginDigitalAssetV2');
const ArtistAcceptingBids = artifacts.require('ArtistAcceptingBids');

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract.only('ArtistAcceptingBids', function (accounts) {

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

    describe('Once an edition is configured', async function () {
      beforeEach(async function () {
        await this.auction.setArtistsAddressAndEnabledEdition(editionNumber1, artistAccount2, {from: _owner});
      });

      it('is not paused', async function () {
        let paused = await this.auction.paused();
        paused.should.be.equal(false);
      });

      it('no one if the highest bidder', async function () {
        let details = await this.auction.highestBidForEdition(editionNumber1);
        details[0].should.be.equal(ZERO_ADDRESS);
        details[1].should.be.bignumber.equal(0);
      });

      it('is enabled', async function () {
        let isEditionEnabled = await this.auction.isEditionEnabled(editionNumber1);
        isEditionEnabled.should.be.equal(true);
      });

      it('controller is set', async function () {
        let editionController = await this.auction.editionController(editionNumber1);
        editionController.should.be.equal(artistAccount2);
      });
    });
  });

  describe('placing a bid', async function () {

    it('fails if not set up', async function () {
      await assertRevert(this.auction.placeBid(editionNumber1, {from: bidder1, value: this.minBidAmount}));
    });

    describe('once auction setup enabled', async function () {

      beforeEach(async function () {
        // Enable the edition and use a different artist address than the original KODA edition artist
        await this.auction.setArtistsAddressAndEnabledEdition(editionNumber1, artistAccount2, {from: _owner});
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

        it('auction details are populated', async function () {
          let details = await this.auction.auctionDetails(editionNumber1);
          details[0].should.be.equal(true); // bool _enabled
          details[1].should.be.equal(bidder1); // address _bidder
          details[2].should.be.bignumber.equal(this.minBidAmount); // uint256 _value
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
            let highestbidder = await this.auction.highestBidForEdition(editionNumber1);
            highestbidder[0].should.be.equal(bidder1);
            highestbidder[1].should.be.bignumber.equal(this.minBidAmount.mul(2));

            // contract balance updated
            let auctionBalance = await web3.eth.getBalance(this.auction.address);
            auctionBalance.should.be.bignumber.equal(this.minBidAmount.mul(2));

            // details are updated
            let details = await this.auction.auctionDetails(editionNumber1);
            details[0].should.be.equal(true); // bool _enabled
            details[1].should.be.equal(bidder1); // address _bidder
            details[2].should.be.bignumber.equal(this.minBidAmount.mul(2)); // uint256 _value
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

          it('auction details are populated', async function () {
            let details = await this.auction.auctionDetails(editionNumber1);
            details[0].should.be.equal(true); // bool _enabled
            details[1].should.be.equal(ZERO_ADDRESS); // address _bidder
            details[2].should.be.bignumber.equal(0); // uint256 _value
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

            it('auction details are populated', async function () {
              let details = await this.auction.auctionDetails(editionNumber1);
              details[0].should.be.equal(false); // bool _enabled
              details[1].should.be.equal(ZERO_ADDRESS); // address _bidder
              details[2].should.be.bignumber.equal(0); // uint256 _value
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

            it('auction details are populated', async function () {
              let details = await this.auction.auctionDetails(editionNumber1);
              details[0].should.be.equal(true); // bool _enabled
              details[1].should.be.equal(ZERO_ADDRESS); // address _bidder
              details[2].should.be.bignumber.equal(0); // uint256 _value
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
      await this.auction.setArtistsAddressAndEnabledEdition(editionNumber1, artistAccount2, {from: _owner});

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
      await this.auction.setArtistsAddressAndEnabledEdition(editionNumber1, artistAccount2, {from: _owner});
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

  describe('multiple bidders on one edition', async function () {

    let bidder1_BalanceBeforeBid;
    let bidder1_BalanceAfterBid;

    let txGasCosts;

    beforeEach(async function () {
      await this.auction.setArtistsAddressAndEnabledEdition(editionNumber1, artistAccount1, {from: _owner});
      bidder1_BalanceBeforeBid = await web3.eth.getBalance(bidder1);

      let tx = await this.auction.placeBid(editionNumber1, {from: bidder1, value: this.minBidAmount});

      bidder1_BalanceAfterBid = await web3.eth.getBalance(bidder1);
      txGasCosts = await getGasCosts(tx);
    });

    it('bidder 1 is highest bidder', async function () {
      let details = await this.auction.highestBidForEdition(editionNumber1);
      details[0].should.be.equal(bidder1);
      details[1].should.be.bignumber.equal(this.minBidAmount);
    });

    it('contract balance is correct', async function () {
      let balanceAfter = await web3.eth.getBalance(this.auction.address);
      balanceAfter.should.be.bignumber.equal(this.minBidAmount);
    });

    it('bidder 1 balance has been deducted the bid amount & gas costs', async function () {
      bidder1_BalanceAfterBid.should.be.bignumber.equal(
        bidder1_BalanceBeforeBid
          .sub(this.minBidAmount) // the bid amount
          .sub(txGasCosts) // paid the transaction
      );
    });

    describe('Bidder 1 is outbid but Bidder 2', async function () {

      let _2ndBid;
      let bidder1_BalanceAfterBeingOutBid;

      let bidder2_BalanceBeforeBid;
      let bidder2_BalanceAfterBid;

      beforeEach(async function () {
        _2ndBid = this.minBidAmount.mul(2);

        bidder2_BalanceBeforeBid = await web3.eth.getBalance(bidder2);

        let tx = await this.auction.placeBid(editionNumber1, {from: bidder2, value: _2ndBid});
        txGasCosts = await getGasCosts(tx);

        bidder2_BalanceAfterBid = await web3.eth.getBalance(bidder2);
        bidder1_BalanceAfterBeingOutBid = await web3.eth.getBalance(bidder1);
      });

      it('bidder 2 is highest bidder', async function () {
        let details = await this.auction.highestBidForEdition(editionNumber1);
        details[0].should.be.equal(bidder2);
        details[1].should.be.bignumber.equal(_2ndBid);
      });

      it('contract balance is correct', async function () {
        let balanceAfter = await web3.eth.getBalance(this.auction.address);
        balanceAfter.should.be.bignumber.equal(_2ndBid);
      });

      it('bidder 2 balance has been deducted the bid amount & gas costs', async function () {
        bidder2_BalanceAfterBid.should.be.bignumber.equal(
          bidder2_BalanceBeforeBid
            .sub(_2ndBid) // the bid amount
            .sub(txGasCosts) // paid the transaction
        );
      });

      it('bidder 1 is refunded his previous bid', async function () {
        bidder1_BalanceAfterBeingOutBid.should.be.bignumber.equal(
          bidder1_BalanceAfterBid.add(this.minBidAmount) // original funds are set back to the original bidder
        );
      });

      describe('Bidder 2 is outbid but Bidder 3', async function () {

        let _3rdBid; // Bidder 3 doubles the amount again

        let bidder2_BalanceAfterBeingOutBid;

        let bidder3_BalanceBeforeBid;
        let bidder3_BalanceAfterBid;

        beforeEach(async function () {
          _3rdBid = this.minBidAmount.mul(4);
          bidder3_BalanceBeforeBid = await web3.eth.getBalance(bidder3);

          let tx = await this.auction.placeBid(editionNumber1, {from: bidder3, value: _3rdBid});
          txGasCosts = await getGasCosts(tx);

          bidder3_BalanceAfterBid = await web3.eth.getBalance(bidder3);
          bidder2_BalanceAfterBeingOutBid = await web3.eth.getBalance(bidder2);
        });

        it('Bidder 3 is highest bidder', async function () {
          let details = await this.auction.highestBidForEdition(editionNumber1);
          details[0].should.be.equal(bidder3);
          details[1].should.be.bignumber.equal(this.minBidAmount.mul(4));
        });

        it('contract balance is correct', async function () {
          let balanceAfter = await web3.eth.getBalance(this.auction.address);
          balanceAfter.should.be.bignumber.equal(this.minBidAmount.mul(4));
        });

        it('bidder 3 balance has been deducted the bid amount & gas costs', async function () {
          bidder3_BalanceAfterBid.should.be.bignumber.equal(
            bidder3_BalanceBeforeBid
              .sub(_3rdBid) // the bid amount
              .sub(txGasCosts) // paid the transaction
          );
        });

        it('bidder 2 is refunded his previous bid', async function () {
          bidder2_BalanceAfterBeingOutBid.should.be.bignumber.equal(
            bidder2_BalanceAfterBid.add(_2ndBid) // original funds are set back to the original bidder
          );
        });

        describe('Bidder 3 is outbid but Bidder 4', async function () {

          let _4thBid;

          let bidder3_BalanceAfterBeingOutBid;

          let bidder4_BalanceBeforeBid;
          let bidder4_BalanceAfterBid;

          beforeEach(async function () {
            _4thBid = this.minBidAmount.mul(5);
            bidder4_BalanceBeforeBid = await web3.eth.getBalance(bidder4);

            let tx = await this.auction.placeBid(editionNumber1, {from: bidder4, value: _4thBid});
            txGasCosts = await getGasCosts(tx);

            bidder4_BalanceAfterBid = await web3.eth.getBalance(bidder4);
            bidder3_BalanceAfterBeingOutBid = await web3.eth.getBalance(bidder3);
          });

          it('Bidder 3 is highest bidder', async function () {
            let details = await this.auction.highestBidForEdition(editionNumber1);
            details[0].should.be.equal(bidder4);
            details[1].should.be.bignumber.equal(_4thBid);
          });

          it('contract balance is correct', async function () {
            let balanceAfter = await web3.eth.getBalance(this.auction.address);
            balanceAfter.should.be.bignumber.equal(_4thBid);
          });

          it('bidder 4 balance has been deducted the bid amount & gas costs', async function () {
            bidder4_BalanceAfterBid.should.be.bignumber.equal(
              bidder4_BalanceBeforeBid
                .sub(_4thBid) // the bid amount
                .sub(txGasCosts) // paid the transaction
            );
          });

          it('bidder 3 is refunded his previous bid', async function () {
            bidder3_BalanceAfterBeingOutBid.should.be.bignumber.equal(
              bidder3_BalanceAfterBid.add(_3rdBid) // original funds are set back to the original bidder
            );
          });
        });
      });
    });
  });

  describe('management controls', async function () {

    describe('global auction', async function () {

      describe('setting min bid', async function () {
        it('is possible when you are the owner', async function () {
          const originalMinBid = await this.auction.minBidAmount();
          originalMinBid.should.be.bignumber.equal(this.minBidAmount);

          await this.auction.setMinBidAmount(1, {from: _owner});

          const updatedMinBid = await this.auction.minBidAmount();
          updatedMinBid.should.be.bignumber.equal(1);
        });

        it('fails when you are NOT the owner', async function () {
          await assertRevert(this.auction.setMinBidAmount(1, {from: bidder1}));
        });
      });

      describe('can set a new KODA address', async function () {
        it('is possible when you are the owner', async function () {
          const originalAddress = await this.auction.kodaAddress();
          originalAddress.should.be.equal(this.koda.address);

          await this.auction.setKodavV2(ZERO_ADDRESS, {from: _owner});

          const updatedAddress = await this.auction.kodaAddress();
          updatedAddress.should.be.equal(ZERO_ADDRESS);
        });
        it('fails when you are NOT the owner', async function () {
          await assertRevert(this.auction.setKodavV2(ZERO_ADDRESS, {from: bidder1}));
        });
      });
    });

    describe('stuck ether', async function () {
      describe('withdrawing everything', async function () {
        it('fails when no ether left to withdraw', async function () {
          await assertRevert(this.auction.withdrawStuckEther(_owner, {from: _owner}));
        });

        it('is successful when owner and eth present to withdraw', async function () {
          await this.auction.setArtistsAddressAndEnabledEdition(editionNumber1, artistAccount2, {from: _owner});
          await this.auction.placeBid(editionNumber1, {from: bidder1, value: this.minBidAmount});

          const auctionBalance = await web3.eth.getBalance(this.auction.address);
          auctionBalance.should.be.bignumber.equal(this.minBidAmount);

          await this.auction.withdrawStuckEther(_owner, {from: _owner});

          const newAuctionBalance = await web3.eth.getBalance(this.auction.address);
          newAuctionBalance.should.be.bignumber.equal(0);
        });

        it('fails when NOT owner', async function () {
          await assertRevert(this.auction.withdrawStuckEther(_owner, {from: bidder1}));
        });

        it('force ether can still be withdrawn', async function () {
          const forceEther = await ForceEther.new({value: this.minBidAmount});
          await forceEther.destroyAndSend(this.auction.address);
          const forcedBalance = await web3.eth.getBalance(this.auction.address);
          forcedBalance.should.be.bignumber.equal(this.minBidAmount);

          const ownerPreBalance = await web3.eth.getBalance(_owner);

          const tx = await this.auction.withdrawStuckEther(_owner, {from: _owner});
          const txGasCosts = await getGasCosts(tx);

          const ownerPostBalance = await web3.eth.getBalance(_owner);

          const postWithdrawalAuctionBalance = await web3.eth.getBalance(this.auction.address);
          postWithdrawalAuctionBalance.should.be.bignumber.equal(0);

          ownerPostBalance.should.be.bignumber.equal(
            ownerPreBalance
              .sub(txGasCosts) // owner pays fee
              .add(this.minBidAmount) // gets all stuck ether sent to them
          );
        });
      });

      describe('withdrawing specific amount', async function () {

        const PARTIAL_WITHDRAWAL_AMOUNT = etherToWei(0.0001);

        it('fails when no ether left to withdraw', async function () {
          await assertRevert(this.auction.withdrawStuckEtherOfAmount(_owner, PARTIAL_WITHDRAWAL_AMOUNT, {from: _owner}));
        });

        it('is successful when owner and eth present to withdraw', async function () {
          await this.auction.setArtistsAddressAndEnabledEdition(editionNumber1, artistAccount2, {from: _owner});
          await this.auction.placeBid(editionNumber1, {from: bidder1, value: this.minBidAmount});

          const auctionBalance = await web3.eth.getBalance(this.auction.address);
          auctionBalance.should.be.bignumber.equal(this.minBidAmount);

          await this.auction.withdrawStuckEtherOfAmount(_owner, PARTIAL_WITHDRAWAL_AMOUNT, {from: _owner});

          const newAuctionBalance = await web3.eth.getBalance(this.auction.address);
          newAuctionBalance.should.be.bignumber.equal(this.minBidAmount.sub(PARTIAL_WITHDRAWAL_AMOUNT));
        });

        it('fails when NOT owner', async function () {
          await assertRevert(this.auction.withdrawStuckEtherOfAmount(_owner, PARTIAL_WITHDRAWAL_AMOUNT, {from: bidder1}));
        });

        it('force ether can still be withdrawn', async function () {
          const forceEther = await ForceEther.new({value: this.minBidAmount});
          await forceEther.destroyAndSend(this.auction.address);
          const forcedBalance = await web3.eth.getBalance(this.auction.address);
          forcedBalance.should.be.bignumber.equal(this.minBidAmount);

          const ownerPreBalance = await web3.eth.getBalance(_owner);

          const tx = await this.auction.withdrawStuckEtherOfAmount(_owner, PARTIAL_WITHDRAWAL_AMOUNT, {from: _owner});
          const txGasCosts = await getGasCosts(tx);

          const ownerPostBalance = await web3.eth.getBalance(_owner);

          const postWithdrawalAuctionBalance = await web3.eth.getBalance(this.auction.address);
          postWithdrawalAuctionBalance.should.be.bignumber.equal(
            this.minBidAmount.sub(PARTIAL_WITHDRAWAL_AMOUNT)
          );

          ownerPostBalance.should.be.bignumber.equal(
            ownerPreBalance
              .sub(txGasCosts) // owner pays fee
              .add(PARTIAL_WITHDRAWAL_AMOUNT) // gets partial stuck ether sent to them
          );
        });
      });
    });

    describe('edition controls', async function () {

      describe('enabled editions', async function () {
        it('is possible when you are the owner', async function () {
          await this.auction.enableEdition(editionNumber1, {from: _owner});
          let enabled = await this.auction.isEditionEnabled(editionNumber1);
          enabled.should.be.equal(true);

          await this.auction.disableEdition(editionNumber1, {from: _owner});
          enabled = await this.auction.isEditionEnabled(editionNumber1);
          enabled.should.be.equal(false);
        });

        it('fails when you are NOT the owner', async function () {
          await assertRevert(this.auction.enableEdition(editionNumber1, {from: bidder1}));
        });
      });

      describe('disable editions', async function () {
        it('is possible when you are the owner', async function () {
          await this.auction.enableEdition(editionNumber1, {from: _owner});
          let enabled = await this.auction.isEditionEnabled(editionNumber1);
          enabled.should.be.equal(true);

          await this.auction.disableEdition(editionNumber1, {from: _owner});
          enabled = await this.auction.isEditionEnabled(editionNumber1);
          enabled.should.be.equal(false);
        });

        it('fails when you are NOT the owner', async function () {
          await this.auction.enableEdition(editionNumber1, {from: _owner});
          let enabled = await this.auction.isEditionEnabled(editionNumber1);
          enabled.should.be.equal(true);

          await assertRevert(this.auction.disableEdition(editionNumber1, {from: bidder1}));

          enabled = await this.auction.isEditionEnabled(editionNumber1);
          enabled.should.be.equal(true);
        });
      });

      describe('setting artists control address', async function () {
        it('is possible when you are the owner', async function () {
          let editionController = await this.auction.editionController(editionNumber1);
          editionController.should.be.equal(ZERO_ADDRESS);

          await this.auction.setArtistsControlAddress(editionNumber1, artistAccount2, {from: _owner});

          editionController = await this.auction.editionController(editionNumber1);
          editionController.should.be.equal(artistAccount2);
        });

        it('fails when you are NOT the owner', async function () {
          await assertRevert(this.auction.setArtistsControlAddress(editionNumber1, artistAccount2, {from: bidder1}));

          // Still zero
          const editionController = await this.auction.editionController(editionNumber1);
          editionController.should.be.equal(ZERO_ADDRESS);
        });
      });
    });

    describe('override functions', async function () {
      // TODO
      // function manualOverrideEditionBid(uint256 _editionNumber, address _bidder, uint256 _amount) onlyOwner public returns (bool) {
      // function manualOverrideEditionHighestBidder(uint256 _editionNumber, address _bidder) onlyOwner public returns (bool) {
      // function manualOverrideEditionHighestBidAndBidder(uint256 _editionNumber, address _bidder, uint256 _amount) onlyOwner public returns (bool) {
    });

  });

  describe('TODO EVENTS', async function () {

  });
});

async function getGasCosts(receipt) {
  let tx = await web3.eth.getTransaction(receipt.tx);
  let gasPrice = tx.gasPrice;
  return gasPrice.mul(receipt.receipt.gasUsed);
}
