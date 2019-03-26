import * as actions from '../actions';
import * as mutations from '../mutation';
import _ from 'lodash';

const selfServiceStateModule = {
  namespaced: true,
  state: {
    owner: null,
    paused: null,
    contractAddress: null,
    artistCommission: null,
    mintingState: {}
  },
  getters: {
    selfServiceState: (state) => (account) => {
      return _.get(state.mintingState, account);
    },
    getSelfServiceTransactionForAccount: (state, getters) => (account) => {
      return (getters.selfServiceState(account) || {}).transactionHash;
    },
    isSelfServiceTriggered: (state, getters) => (account) => {
      return _.get(getters.selfServiceState(account), 'state') === mutations.SELF_SERVICE_TRIGGERED;
    },
    isSelfServiceStarted: (state, getters) => (account) => {
      return _.get(getters.selfServiceState(account), 'state') === mutations.SELF_SERVICE_STARTED;
    },
    isSelfServiceSuccessful: (state, getters) => (account) => {
      return _.get(getters.selfServiceState(account), 'state') === mutations.SELF_SERVICE_SUCCESSFUL;
    },
    isSelfServiceFailed: (state, getters) => (account) => {
      return _.get(getters.selfServiceState(account), 'state') === mutations.SELF_SERVICE_FAILED;
    },
  },
  mutations: {
    [mutations.SET_SELF_SERVICE_CONTROLS](state, {paused, owner, address, artistCommission, maxEditionSize}) {
      state.paused = paused;
      state.owner = state;
      state.address = address;
      state.artistCommission = artistCommission;
      state.maxEditionSize = maxEditionSize;
    },
    [mutations.SELF_SERVICE_TRIGGERED](state, {account}) {
      state.mintingState = {
        ...state.mintingState,
        [account]: {
          ...state.mintingState[account],
          state: 'SELF_SERVICE_TRIGGERED'
        }
      };
    },
    [mutations.SELF_SERVICE_STARTED](state, {account, transactionHash}) {
      state.mintingState = {
        ...state.mintingState,
        [account]: {
          ...state.mintingState[account],
          account,
          transactionHash,
          state: 'SELF_SERVICE_STARTED'
        }
      };
    },
    [mutations.SELF_SERVICE_SUCCESSFUL](state, {account, transactionHash, receipt}) {
      state.mintingState = {
        ...state.mintingState,
        [account]: {
          ...state.mintingState[account],
          transactionHash,
          receipt,
          state: 'SELF_SERVICE_SUCCESSFUL'
        }
      };
    },
    [mutations.SELF_SERVICE_FAILED](state, {account, transactionHash, error}) {
      state.mintingState = {
        ...state.mintingState,
        [account]: {
          ...state.mintingState[account],
          error,
          transactionHash,
          state: 'SELF_SERVICE_FAILED'
        }
      };
    },
    [mutations.SELF_SERVICE_RESET](state, account) {
      delete state.mintingState[account];
      state.mintingState = {...state.mintingState};
    },
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
    async [actions.GET_SELF_SERVICE_ENABLED_FOR_ACCOUNT]({commit, dispatch, state, getters, rootState}, {artistAccount}) {
      const contract = await rootState.SelfServiceEditionCuration.deployed();
      const canCreateAnotherEdition = await contract.canCreateAnotherEdition(artistAccount);
      return {
        canCreateAnotherEdition
      };
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

      let txsHash = null;

      createEdition()
        .on('transactionHash', hash => {
          console.log('transactionHash', hash);
          txsHash = hash;
          const details = {
            transactionHash: hash,
            account,
          };
          commit(mutations.SELF_SERVICE_STARTED, details);
          rootState.notificationService.showSelfServiceEditionCreated({
            type: mutations.SELF_SERVICE_STARTED,
            ...details
          });
        })
        .on('receipt', receipt => {
          console.log('receipt', receipt);
          txsHash = receipt.transactionHash;
          const details = {
            transactionHash: receipt.transactionHash,
            account,
            receipt
          };
          commit(mutations.SELF_SERVICE_SUCCESSFUL, details);
          rootState.notificationService.showSelfServiceEditionCreated({
            type: mutations.SELF_SERVICE_SUCCESSFUL,
            ...details
          });
        })
        .on('error', error => {
          console.log('error', error);
          if (txsHash) {
            const details = {
              transactionHash: txsHash,
              account,
              error
            };
            commit(mutations.SELF_SERVICE_FAILED, details);
            rootState.notificationService.showSelfServiceEditionCreated({
              type: mutations.SELF_SERVICE_FAILED,
              ...details
            });
          }
        })
        .catch((error) => {
          console.log('catch', error);
          if (txsHash) {
            const details = {
              transactionHash: txsHash,
              account,
              error
            };
            commit(mutations.SELF_SERVICE_FAILED, details);
            rootState.notificationService.showSelfServiceEditionCreated({
              type: mutations.SELF_SERVICE_FAILED,
              ...details
            });
          }
        })
        .finally(() => {
          // Do something else
        });
    },

  }
};

export default selfServiceStateModule;
