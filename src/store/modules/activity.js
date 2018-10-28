import Vue from 'vue';
import * as actions from '../actions';
import * as mutations from '../mutation';

const activityStateModule = {
  namespaced: true,
  state: {
    activity: []
  },
  getters: {},
  mutations: {
    [mutations.SET_ACTIVITY](state, events) {
      state.activityStarted = true;
      Vue.set(state, 'activity', state.activity.concat(events));
    },
    [mutations.CLEAR_ACTIVITY](state) {
      Vue.set(state, 'activity', []);
    }
  },
  actions: {
    async [actions.ACTIVITY]({commit, dispatch, state, rootState}) {
      commit(mutations.CLEAR_ACTIVITY);

      const contract = await rootState.KnownOriginDigitalAssetV2.deployed();
      const auction = await rootState.ArtistAcceptingBids.deployed();

      const kodaFilter = {
        fromBlock: rootState.currentNetwork === 'Main' ? rootState.KnownOriginDigitalAssetV2MainBlockNumber : 0,
        toBlock: 'latest' // wait until event comes through
      };

      const auctionFilter = {
        fromBlock: rootState.currentNetwork === 'Main' ? rootState.ArtistAcceptingBidsMainBlockNumber : 0,
        toBlock: 'latest' // wait until event comes through
      };

      contract
        .Minted({}, kodaFilter)
        .get(function (error, events) {
          if (!error) {
            commit(mutations.SET_ACTIVITY, events);
          } else {
            console.log('Failure', error);
            ev.stopWatching();
          }
        });

      [
        auction.BidPlaced({}, auctionFilter),
        auction.BidIncreased({}, auctionFilter),
        auction.BidAccepted({}, auctionFilter),
        // auction.AuctionCancelled({}, kodaFilter)
      ].map((event) => {
        event.get((error, events) => {
          if (!error) {
            commit(mutations.SET_ACTIVITY, events);
          }
        });
      });

      contract
        .EditionCreated({}, kodaFilter)
        .get(function (error, events) {
          if (!error) {
            commit(mutations.SET_ACTIVITY, events);
            const editionNumbers = _.map(events, (e) => parseInt(e.args._editionNumber.toString()));
            dispatch(`kodaV2/${actions.LOAD_EDITIONS}`, editionNumbers, {root: true});
          } else {
            console.log('Failure', error);
            ev.stopWatching();
          }
        });

    },
  }
};

export default activityStateModule;
