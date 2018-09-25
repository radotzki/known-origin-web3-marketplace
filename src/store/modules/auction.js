import * as actions from '../actions';
import * as mutations from '../mutation';
import _ from 'lodash';
import Web3 from "web3";

const auctionStateModule = {
  namespaced: true,
  state: {
    auction: {},
    minBidAmount: 0,
    minBidAmountWei: 0,
  },
  getters: {
    isEditionAuctionEnabled: (state, getters) => (edition) => {
      return _.get(state.auction[edition], 'enabled') === true;
    },
    editionMinimumBid: (state, getters) => (edition) => {
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
  },
  mutations: {
    [mutations.SET_AUCTION_DETAILS](state, data) {
      state.auction = {
        ...state.highResDownload,
        ...data
      };
    },
    [mutations.SET_MINIMUM_BID](state, minBidAmount) {
      state.minBidAmount = Web3.utils.fromWei(minBidAmount.toString("10"), 'ether');
      state.minBidAmountWei = minBidAmount;
    },
  },
  actions: {
    [actions.GET_AUCTION_DETAILS]: async function ({commit, state, getters, rootState}, edition) {
      const transform = (value) => {
        return {
          enabled: value[0],
          highestBidder: value[1],
          highestBid: Web3.utils.fromWei(value[2].toString("10"), 'ether'),
          highestBidWei: value[2],
        };
      };

      const contract = await rootState.ArtistAcceptingBids.deployed();

      const result = transform(await contract.auctionDetails(edition.edition));
      commit(mutations.SET_AUCTION_DETAILS, {
        [edition.edition]: result
      });

      const minBidAmount = await contract.minBidAmount();
      commit(mutations.SET_MINIMUM_BID, minBidAmount);
    },
    [actions.PLACE_BID]: async function ({commit, state, getters, rootState}, {edition, value}) {
      console.log(edition, value);

      const contract = await rootState.ArtistAcceptingBids.deployed();

      try {
        // TODO handle tracking
        await contract.placeBid(edition, {
          from: rootState.account,
          value: Web3.utils.toWei(value, 'ether')
        });
      } catch (err) {
        console.log(err);
        // assert(err.reason === 'not authorized');
        // assert(err.message.includes('not authorized');
      }
    },
    [actions.INCREASE_BID]: async function ({commit, state, getters, rootState}, {edition, value}) {
      console.log(edition, value);

      const contract = await rootState.ArtistAcceptingBids.deployed();

      try {
        // TODO handle tracking
        await contract.increaseBid(edition, {
          from: rootState.account,
          value: Web3.utils.toWei(value, 'ether')
        });
      } catch (err) {
        console.log(err);
        // assert(err.reason === 'not authorized');
        // assert(err.message.includes('not authorized');
      }
    }
  }
};

export default auctionStateModule;
