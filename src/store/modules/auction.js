import * as actions from '../actions';
import * as mutations from '../mutation';
import _ from 'lodash';
import Web3 from "web3";
import Vue from "vue";

const auctionStateModule = {
  namespaced: true,
  state: {
    owner: null,
    contractAddress: null,

    auction: {},
    auctionEvents: {},
    bidState: {},
    acceptingBidState: {},
    withdrawingBidState: {},
    minBidAmount: 0,
    minBidAmountWei: 0,
  },
  getters: {
    isEditionAuctionEnabled: (state, getters) => (edition) => {
      return _.get(state.auction[edition], 'enabled') === true;
    },
    nextMinimumNewBid: (state, getters) => (edition) => {
      let currentEditionHighestBid = _.get(state.auction[edition], 'highestBidWei', 0);
      let minBid = _.get(state, 'minBidAmountWei', 0);

      if (currentEditionHighestBid === 0 && minBid === 0) {
        return "0.01";
      }
      return Web3.utils.fromWei(currentEditionHighestBid.add(minBid).toString("10"), 'ether');
    },
    accountIsHighestBidder: (state, getters, rootState) => (edition) => {
      if (!rootState.account) {
        return false;
      }
      let currentHighestBidder = _.get(state.auction[edition], 'highestBidder', 0);
      if (currentHighestBidder === 0) {
        return false;
      }
      return Web3.utils.toChecksumAddress(currentHighestBidder) === Web3.utils.toChecksumAddress(rootState.account);
    },
    auctionEditionEvents: (state) => (edition) => {
      return _.orderBy(state.auctionEvents[edition], 'blockNumber', 'desc');
    },
    /////////////////////////
    // Accepting Bid State //
    /////////////////////////
    editionAuctionState: (state) => (editionNumber) => {
      return _.get(state.bidState, editionNumber);
    },
    isAuctionTriggered: (state, getters) => (editionNumber) => {
      return _.get(getters.editionAuctionState(editionNumber), 'state') === mutations.AUCTION_TRIGGERED;
    },
    isAuctionStarted: (state, getters) => (editionNumber) => {
      return _.get(getters.editionAuctionState(editionNumber), 'state') === mutations.AUCTION_STARTED;
    },
    isAuctionSuccessful: (state, getters) => (editionNumber) => {
      return _.get(getters.editionAuctionState(editionNumber), 'state') === mutations.AUCTION_PLACED_SUCCESSFUL;
    },
    isAuctionFailed: (state, getters) => (editionNumber) => {
      return _.get(getters.editionAuctionState(editionNumber), 'state') === mutations.AUCTION_FAILED;
    },
    getTransactionForEdition: (state, getters) => (editionNumber) => {
      return getters.editionAuctionState(editionNumber).transaction;
    },
    /////////////////////////
    // Accepting Bid State //
    /////////////////////////
    editionAcceptingBidState: (state) => (editionNumber) => {
      return _.get(state.acceptingBidState, editionNumber);
    },
    isAcceptingBidTriggered: (state, getters) => (editionNumber) => {
      return _.get(getters.editionAcceptingBidState(editionNumber), 'state') === mutations.BID_ACCEPTED_TRIGGERED;
    },
    isAcceptingBidStarted: (state, getters) => (editionNumber) => {
      return _.get(getters.editionAcceptingBidState(editionNumber), 'state') === mutations.BID_ACCEPTED_STARTED;
    },
    isAcceptingBidSuccessful: (state, getters) => (editionNumber) => {
      return _.get(getters.editionAcceptingBidState(editionNumber), 'state') === mutations.BID_ACCEPTED_SUCCESSFUL;
    },
    isAcceptingBidFailed: (state, getters) => (editionNumber) => {
      return _.get(getters.editionAcceptingBidState(editionNumber), 'state') === mutations.BID_ACCEPTED_FAILED;
    },
    getAcceptingBidTransactionForEdition: (state, getters) => (editionNumber) => {
      return getters.editionAcceptingBidState(editionNumber).transaction;
    },
    ///////////////////////////
    // Withdrawing Bid State //
    ///////////////////////////
    editionWithdrawnBidState: (state) => (editionNumber) => {
      return _.get(state.withdrawingBidState, editionNumber);
    },
    isWithdrawnBidTriggered: (state, getters) => (editionNumber) => {
      return _.get(getters.editionWithdrawnBidState(editionNumber), 'state') === mutations.BID_WITHDRAWN_TRIGGERED;
    },
    isWithdrawnBidStarted: (state, getters) => (editionNumber) => {
      return _.get(getters.editionWithdrawnBidState(editionNumber), 'state') === mutations.BID_WITHDRAWN_STARTED;
    },
    isWithdrawnBidSuccessful: (state, getters) => (editionNumber) => {
      return _.get(getters.editionWithdrawnBidState(editionNumber), 'state') === mutations.BID_WITHDRAWN_SUCCESSFUL;
    },
    isWithdrawnBidFailed: (state, getters) => (editionNumber) => {
      return _.get(getters.editionWithdrawnBidState(editionNumber), 'state') === mutations.BID_WITHDRAWN_FAILED;
    },
    getWithdrawnBidTransactionForEdition: (state, getters) => (editionNumber) => {
      return getters.editionWithdrawnBidState(editionNumber).transaction;
    },
  },
  mutations: {
    [mutations.SET_AUCTION_OWNER](state, {owner, address}) {
      state.owner = Web3.utils.toChecksumAddress(owner);
      state.contractAddress = address;
    },
    [mutations.SET_AUCTION_EVENTS](state, {results, edition}) {
      if (!_.isArray(state.auctionEvents[edition])) {
        state.auctionEvents[edition] = [];
      }
      const updatedEvents = state.auctionEvents[edition].concat(results);
      Vue.set(state, 'auctionEvents', {
        [edition]: updatedEvents
      });
    },
    [mutations.RESET_EDITION_AUCTION_EVENTS](state, {edition}) {
      state.auctionEvents[edition] = {};
    },
    [mutations.SET_AUCTION_DETAILS](state, data) {
      state.auction = {
        ...data
      };
    },
    [mutations.SET_MINIMUM_BID](state, minBidAmount) {
      state.minBidAmount = Web3.utils.fromWei(minBidAmount.toString("10"), 'ether');
      state.minBidAmountWei = minBidAmount;
    },
    [mutations.RESET_BID_STATE](state, {edition}) {
      delete state.bidState[edition];
      state.bidState = {...state.bidState};
    },
    [mutations.AUCTION_TRIGGERED](state, {edition, account}) {
      state.bidState = {
        ...state.bidState,
        [edition]: {
          edition, account, state: 'AUCTION_TRIGGERED'
        }
      };
    },
    [mutations.AUCTION_FAILED](state, {edition, account}) {
      state.bidState = {
        ...state.bidState,
        [edition]: {
          edition, account, state: 'AUCTION_FAILED'
        }
      };
    },
    [mutations.AUCTION_PLACED_SUCCESSFUL](state, {edition, account}) {
      state.bidState = {
        ...state.bidState,
        [edition]: {
          edition,
          account,
          transaction: state.bidState[edition].transaction,
          state: 'AUCTION_PLACED_SUCCESSFUL'
        }
      };
    },
    [mutations.AUCTION_STARTED](state, {edition, account, transaction}) {
      // Guard against the timed account check beating the event callbacks
      if (state.bidState[edition].state === 'AUCTION_PLACED_SUCCESSFUL') {
        state.bidState = {
          ...state.bidState,
          [edition]: {
            edition, account, transaction, state: 'AUCTION_PLACED_SUCCESSFUL'
          }
        };
        return;
      }

      state.bidState = {
        ...state.bidState,
        [edition]: {
          edition, account, transaction, state: 'AUCTION_STARTED'
        }
      };
    },
    [mutations.RESET_BID_ACCEPTED_STATE](state, {auction}) {
      delete state.acceptingBidState[auction.edition];
      state.acceptingBidState = {...state.acceptingBidState};
    },
    [mutations.BID_ACCEPTED_FAILED](state, {auction, account}) {
      state.acceptingBidState = {
        ...state.acceptingBidState,
        [auction.edition]: {
          ...auction,
          account,
          transaction: state.acceptingBidState[auction.edition].transaction,
          state: 'BID_ACCEPTED_FAILED'
        }
      };
    },
    [mutations.BID_ACCEPTED_STARTED](state, {auction, account, transaction}) {
      state.acceptingBidState = {
        ...state.acceptingBidState,
        [auction.edition]: {
          ...auction,
          account,
          transaction,
          state: 'BID_ACCEPTED_STARTED'
        }
      };
    },
    [mutations.BID_ACCEPTED_SUCCESSFUL](state, {auction, account}) {
      state.acceptingBidState = {
        ...state.acceptingBidState,
        [auction.edition]: {
          ...auction,
          account,
          transaction: state.acceptingBidState[auction.edition].transaction,
          state: 'BID_ACCEPTED_SUCCESSFUL'
        }
      };
    },
    [mutations.BID_ACCEPTED_TRIGGERED](state, {auction, account}) {
      state.acceptingBidState = {
        ...state.acceptingBidState,
        [auction.edition]: {
          ...auction,
          account,
          state: 'BID_ACCEPTED_TRIGGERED'
        }
      };
    },
    [mutations.RESET_BID_WITHDRAWN_STATE](state, {auction}) {
      delete state.withdrawingBidState[auction.edition];
      state.withdrawingBidState = {...state.acceptingBidState};
    },
    [mutations.BID_WITHDRAWN_FAILED](state, {auction, account}) {
      state.withdrawingBidState = {
        ...state.withdrawingBidState,
        [auction.edition]: {
          ...auction,
          account,
          transaction: state.withdrawingBidState[auction.edition].transaction,
          state: 'BID_WITHDRAWN_FAILED'
        }
      };
    },
    [mutations.BID_WITHDRAWN_STARTED](state, {auction, account, transaction}) {
      state.withdrawingBidState = {
        ...state.withdrawingBidState,
        [auction.edition]: {
          ...auction,
          account,
          transaction,
          state: 'BID_WITHDRAWN_STARTED'
        }
      };
    },
    [mutations.BID_WITHDRAWN_SUCCESSFUL](state, {auction, account}) {
      state.withdrawingBidState = {
        ...state.withdrawingBidState,
        [auction.edition]: {
          ...auction,
          account,
          transaction: state.withdrawingBidState[auction.edition].transaction,
          state: 'BID_WITHDRAWN_SUCCESSFUL'
        }
      };
    },
    [mutations.BID_WITHDRAWN_TRIGGERED](state, {auction, account}) {
      state.withdrawingBidState = {
        ...state.withdrawingBidState,
        [auction.edition]: {
          ...auction,
          account,
          state: 'BID_WITHDRAWN_TRIGGERED'
        }
      };
    },
  },
  actions: {
    [actions.GET_AUCTION_OWNER]: async function ({commit, state, getters, rootState}) {
      const contract = await rootState.ArtistAcceptingBids.deployed();
      const owner = await contract.owner();
      commit(mutations.SET_AUCTION_OWNER, {owner, address: contract.address});
    },
    [actions.GET_AUCTION_DETAILS]: async function ({commit, state, getters, rootState}, edition) {
      const contract = await rootState.ArtistAcceptingBids.deployed();

      const result = transformAuctionDetails(await contract.auctionDetails(edition), edition);
      commit(mutations.SET_AUCTION_DETAILS, {
        ...state.auction,
        [edition]: result
      });

      const minBidAmount = await contract.minBidAmount();
      commit(mutations.SET_MINIMUM_BID, minBidAmount);
    },
    [actions.GET_AUCTION_DETAILS_FOR_EDITION_NUMBERS]: async function ({commit, state, getters, rootState}, {editions}) {
      const contract = await rootState.ArtistAcceptingBids.deployed();

      const allData = await Promise.all(_.map(editions, async (edition) => {
        const data = await contract.auctionDetails(edition);
        return transformAuctionDetails(data, edition);
      }));

      const editionData = _.reduce(allData, (result, data) => {
        result[data.edition] = data;
        return result;
      }, {});

      commit(mutations.SET_AUCTION_DETAILS, editionData);
    },
    [actions.PLACE_BID]: async function ({commit, dispatch, state, getters, rootState}, {edition, value}) {
      commit(mutations.RESET_BID_STATE, {edition});

      const account = rootState.account;

      const contract = await rootState.ArtistAcceptingBids.deployed();

      commit(mutations.AUCTION_TRIGGERED, {edition, account});

      const timer = setInterval(function () {
        dispatch(actions.GET_AUCTION_DETAILS, edition);
      }, 2000);

      const weiValue = Web3.utils.toWei(value, 'ether');

      const bidIncrease = contract.placeBid(edition, {from: account, value: weiValue});

      const blockNumber = await rootState.web3.eth.getBlockNumber();
      let bidIncreasedEvent = contract.BidPlaced({_bidder: account, _editionNumber: edition}, {
        fromBlock: blockNumber,
        toBlock: 'latest' // wait until event comes through
      });

      bidIncreasedEvent.watch(function (error, event) {
        if (!error) {
          console.log('Auction - place bid - successful', event);
          dispatch(actions.GET_AUCTION_DETAILS, edition);
          commit(mutations.AUCTION_PLACED_SUCCESSFUL, {edition, account});
        } else {
          console.log('Failure', error);
          commit(mutations.AUCTION_FAILED, {edition, account});
          dispatch(actions.GET_AUCTION_DETAILS, edition);
          bidIncreasedEvent.stopWatching();
        }
        if (timer) clearInterval(timer);
      });

      bidIncrease
        .then((data) => {
          console.log('Auction - place bid - transaction submitted', data);
          commit(mutations.AUCTION_STARTED, {edition, account, transaction: data.tx});
        })
        .catch((error) => {
          console.log('Auction - place bid - rejection/error', error);
          dispatch(actions.GET_AUCTION_DETAILS, edition);
          commit(mutations.AUCTION_FAILED, {edition, account});
          if (timer) clearInterval(timer);
        });

    },
    [actions.INCREASE_BID]: async function ({commit, dispatch, state, getters, rootState}, {edition, value}) {
      commit(mutations.RESET_BID_STATE, {edition});

      const account = rootState.account;

      const contract = await rootState.ArtistAcceptingBids.deployed();

      commit(mutations.AUCTION_TRIGGERED, {edition, account});

      const weiValue = Web3.utils.toWei(value, 'ether');
      const bidIncrease = contract.increaseBid(edition, {
        from: account,
        value: weiValue
      });

      const blockNumber = await rootState.web3.eth.getBlockNumber();
      let bidIncreasedEvent = contract.BidIncreased({_bidder: account, _editionNumber: edition}, {
        fromBlock: blockNumber,
        toBlock: 'latest' // wait until event comes through
      });

      const timer = setInterval(function () {
        dispatch(actions.GET_AUCTION_DETAILS, edition);
      }, 2000);

      bidIncreasedEvent.watch(function (error, event) {
        if (!error) {
          console.log('Auction - increase bid - successful', event);
          dispatch(actions.GET_AUCTION_DETAILS, edition);
          commit(mutations.AUCTION_PLACED_SUCCESSFUL, {edition, account});
        } else {
          console.log('Failure', error);
          commit(mutations.AUCTION_FAILED, {edition, account});
          dispatch(actions.GET_AUCTION_DETAILS, edition);
          bidIncreasedEvent.stopWatching();
        }
        if (timer) clearInterval(timer);
      });

      bidIncrease
        .then((data) => {
          console.log('Auction - increase bid - transaction submitted', data);
          commit(mutations.AUCTION_STARTED, {edition, account, transaction: data.tx});
        })
        .catch((error) => {
          console.log('Auction - increase bid - rejection/error', error);
          commit(mutations.AUCTION_FAILED, {edition, account});
          dispatch(actions.GET_AUCTION_DETAILS, edition);
          if (timer) clearInterval(timer);
        });
    },
    [actions.ACCEPT_BID]: async function ({commit, dispatch, state, getters, rootState}, auction) {
      commit(mutations.RESET_BID_ACCEPTED_STATE, {auction});

      const account = rootState.account;
      const contract = await rootState.ArtistAcceptingBids.deployed();

      const blockNumber = await rootState.web3.eth.getBlockNumber();
      let bidAcceptedEvent = contract.BidAccepted({_bidder: auction.highestBidder, _editionNumber: auction.edition}, {
        fromBlock: blockNumber,
        toBlock: 'latest' // wait until event comes through
      });

      commit(mutations.BID_ACCEPTED_TRIGGERED, {auction, account});

      const timer = setInterval(function () {
        dispatch(actions.GET_AUCTION_DETAILS, auction.edition);
      }, 2000);

      const acceptBid = contract.acceptBid(auction.edition, {from: account});

      bidAcceptedEvent.watch(function (error, event) {
        if (!error) {
          console.log('Auction - accepted bid - successful', event);
          dispatch(actions.GET_AUCTION_DETAILS, auction.edition);
          commit(mutations.BID_ACCEPTED_SUCCESSFUL, {auction, account});
        } else {
          console.log('Failure', error);
          commit(mutations.BID_ACCEPTED_FAILED, {auction, account});
          dispatch(actions.GET_AUCTION_DETAILS, auction.edition);
          bidAcceptedEvent.stopWatching();
        }
        if (timer) clearInterval(timer);
      });

      acceptBid
        .then((data) => {
          console.log('Auction - accepted bid - transaction submitted', data);
          commit(mutations.BID_ACCEPTED_STARTED, {auction, account, transaction: data.tx});
        })
        .catch((error) => {
          console.log('Auction - accepted bid - rejection/error', error);
          commit(mutations.BID_ACCEPTED_FAILED, {auction, account});
          dispatch(actions.GET_AUCTION_DETAILS, auction.edition);
          if (timer) clearInterval(timer);
        });
    },
    [actions.WITHDRAW_BID]: async function ({commit, dispatch, state, getters, rootState}, auction) {
      commit(mutations.RESET_BID_WITHDRAWN_STATE, {auction});

      const account = rootState.account;
      const contract = await rootState.ArtistAcceptingBids.deployed();

      const blockNumber = await rootState.web3.eth.getBlockNumber();
      let bidWithdrawnEvent = contract.BidWithdrawn({
        _bidder: auction.highestBidder,
        _editionNumber: auction.edition
      }, {
        fromBlock: blockNumber,
        toBlock: 'latest' // wait until event comes through
      });

      const timer = setInterval(function () {
        dispatch(actions.GET_AUCTION_DETAILS, auction.edition);
      }, 2000);

      commit(mutations.BID_WITHDRAWN_TRIGGERED, {auction, account});

      const withdrawBid = contract.withdrawBid(auction.edition, {from: account});

      bidWithdrawnEvent.watch(function (error, event) {
        if (!error) {
          console.log('Auction - withdraw bid - successful', event);
          dispatch(actions.GET_AUCTION_DETAILS, auction.edition);
          commit(mutations.BID_WITHDRAWN_SUCCESSFUL, {auction, account});
        } else {
          console.log('Failure', error);
          commit(mutations.BID_WITHDRAWN_FAILED, {auction, account});
          dispatch(actions.GET_AUCTION_DETAILS, auction.edition);
          bidWithdrawnEvent.stopWatching();
        }
        if (timer) clearInterval(timer);
      });

      withdrawBid
        .then((data) => {
          console.log('Auction - withdraw bid - transaction submitted', data);
          commit(mutations.BID_WITHDRAWN_STARTED, {auction, account, transaction: data.tx});
        })
        .catch((error) => {
          console.log('Auction - withdraw bid - rejection/error', error);
          dispatch(actions.GET_AUCTION_DETAILS, auction.edition);
          commit(mutations.BID_WITHDRAWN_FAILED, {auction, account});
          if (timer) clearInterval(timer);
        });
    },
    [actions.GET_AUCTION_EVENTS_FOR_EDITION]: async function ({commit, dispatch, state, getters, rootState}, edition) {
      commit(mutations.RESET_EDITION_AUCTION_EVENTS, {edition});

      const contract = await rootState.ArtistAcceptingBids.deployed();
      const config = {fromBlock: 0, toBlock: 'latest'};
      const filter = {_editionNumber: edition};

      [
        contract.BidPlaced(filter, config),
        contract.BidIncreased(filter, config),
        // contract.BidWithdrawn(filter, config),
        contract.BidAccepted(filter, config),
        // contract.BidderRefunded(filter, config),
        contract.AuctionCancelled(filter, config)
      ].map((event) => {
        event.get((error, results) => {
          if (!error) {
            commit(mutations.SET_AUCTION_EVENTS, {results, edition});
          }
        });
      });

    }
  }
};

const transformAuctionDetails = (value, edition) => {
  return {
    edition: edition.toString("10"),
    enabled: value[0],
    highestBidder: value[1],
    highestBid: Web3.utils.fromWei(value[2].toString("10"), 'ether'),
    highestBidWei: value[2],
    controller: Web3.utils.toChecksumAddress(value[3]),
  };
};


export default auctionStateModule;
