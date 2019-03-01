import * as actions from '../actions';
import * as mutations from '../mutation';
import _ from 'lodash';
import Web3 from "web3";

const selfServiceStateModule = {
  namespaced: true,
  state: {
    owner: null,
    paused: null,
    contractAddress: null,
    artistCommission: null,
    mintingState: {}
  },
  getters: {},
  mutations: {
    [mutations.SET_SELF_SERVICE_CONTROLS](state, {paused, owner, address, artistCommission, maxEditionSize}) {
      state.paused = paused;
      state.owner = state;
      state.address = address;
      state.artistCommission = artistCommission;
      state.maxEditionSize = maxEditionSize;
    }
  },
  actions: {
    async [actions.GET_SELF_SERVICE_CONTRACT_DETAILS]({commit, state, getters, rootState}) {
      const contract = await rootState.SelfServiceEditionCuration.deployed();

      const paused = await contract.paused();
      const owner = await contract.owner();
      const artistCommission = await contract.artistCommission();
      const maxEditionSize = await contract.maxEditionSize();
      const address = contract.address;

      commit(mutations.SET_SELF_SERVICE_CONTROLS, {paused, owner, address, artistCommission, maxEditionSize});
    },
    async [actions.GET_SELF_SERVICE_ENABLED_FOR_ACCOUNT]({commit, dispatch, state, getters, rootState}) {
      const contract = await rootState.SelfServiceEditionCuration.deployed();
      return contract.isEnabledForAccount(rootState.account);
    },

    async [actions.CREATE_SELF_SERVICE_EDITION]({commit, dispatch, state, getters, rootState}, data) {
      const account = rootState.account;

      console.log(data);

      const {totalAvailable, tokenUri, priceInWei, enableAuctions, artist} = data;

      const contract = await rootState.SelfServiceEditionCuration.deployed();

      const createEdition = () => {
        const isCallingArtists = account === artist;
        console.log(`Is calling artist [${isCallingArtists}]`);
        // If the caller isnt the artist assume its KO making it for them
        return isCallingArtists
          ? contract.createEdition(totalAvailable, priceInWei, 0, tokenUri, enableAuctions, {from: account})
          : contract.createEditionFor(artist, totalAvailable, priceInWei, 0, tokenUri, enableAuctions, {from: account});
      };

      createEdition()
        .on('transactionHash', hash => {
          console.log('transactionHash', hash);
          commit(mutations.SELF_SERVICE_STARTED, {transaction: hash});
        })
        .on('receipt', receipt => {
          console.log('receipt', receipt);
          commit(mutations.SELF_SERVICE_SUCCESSFUL, {receipt});
          // TODO trigger refresh
        })
        .on('error', error => {
          console.log('error', error);
          commit(mutations.SELF_SERVICE_FAILED, {error});
        })
        .catch((error) => {
          console.log('catch', error);
          commit(mutations.SELF_SERVICE_FAILED, {error});
        })
        .finally(() => {
          // Do something else
        });
    },

  }
};

export default selfServiceStateModule;
