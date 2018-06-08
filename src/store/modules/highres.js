import * as actions from '../actions';
import * as mutations from '../mutation';
import _ from 'lodash';
import axios from 'axios';

const highResStateModule = {
  namespaced: true,
  state: {
    // Frontend state
    highResDownload: {},
  },
  getters: {
    isHighResDownloadTriggered: (state, getters) => (tokenId) => {
      return _.get(state.highResDownload[tokenId], 'state') === mutations.HIGH_RES_DOWNLOAD_TRIGGERED;
    },
    isHighResDownloadSuccess: (state, getters) => (tokenId) => {
      return _.get(state.highResDownload[tokenId], 'state') === mutations.HIGH_RES_DOWNLOAD_SUCCESS;
    },
    isHighResDownloadFailed: (state, getters) => (tokenId) => {
      return _.get(state.highResDownload[tokenId], 'state') === mutations.HIGH_RES_DOWNLOAD_FAILURE;
    },
    getHighResDownloadedLink: (state) => (tokenId) => {
      return _.get(state.highResDownload[tokenId], 'url');
    },
  },
  mutations: {
    [mutations.HIGH_RES_DOWNLOAD_SUCCESS](state, {tokenId, url, expires}) {
      state.highResDownload = {
        ...state.highResDownload, [tokenId]: {state: mutations.HIGH_RES_DOWNLOAD_SUCCESS, url, expires}
      };
    },
    [mutations.HIGH_RES_DOWNLOAD_FAILURE](state, {tokenId, message}) {
      state.highResDownload = {
        ...state.highResDownload, [tokenId]: {state: mutations.HIGH_RES_DOWNLOAD_FAILURE, message}
      };
    },
    [mutations.HIGH_RES_DOWNLOAD_TRIGGERED](state, {tokenId}) {
      state.highResDownload = {
        ...state.highResDownload, [tokenId]: {state: mutations.HIGH_RES_DOWNLOAD_TRIGGERED}
      };
    },
  },
  actions: {
    [actions.HIGH_RES_DOWNLOAD]({commit, state, getters, rootState}, asset) {

      // if we already have it, don't pop again
      if (getters.isHighResDownloadSuccess(asset.id)) {
        return;
      }

      commit(mutations.HIGH_RES_DOWNLOAD_TRIGGERED, {tokenId: asset.id});

      const requestHighResDownload = ({originalMessage, signedMessage}) => {
        return rootState.web3.eth.net.getId()
          .then((networkId) => {

            const highResConfig = {
              local: "http://localhost:5000/known-origin-io/us-central1/highResDownload",
              // beta: "https://us-central1-beta-known-origin-io.cloudfunctions.net/highResDownload",
              live: "https://us-central1-known-origin-io.cloudfunctions.net/highResDownload"
            };

            const getDownloadApi = () => {
              switch (window.location.hostname) {
                case "localhost":
                case "127.0.0.1":
                  return highResConfig.local;
                default:
                  // For now point all to live
                  return highResConfig.live;
              }
            };

            return axios({
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              },
              data: {
                address: rootState.account,
                tokenId: asset.id,
                originalMessage,
                signedMessage,
                networkId
              },
              url: getDownloadApi(),
            })
              .then((response) => validateResponse(response))
              .catch((error) => {
                console.log('Failed to download', error);
                commit(mutations.HIGH_RES_DOWNLOAD_FAILURE, {
                  message: _.get(error, 'response.data.message', error.message),
                  tokenId: asset.id
                });
              });
          });
      };

      const validateResponse = (response) => {
        console.log(response);
        if (response.status === 202 && response.data.url) {
          commit(mutations.HIGH_RES_DOWNLOAD_SUCCESS, {
            ...response.data,
            tokenId: asset.id
          });
        } else {
          console.log('Invalid status code');
          commit(mutations.HIGH_RES_DOWNLOAD_FAILURE, {
            message: "Unexpected response status",
            tokenId: asset.id
          });
        }
      };

      let message = `I verify that I, ${rootState.account}, have purchased this asset, #${asset.id}, of edition, ${asset.edition}, from KnownOrigin.io. By signing this transaction you agree to adhere to the KnownOrigin license agreement. ${Date.now()}`;

      rootState.web3.eth.personal
        .sign(message, rootState.account)
        .then((result) => requestHighResDownload({
          originalMessage: message,
          signedMessage: result
        }))
        .catch((error) => {
          console.log('Failed to sign message');
          // rejected
          commit(mutations.HIGH_RES_DOWNLOAD_FAILURE, {
            tokenId: asset.id,
            message: _.get(error, 'message'),
          });
        });
    }
  }
};

export default highResStateModule;
