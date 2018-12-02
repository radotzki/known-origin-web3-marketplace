import * as actions from '../actions';
import * as mutations from '../mutation';
import _ from 'lodash';
import axios from 'axios';
import {getApi} from "../../utils";

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
    [actions.HIGH_RES_DOWNLOAD]({commit, state, getters, rootState}, {edition, contractVersion}) {

      // if we already have it, don't pop again
      if (getters.isHighResDownloadSuccess(edition.tokenId)) {
        return;
      }

      commit(mutations.HIGH_RES_DOWNLOAD_TRIGGERED, {tokenId: edition.tokenId});

      // TODO test this again
      const getDownloadApi = () => {
        return contractVersion === 1
          ? `${getApi()}/download/highres/v1`
          : `${getApi()}/download/highres/v2`;
      };

      const validateResponse = (response) => {
        if (response.status === 202 && response.data.url) {
          commit(mutations.HIGH_RES_DOWNLOAD_SUCCESS, {
            ...response.data,
            tokenId: edition.tokenId
          });
        } else {
          console.log('Invalid status code');
          commit(mutations.HIGH_RES_DOWNLOAD_FAILURE, {
            message: "Unexpected response status",
            tokenId: edition.tokenId
          });
        }
      };

      const requestHighResDownload = async ({originalMessage, signedMessage}) => {
        const networkId = await rootState.web3.eth.net.getId();

        return axios({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          data: {
            address: rootState.account,
            tokenId: edition.tokenId,
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
              tokenId: edition.tokenId
            });
          });
      };

      let message = `I verify that I, ${rootState.account}, have purchased token #${edition.tokenId}, of edition ${edition.edition}, from KnownOrigin.io. By signing this transaction you agree to adhere to the KnownOrigin terms of service. ${Date.now()}`;

      rootState.web3.eth.personal
        .sign(message, rootState.account)
        .then((result) => requestHighResDownload({
          originalMessage: message,
          signedMessage: result
        }))
        .catch((error) => {
          console.log('Failed to sign message');
          commit(mutations.HIGH_RES_DOWNLOAD_FAILURE, {
            tokenId: edition.tokenId,
            message: _.get(error, 'message'),
          });
        });
    }
  }
};

export default highResStateModule;
