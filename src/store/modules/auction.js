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
        ...data
      };
    },
    [mutations.SET_MINIMUM_BID](state, minBidAmount) {
      state.minBidAmount = Web3.utils.fromWei(minBidAmount.toString(10), 'ether');
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
    async [actions.GET_AUCTION_OWNER]({commit, state, getters, rootState}) {
      const contract = await rootState.ArtistAcceptingBids.deployed();
      const owner = await contract.owner();
      commit(mutations.SET_AUCTION_OWNER, {owner, address: contract.address});
    },
    async [actions.GET_AUCTION_DETAILS]({commit, state, getters, rootState}, edition) {
      const contract = await rootState.ArtistAcceptingBids.deployed();

      const result = transformAuctionDetails(await contract.auctionDetails(edition), edition);
      commit(mutations.SET_AUCTION_DETAILS, {
        ...state.auction,
        [edition]: result
      });

      const minBidAmount = await contract.minBidAmount();
      commit(mutations.SET_MINIMUM_BID, minBidAmount);
    },
    async [actions.GET_AUCTION_DETAILS_FOR_EDITION_NUMBERS]({commit, state, getters, rootState}, {editions}) {
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
          console.log('Auction - increase bid - successful', receipt);
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
          console.log('Auction - accepted bid - successful', receipt);
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
          console.log('Auction - withdraw bid - successful', receipt);
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
          dispatch(`kodaV2/${actions.REFRESH_AND_LOAD_INDIVIDUAL_EDITION}`, {editionNumber: auction.edition}, {root: true});
        });
    },
    async [actions.CANCEL_AUCTION]({commit, dispatch, state, getters, rootState}, auction) {
      let contract = await rootState.ArtistAcceptingBids.deployed();
      const account = rootState.account;
      return contract.cancelAuction(auction.edition, {from: account});
    },
    async [actions.REFRESH_CONTRACT_DETAILS]({commit, dispatch, state, rootState}) {
      let contract = await rootState.ArtistAcceptingBids.deployed();

      commit(mutations.SET_AUCTION_ADDRESS, {address: contract.address});

      rootState.eventService
        .loadAuctionStats()
        .then(async ({ethPlaced, ethAccepted, bidsAccepted}) => {
          commit(mutations.SET_AUCTION_STATS, {
            ethPlaced,
            ethAccepted,
            bidsAccepted,
            contractBalance: Web3.utils.fromWei(await rootState.web3.eth.getBalance(contract.address), 'ether').valueOf()
          });
        });

    },
  }
};

const transformAuctionDetails = (value, edition) => {
  return {
    edition: edition.toString(10),
    enabled: value[0],
    highestBidder: value[1],
    highestBid: Web3.utils.fromWei(value[2].toString(10), 'ether'),
    highestBidWei: value[2],
    controller: value[3],
  };
};


export default auctionStateModule;
