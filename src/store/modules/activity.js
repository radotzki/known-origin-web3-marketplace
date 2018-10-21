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
    }
  },
  actions: {
    async [actions.ACTIVITY]({commit, dispatch, state, rootState}) {

      const contract = await rootState.KnownOriginDigitalAssetV2.deployed();

      const filter = {
        fromBlock: rootState.currentNetwork === 'Main' ? rootState.KnownOriginDigitalAssetV2MainBlockNumber : 0,
        toBlock: 'latest' // wait until event comes through
      };

      [
        contract.Minted({}, filter),
        contract.EditionCreated({}, filter)
      ].map((ev) => {
        ev.get(function (error, events) {
          if (!error) {
            commit(mutations.SET_ACTIVITY, events);

            const editionNumbers = _.map(events, (e) => parseInt(e.args._editionNumber.toString()));
            dispatch(`kodaV2/${actions.LOAD_EDITIONS}`, editionNumbers, {root: true});
          } else {
            console.log('Failure', error);
            ev.stopWatching();
          }
        });
      });
    },
  }
};

export default activityStateModule;
