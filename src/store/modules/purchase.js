import Vue from 'vue';
import * as actions from '../actions';
import * as mutations from '../mutation';
import _ from 'lodash';

const purchaseStateModule = {
  namespaced: true,
  state: {
    purchaseState: {},
  },
  getters: {
    editionPurchaseState: (state) => (editionNumber, account) => {
      return _.get(state.purchaseState, editionNumber);
    },
    isPurchaseTriggered: (state, getters) => (editionNumber, account) => {
      return _.get(getters.editionPurchaseState(editionNumber), 'state') === mutations.PURCHASE_TRIGGERED;
    },
    isPurchaseStarted: (state, getters) => (editionNumber, account) => {
      return _.get(getters.editionPurchaseState(editionNumber), 'state') === mutations.PURCHASE_STARTED;
    },
    isPurchaseSuccessful: (state, getters) => (editionNumber, account) => {
      return _.get(getters.editionPurchaseState(editionNumber), 'state') === mutations.PURCHASE_SUCCESSFUL;
    },
    isPurchaseFailed: (state, getters) => (editionNumber, account) => {
      return _.get(getters.editionPurchaseState(editionNumber), 'state') === mutations.PURCHASE_FAILED;
    },
    getTransactionForEdition: (state, getters) => (editionNumber, account) => {
      return getters.editionPurchaseState(editionNumber).transaction;
    },
  },
  mutations: {
    [mutations.PURCHASE_TRIGGERED](state, {editionNumber, account}) {
      state.purchaseState = {
        ...state.purchaseState,
        [editionNumber]: {
          editionNumber, account, state: 'PURCHASE_TRIGGERED'
        }
      };
    },
    [mutations.PURCHASE_FAILED](state, {editionNumber, account}) {
      // Guard against the timed account check winner and the event coming through as failed
      if (state.purchaseState[editionNumber] && state.purchaseState[editionNumber].state === 'PURCHASE_SUCCESSFUL') {
        return;
      }
      state.purchaseState = {
        ...state.purchaseState,
        [editionNumber]: {
          editionNumber,
          account,
          transaction: _.get(state.purchaseState[editionNumber], 'transaction'),
          state: 'PURCHASE_FAILED'
        }
      };
    },
    [mutations.PURCHASE_SUCCESSFUL](state, {editionNumber, account}) {
      state.purchaseState = {
        ...state.purchaseState,
        [editionNumber]: {
          editionNumber,
          account,
          transaction: state.purchaseState[editionNumber].transaction,
          state: 'PURCHASE_SUCCESSFUL'
        }
      };
    },
    [mutations.PURCHASE_STARTED](state, {editionNumber, account, transaction}) {
      // Guard against the timed account check beating the event callbacks
      if (state.purchaseState[editionNumber].state === 'PURCHASE_SUCCESSFUL') {
        state.purchaseState = {
          ...state.purchaseState,
          [editionNumber]: {
            editionNumber, account, transaction, state: 'PURCHASE_SUCCESSFUL'
          }
        };
        return;
      }

      state.purchaseState = {
        ...state.purchaseState,
        [editionNumber]: {
          editionNumber, account, transaction, state: 'PURCHASE_STARTED'
        }
      };
    },
    [mutations.RESET_PURCHASE_STATE](state, {editionNumber}) {
      delete state.purchaseState[editionNumber];
      state.purchaseState = {...state.purchaseState};
    },
  },
  actions: {
    [actions.CHECK_IN_FLIGHT_TRANSACTIONS]: async function ({commit, dispatch, state, rootState}) {

      // TODO get txs and if in flights laucnh correct state (handles back journey)

      _.forEach(state.purchaseState, async (purchaseState) => {
        // if we have a txs hash and its not completed, try to action it
        if (purchaseState.transaction && purchaseState.state !== 'PURCHASE_SUCCESSFUL') {
          const result = await rootState.web3.eth.getTransactionReceipt(purchaseState.transaction);
          // I have noticed different status from GETH/Parity nodes so check bool and int
          if (result.status === true || result.status === 1) {
            commit(mutations.PURCHASE_SUCCESSFUL, {
              editionNumber: purchaseState.editionNumber,
              account: purchaseState.account,
              transaction: _.get(state.purchaseState[editionNumber], 'transaction')
            });
          } else if (result.status === false || result.status === 0) {
            commit(mutations.PURCHASE_FAILED, {
              editionNumber: purchaseState.editionNumber,
              account: purchaseState.account,
              transaction: _.get(state.purchaseState[editionNumber], 'transaction')
            });
          }
        } else if (purchaseState.state === 'PURCHASE_TRIGGERED') {
          commit(mutations.RESET_PURCHASE_STATE, {
            editionNumber: purchaseState.editionNumber,
            account: purchaseState.account
          });
        }
      });
    },
    [actions.PURCHASE_EDITION]: async function ({commit, dispatch, state, rootState}, {edition, account}) {
      Vue.$log.debug(`Attempting purchase of [${edition.edition}] from account [${account}]`);

      let contract = await rootState.KnownOriginDigitalAssetV2.deployed();

      commit(mutations.PURCHASE_TRIGGERED, {editionNumber: edition.edition, account});

      rootState.notificationService.showPurchaseNotification({
        type: mutations.PURCHASE_TRIGGERED,
        edition,
        account,
      });

      // Trigger a timer to check the accounts purchases - can provide update faster waiting for the event
      const timer = setInterval(function () {
        dispatch(`kodaV2/${actions.LOAD_ASSETS_PURCHASED_BY_ACCOUNT}`, {account}, {root: true});
      }, 2000);

      contract
        .purchase(edition.edition, {
          from: account,
          value: edition.priceInWei
        })
        .on('transactionHash', transaction => {
          console.log('Purchase transaction submitted', transaction);

          rootState.notificationService.showPurchaseNotification({
            type: mutations.PURCHASE_STARTED,
            transaction: transaction,
            edition,
            account,
          });

          commit(mutations.PURCHASE_STARTED, {editionNumber: edition.edition, account, transaction: transaction});
        })
        .on('receipt', receipt => {
          console.log('Purchase successful', receipt);
          dispatch(`kodaV2/${actions.LOAD_ASSETS_PURCHASED_BY_ACCOUNT}`, {account}, {root: true});

          rootState.notificationService.showPurchaseNotification({
            type: mutations.PURCHASE_SUCCESSFUL,
            edition,
            account,
            receipt
          });

          commit(mutations.PURCHASE_SUCCESSFUL, {editionNumber: edition.edition, account});
        })
        .on('error', error => {
          console.log('Purchase rejection/error', error);

          rootState.notificationService.showPurchaseNotification({
            type: mutations.PURCHASE_FAILED,
            transaction: _.get(state.purchaseState[edition.edition], 'transaction'),
            edition,
            account,
            error
          });

          commit(mutations.PURCHASE_FAILED, {editionNumber: edition.edition, account});
        })
        .catch((error) => {
          console.log('Purchase rejection/error', error);

          rootState.notificationService.showPurchaseNotification({
            type: mutations.PURCHASE_FAILED,
            transaction: _.get(state.purchaseState[edition.edition], 'transaction'),
            edition,
            account,
            error
          });

          commit(mutations.PURCHASE_FAILED, {editionNumber: edition.edition, account});
        })
        .finally(async () => {
          if (timer) clearInterval(timer);
          dispatch(`kodaV2/${actions.REFRESH_AND_LOAD_INDIVIDUAL_EDITION}`, {editionNumber: edition.edition}, {root: true});
        });
    },
    [actions.RESET_PURCHASE_STATE]: function ({commit, dispatch, state, rootState}, {edition, account}) {
      commit(mutations.RESET_PURCHASE_STATE, {editionNumber: edition.edition});

      // Clear down any open notifications
      rootState.notificationService.clearAllForEditionAndAccount(edition.edition, account);
    },
  },
};

export default purchaseStateModule;
