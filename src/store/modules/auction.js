import * as actions from '../actions';
import * as mutations from '../mutation';
import _ from 'lodash';
import Web3 from "web3";

const auctionStateModule = {
  namespaced: true,
  state: {
    owner: null,
    contractAddress: null,
    contractBalance: null,
    ethPlaced: null,
    ethAccepted: null,
    bidsAccepted: null,

    auction: {},
    bidState: {},
    acceptingBidState: {},
    withdrawingBidState: {},
    rejectingBidState: {},
    minBidAmount: 0,
    minBidAmountWei: 0,
  },
  getters: {
    isEditionAuctionEnabled: (state, getters) => (edition) => {
      return _.get(state.auction[edition], 'enabled') === true;
    },
    nextMinimumNewBid: (state, getters) => (edition) => {
      let currentEditionHighestBid = _.get(state.auction[edition], 'highestBidWei', 0);
      let minBid = _.get(state, 'minBidAmountWei');

      // Check not set
      if (currentEditionHighestBid.toString() === "0") {
        return 0.01;
      }

      // Handle BN
      if (Web3.utils.isBN(currentEditionHighestBid) && minBid) {
        return _.toNumber(Web3.utils.fromWei(currentEditionHighestBid.add(minBid).toString(10), 'ether'));
      }

      if (minBid) {
        // Fall back to min bid
        return _.toNumber(Web3.utils.fromWei(minBid.toString(10), 'ether'));
      }

      return 0;
    },
    accountIsHighestBidder: (state, getters, rootState) => (edition) => {
      if (!rootState.account) {
        return false;
      }
      let currentHighestBidder = _.get(state.auction[edition], 'highestBidder', 0);
      if (currentHighestBidder === 0) {
        return false;
      }
      return currentHighestBidder === rootState.account;
    },
    //////////////////////////
    // Make Offer Bid State //
    //////////////////////////
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
    ////////////////////////
    // Rejected Bid State //
    ////////////////////////
    editionRejectedBidState: (state) => (editionNumber) => {
      return _.get(state.rejectingBidState, editionNumber);
    },
    isRejectedBidTriggered: (state, getters) => (editionNumber) => {
      return _.get(getters.editionRejectedBidState(editionNumber), 'state') === mutations.BID_REJECTED_TRIGGERED;
    },
    isRejectedBidStarted: (state, getters) => (editionNumber) => {
      return _.get(getters.editionRejectedBidState(editionNumber), 'state') === mutations.BID_REJECTED_STARTED;
    },
    isRejectedBidSuccessful: (state, getters) => (editionNumber) => {
      return _.get(getters.editionRejectedBidState(editionNumber), 'state') === mutations.BID_REJECTED_SUCCESSFUL;
    },
    isRejectedBidFailed: (state, getters) => (editionNumber) => {
      return _.get(getters.editionRejectedBidState(editionNumber), 'state') === mutations.BID_REJECTED_FAILED;
    },
    getRejectedBidTransactionForEdition: (state, getters) => (editionNumber) => {
      return getters.editionRejectedBidState(editionNumber).transaction;
    },
  },
  mutations: {
    [mutations.SET_AUCTION_ADDRESS](state, {address}) {
      state.contractAddress = address;
    },
    [mutations.SET_AUCTION_STATS](state, {ethPlaced, contractBalance, ethAccepted, bidsAccepted}) {
      state.ethPlaced = ethPlaced;
      state.ethAccepted = ethAccepted;
      state.bidsAccepted = bidsAccepted;
      state.contractBalance = contractBalance;
    },
    [mutations.SET_AUCTION_OWNER](state, {owner, address}) {
      state.owner = owner;
      state.contractAddress = address;
    },
    [mutations.SET_AUCTION_DETAILS](state, data) {
      state.auction = {
        ...state.auction,
        ...data
      };
    },
    [mutations.SET_MINIMUM_BID](state, minBidAmount) {
      state.minBidAmount = Web3.utils.fromWei(minBidAmount.toString(10), 'ether');
      state.minBidAmountWei = minBidAmount;
    },
    //////////////////////////
    // Make Offer Bid State //
    //////////////////////////
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
    /////////////////////////
    // Accepting Bid State //
    /////////////////////////
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
    ///////////////////////////
    // Withdrawing Bid State //
    ///////////////////////////
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
    ////////////////////////
    // Rejected Bid State //
    ////////////////////////
    [mutations.RESET_BID_REJECTED_STATE](state, {auction}) {
      delete state.rejectingBidState[auction.edition];
      state.rejectingBidState = {...state.acceptingBidState};
    },
    [mutations.BID_REJECTED_FAILED](state, {auction, account}) {
      state.rejectingBidState = {
        ...state.rejectingBidState,
        [auction.edition]: {
          ...auction,
          account,
          transaction: state.rejectingBidState[auction.edition].transaction,
          state: 'BID_REJECTED_FAILED'
        }
      };
    },
    [mutations.BID_REJECTED_STARTED](state, {auction, account, transaction}) {
      state.rejectingBidState = {
        ...state.rejectingBidState,
        [auction.edition]: {
          ...auction,
          account,
          transaction,
          state: 'BID_REJECTED_STARTED'
        }
      };
    },
    [mutations.BID_REJECTED_SUCCESSFUL](state, {auction, account}) {
      state.rejectingBidState = {
        ...state.rejectingBidState,
        [auction.edition]: {
          ...auction,
          account,
          transaction: state.rejectingBidState[auction.edition].transaction,
          state: 'BID_REJECTED_SUCCESSFUL'
        }
      };
    },
    [mutations.BID_REJECTED_TRIGGERED](state, {auction, account}) {
      state.rejectingBidState = {
        ...state.rejectingBidState,
        [auction.edition]: {
          ...auction,
          account,
          state: 'BID_REJECTED_TRIGGERED'
        }
      };
    },
  },
  actions: {
    async [actions.REFRESH_OPEN_OFFERS]() {
      // Dumb action which doesnt do anything, used to listen for change in open offers page
    },
    async [actions.GET_AUCTION_OWNER]({commit, state, getters, rootState}) {
      const contract = await rootState.ArtistAcceptingBids.deployed();
      const owner = await contract.owner();
      commit(mutations.SET_AUCTION_OWNER, {owner, address: contract.address});
    },
    async [actions.GET_AUCTION_MIN_BID]({commit, state, getters, rootState}) {
      if (rootState.ArtistAcceptingBids) {
        const contract = await rootState.ArtistAcceptingBids.deployed();
        const minBidAmount = await contract.minBidAmount();
        commit(mutations.SET_MINIMUM_BID, minBidAmount);
      }
    },
    async [actions.GET_AUCTION_DETAILS]({commit, dispatch, state, getters, rootState}, edition) {
      const results = await rootState.auctionsService.getAuctionsForEdition(edition);
      if (results.success) {
        const {data} = results;
        commit(mutations.SET_AUCTION_DETAILS, {
          [edition]: data
        });
      }
      dispatch(actions.GET_AUCTION_MIN_BID);
    },
    async [actions.GET_AUCTION_DETAILS_FOR_ARTIST]({commit, state, getters, rootState}, {artistAccount}) {
      const results = await rootState.auctionsService.getAuctionsForArtist(artistAccount);
      if (results.success) {
        const {data} = results;
        const editionData = _.reduce(data, (result, data) => {
          result[data.edition] = data;
          return result;
        }, {});
        commit(mutations.SET_AUCTION_DETAILS, editionData);
      }
    },
    async [actions.PLACE_BID]({commit, dispatch, state, getters, rootState}, {edition, value}) {
      commit(mutations.RESET_BID_STATE, {edition});

      const account = rootState.account;

      const contract = await rootState.ArtistAcceptingBids.deployed();

      commit(mutations.AUCTION_TRIGGERED, {edition, account});

      const timer = setInterval(function () {
        dispatch(actions.GET_AUCTION_DETAILS, edition);
      }, 2000);

      const weiValue = Web3.utils.toWei(value, 'ether');

      contract
        .placeBid(edition, {
          from: account,
          value: weiValue
        })
        .on('transactionHash', hash => {
          console.log('Auction - place bid - transaction submitted', hash);
          commit(mutations.AUCTION_STARTED, {edition, account, transaction: hash});
        })
        .on('receipt', receipt => {
          console.log('Auction - place bid - successful', receipt);
          dispatch(actions.GET_AUCTION_DETAILS, edition);
          commit(mutations.AUCTION_PLACED_SUCCESSFUL, {edition, account});
        })
        .on('error', error => {
          console.log('Auction - place bid - rejection/error', error);
          commit(mutations.AUCTION_FAILED, {edition, account});
          dispatch(actions.GET_AUCTION_DETAILS, edition);
        })
        .catch((error) => {
          console.log('Auction - place bid - rejection/error', error);
          commit(mutations.AUCTION_FAILED, {edition, account});
          dispatch(actions.GET_AUCTION_DETAILS, edition);
        })
        .finally(() => {
          if (timer) clearInterval(timer);
          dispatch(actions.REFRESH_OPEN_OFFERS);
          dispatch(`kodaV2/${actions.REFRESH_AND_LOAD_INDIVIDUAL_EDITION}`, {editionNumber: edition}, {root: true});
        });
    },
    async [actions.INCREASE_BID]({commit, dispatch, state, getters, rootState}, {edition, value}) {
      commit(mutations.RESET_BID_STATE, {edition});

      const account = rootState.account;
      const contract = await rootState.ArtistAcceptingBids.deployed();

      commit(mutations.AUCTION_TRIGGERED, {edition, account});

      const timer = setInterval(function () {
        dispatch(actions.GET_AUCTION_DETAILS, edition);
      }, 2000);

      const weiValue = Web3.utils.toWei(value, 'ether');

      contract
        .increaseBid(edition, {
          from: account,
          value: weiValue
        })
        .on('transactionHash', hash => {
          console.log('Auction - increase bid - transaction submitted', hash);
          commit(mutations.AUCTION_STARTED, {edition, account, transaction: hash});
        })
        .on('receipt', receipt => {
          console.log('Auction - increase bid - receipt', receipt);
          dispatch(actions.GET_AUCTION_DETAILS, edition);
          commit(mutations.AUCTION_PLACED_SUCCESSFUL, {edition, account});
        })
        .on('error', error => {
          console.log('Auction - increase bid - rejection/error', error);
          commit(mutations.AUCTION_FAILED, {edition, account});
          dispatch(actions.GET_AUCTION_DETAILS, edition);
        })
        .catch((error) => {
          console.log('Auction - increase bid - rejection/error', error);
          commit(mutations.AUCTION_FAILED, {edition, account});
          dispatch(actions.GET_AUCTION_DETAILS, edition);
        })
        .finally(() => {
          if (timer) clearInterval(timer);
          dispatch(actions.REFRESH_OPEN_OFFERS);
          dispatch(`kodaV2/${actions.REFRESH_AND_LOAD_INDIVIDUAL_EDITION}`, {editionNumber: edition}, {root: true});
        });
    },
    async [actions.ACCEPT_BID]({commit, dispatch, state, getters, rootState}, auction) {
      commit(mutations.RESET_BID_ACCEPTED_STATE, {auction});

      const account = rootState.account;
      const contract = await rootState.ArtistAcceptingBids.deployed();

      commit(mutations.BID_ACCEPTED_TRIGGERED, {auction, account});

      const timer = setInterval(function () {
        dispatch(actions.GET_AUCTION_DETAILS, auction.edition);
      }, 2000);

      contract
        .acceptBid(auction.edition, {
          from: account
        })
        .on('transactionHash', hash => {
          console.log('Auction - accepted bid - transaction submitted', hash);
          commit(mutations.BID_ACCEPTED_STARTED, {auction, account, transaction: hash});
        })
        .on('receipt', receipt => {
          console.log('Auction - accepted bid - receipt', receipt);
          dispatch(actions.GET_AUCTION_DETAILS, auction.edition);
          commit(mutations.BID_ACCEPTED_SUCCESSFUL, {auction, account});
        })
        .on('error', error => {
          console.log('Auction - accepted bid - rejection/error', error);
          commit(mutations.BID_ACCEPTED_FAILED, {auction, account});
          dispatch(actions.GET_AUCTION_DETAILS, auction.edition);
        })
        .catch((error) => {
          console.log('Auction - accepted bid - rejection/error', error);
          commit(mutations.BID_ACCEPTED_FAILED, {auction, account});
          dispatch(actions.GET_AUCTION_DETAILS, auction.edition);
        })
        .finally(() => {
          if (timer) clearInterval(timer);
          dispatch(actions.REFRESH_OPEN_OFFERS);
          dispatch(`kodaV2/${actions.REFRESH_AND_LOAD_INDIVIDUAL_EDITION}`, {editionNumber: auction.edition}, {root: true});
        });
    },
    async [actions.WITHDRAW_BID]({commit, dispatch, state, getters, rootState}, auction) {
      commit(mutations.RESET_BID_WITHDRAWN_STATE, {auction});

      const account = rootState.account;

      const contract = await rootState.ArtistAcceptingBids.deployed();

      commit(mutations.BID_WITHDRAWN_TRIGGERED, {auction, account});

      const timer = setInterval(function () {
        dispatch(actions.GET_AUCTION_DETAILS, auction.edition);
      }, 2000);

      contract
        .withdrawBid(auction.edition, {
          from: account
        })
        .on('transactionHash', hash => {
          console.log('Auction - withdraw bid - transaction submitted', hash);
          commit(mutations.BID_WITHDRAWN_STARTED, {auction, account, transaction: hash});
        })
        .on('receipt', receipt => {
          console.log('Auction - withdraw bid - receipt', receipt);
          dispatch(actions.GET_AUCTION_DETAILS, auction.edition);
          commit(mutations.BID_WITHDRAWN_SUCCESSFUL, {auction, account});
        })
        .on('error', error => {
          console.log('Auction - withdraw bid - rejection/error', error);
          dispatch(actions.GET_AUCTION_DETAILS, auction.edition);
          commit(mutations.BID_WITHDRAWN_FAILED, {auction, account});
        })
        .catch((error) => {
          console.log('Auction - withdraw bid - rejection/error', error);
          dispatch(actions.GET_AUCTION_DETAILS, auction.edition);
          commit(mutations.BID_WITHDRAWN_FAILED, {auction, account});
        })
        .finally(() => {
          if (timer) clearInterval(timer);
          dispatch(actions.REFRESH_OPEN_OFFERS);
          dispatch(`kodaV2/${actions.REFRESH_AND_LOAD_INDIVIDUAL_EDITION}`, {editionNumber: auction.edition}, {root: true});
        });
    },
    async [actions.REJECT_BID]({commit, dispatch, state, getters, rootState}, auction) {
      commit(mutations.RESET_BID_REJECTED_STATE, {auction});

      const account = rootState.account;

      const contract = await rootState.ArtistAcceptingBids.deployed();

      commit(mutations.BID_REJECTED_TRIGGERED, {auction, account});

      const timer = setInterval(function () {
        dispatch(actions.GET_AUCTION_DETAILS, auction.edition);
      }, 2000);

      contract
        .rejectBid(auction.edition, {
          from: account
        })
        .on('transactionHash', hash => {
          console.log('Auction - reject bid - transaction submitted', hash);
          commit(mutations.BID_REJECTED_STARTED, {auction, account, transaction: hash});
        })
        .on('receipt', receipt => {
          console.log('Auction - reject bid - receipt', receipt);
          dispatch(actions.GET_AUCTION_DETAILS, auction.edition);
          commit(mutations.BID_REJECTED_SUCCESSFUL, {auction, account});
        })
        .on('error', error => {
          console.log('Auction - reject bid - rejection/error', error);
          dispatch(actions.GET_AUCTION_DETAILS, auction.edition);
          commit(mutations.BID_REJECTED_FAILED, {auction, account});
        })
        .catch((error) => {
          console.log('Auction - reject bid - rejection/error', error);
          dispatch(actions.GET_AUCTION_DETAILS, auction.edition);
          commit(mutations.BID_REJECTED_FAILED, {auction, account});
        })
        .finally(() => {
          if (timer) clearInterval(timer);
          dispatch(actions.REFRESH_OPEN_OFFERS);
          dispatch(`kodaV2/${actions.REFRESH_AND_LOAD_INDIVIDUAL_EDITION}`, {editionNumber: auction.edition}, {root: true});
        });
    },
    async [actions.CANCEL_AUCTION]({commit, dispatch, state, getters, rootState}, auction) {
      let contract = await rootState.ArtistAcceptingBids.deployed();
      const account = rootState.account;
      return contract.cancelAuction(auction.edition, {from: account});
    },
  }
};

export default auctionStateModule;
