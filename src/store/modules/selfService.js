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
      const {totalAvailable, tokenUri, priceInWei, enableAuctions} = data;
      console.log(data);

      const contract = await rootState.SelfServiceEditionCuration.deployed();
      contract
        .createEdition(totalAvailable, tokenUri, priceInWei, enableAuctions, {
          from: account
        })
        .on('transactionHash', hash => {
          commit(mutations.SELF_SERVICE_STARTED, {transaction: hash});
        })
        .on('receipt', receipt => {
          commit(mutations.SELF_SERVICE_SUCCESSFUL, {receipt});
          // TODO trigger refresh
        })
        .on('error', error => {
          commit(mutations.SELF_SERVICE_FAILED, {error});
        })
        .catch((error) => {
          commit(mutations.SELF_SERVICE_FAILED, {error});
        })
        .finally(() => {
          // Do something else
        });
    },

  }
};

export default selfServiceStateModule;
