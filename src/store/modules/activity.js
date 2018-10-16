import Vue from 'vue';
import * as actions from '../actions';
import * as mutations from '../mutation';

const activityStateModule = {
  namespaced: true,
  state: {
    activity: [],
    activityStarted: false,
  },
  getters: {},
  mutations: {
    [mutations.SET_ACTIVITY] (state, events) {
      state.activityStarted = true;
      Vue.set(state, 'activity', events);
    }
  },
  actions: {
    [actions.ACTIVITY]: function ({commit, dispatch, state, rootState}) {
      if (!state.activityStarted) {
        rootState.KnownOriginDigitalAssetV2.deployed()
          .then((contract) => {

            let mintedEvent = contract.Minted({}, {
              fromBlock: rootState.currentNetwork === 'Main' ? rootState.KnownOriginDigitalAssetV2MainBlockNumber : 0,
              toBlock: 'latest' // wait until event comes through
            });

            mintedEvent.get(function (error, events) {
              if (!error) {
                commit(mutations.SET_ACTIVITY, events);
                
                const editionNumbers = _.map(events, (e) => parseInt(e.args._editionNumber.toString()));

                dispatch(`kodaV2/${actions.LOAD_EDITIONS}`, editionNumbers, {root: true});
              } else {
                console.log('Failure', error);
                mintedEvent.stopWatching();
              }
            });
          });
      }
    },
  }
};

export default activityStateModule;
