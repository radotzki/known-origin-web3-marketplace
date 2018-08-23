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
          editionNumber, account, state: 'PURCHASE_FAILED'
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
    [actions.PURCHASE_EDITION]: async function ({commit, dispatch, state, rootState}, {edition, account}) {
      Vue.$log.debug(`Attempting purchase of [${edition.edition}] from account [${account}]`);

      let contract = await rootState.KnownOriginDigitalAssetV2.deployed();

      commit(mutations.PURCHASE_TRIGGERED, {editionNumber: edition.edition, account});

      let purchase = contract.purchase(edition.edition, {
        from: account,
        value: edition.priceInWei
      });

      // TODO this isnt going to work

      let mintedEvent = contract.Minted({_editionNumber: edition.edition, _buyer: account}, {
        fromBlock: web3.eth.blockNumber,
        toBlock: 'latest' // wait until event comes through
      });

      // Trigger a timer to check the accounts purchases - can provide update faster waiting for the event
      const timer = setInterval(function () {
        console.log("Dispatching GET_ASSETS_PURCHASED_FOR_ACCOUNT");
        dispatch(`v2/${actions.LOAD_ASSETS_PURCHASED_BY_ACCOUNT}`, {account}, {root: true});
      }, 1000);

      mintedEvent.watch(function (error, event) {
        if (!error) {
          console.log('Purchase successful', event);
          dispatch(`v2/${actions.LOAD_ASSETS_PURCHASED_BY_ACCOUNT}`, {account}, {root: true});
          commit(mutations.PURCHASE_SUCCESSFUL, {editionNumber: edition.edition, account});
        } else {
          console.log('Failure', error);
          commit(mutations.PURCHASE_FAILED, {editionNumber: edition.edition, account});
          mintedEvent.stopWatching();
        }
        if (timer) clearInterval(timer);
      });

      purchase
        .then((data) => {
          console.log('Purchase transaction submitted', data);
          commit(mutations.PURCHASE_STARTED, {editionNumber: edition.edition, account, transaction: data.tx});
        })
        .catch((error) => {
          console.log('Purchase rejection/error', error);
          commit(mutations.PURCHASE_FAILED, {editionNumber: edition.edition, account});
          if (timer) clearInterval(timer);
        });
    },
    [actions.RESET_PURCHASE_STATE]: function ({commit, dispatch, state}, {edition}) {
      // TODO reinstate
      // dispatch(`assets/${actions.GET_ALL_ASSETS}`, null, {root: true});
      commit(mutations.RESET_PURCHASE_STATE, {editionNumber: edition.edition});
    },
  },
};

export default purchaseStateModule;
