import * as mutations from "../../store/mutation";

const _ = require('lodash');
import Vue from 'vue';
import {lookupEtherscanAddress} from "../../utils";


const defaults = {
  timeout: 0,
  showProgressBar: false,
  closeOnClick: true,
  pauseOnHover: false,
};

const CONTENTS = {
  triggered: () => {
    return `<div class="snotifyToast__body">
            <div class="notification-icon"> 👍 </div>
            <div class="notification-msg">
              <div> Your wallet will take care of it from here!</div>
            </div>
            </div>`;
  },
  successful: (etherscanBase, transaction) => {
    return `<div class="snotifyToast__body">
              <div class="notification-icon"> 🙌 </div>
              <div class="notification-msg">
                <div>️Processing transaction</div>
                <div class="small"><a href="${etherscanBase}/tx/${transaction}" target="_blank">View on etherscan</a></div>
              </div>
            </div>`;
  },
  confirmed: (etherscanBase, transactionHash) => {
    return `<div class="snotifyToast__body">
              <div class="notification-icon"> 🤟 </div>
              <div class="notification-msg">
                <div>️Transaction confirmed</div>
                <div class="small"><a href="${etherscanBase}/tx/${transactionHash}" target="_blank">View on etherscan</a></div>
              </div>
            </div>`;
  },
  failed: (etherscanBase, account, transaction = null) => {

    const link = transaction
      ? `<a href="${etherscanBase}/tx/${transaction}" target="_blank">View on etherscan</a>`
      : `<a href="${etherscanBase}/address/${account}" target="_blank">View on etherscan</a>`;

    return `<div class="snotifyToast__body">
              <div class="notification-icon">😞</div>
              <div class="notification-msg">
                <div>Unknown issue</div>
                <div class="small">${link}</div>
              </div>
            </div>`;
  }
};

export default class NotificationService {

  constructor(currentNetworkId = 1) {
    this.notifications = {};
    this.currentNetworkId = currentNetworkId;
    this.etherscanBase = lookupEtherscanAddress(currentNetworkId);
  }

  setNetworkId(currentNetworkId) {
    this.currentNetworkId = currentNetworkId;
    this.etherscanBase = lookupEtherscanAddress(currentNetworkId);
  }

  clearAll() {
    _.forEach(this.notifications, (key) => {
      const notification = this.notifications[key];
      if (notification.notification) {
        Vue.$snotify.remove(notification.notification.id);
      }
    });
  }

  clearAllForEditionAndAccount(editionNumber, account) {
    // Composite ID for the purchase
    const id = `${editionNumber}_${account}`;

    // Clear down any previous popups for the editionNumber/account ID
    const notification = this.notifications[id];
    if (notification.notification) {
      Vue.$snotify.remove(notification.notification.id);
    }
  }

  clearNotificationId(id) {
    // Clear down any previous popups for the edition/account ID
    const notification = this.notifications[id];
    if (notification && notification.notification) {
      Vue.$snotify.remove(notification.notification.id);
    }
  }

  setNotificationAndPayload(id, notification, payload) {
    // Keep a track of the notifications for now
    this.notifications[id] = {
      notification: notification,
      payload: payload
    };
  }

  showPurchaseNotification(payload) {
    console.log(payload);

    // Defaults for all notifications
    const {type, edition, account} = payload;

    // Composite ID for the purchase
    const id = `${edition.edition}_${account}`;

    this.clearNotificationId(id);

    let notification;

    switch (type) {
      case mutations.PURCHASE_TRIGGERED: {
        notification = Vue.$snotify.html(
          CONTENTS.triggered(),
          {
            ...defaults,
            type: 'simple',
          });
        break;
      }
      case mutations.PURCHASE_STARTED: {

        const {transaction} = payload;

        notification = Vue.$snotify.html(
          CONTENTS.successful(this.etherscanBase, transaction),
          {
            ...defaults,
            type: 'info',
          });
        break;
      }
      case mutations.PURCHASE_SUCCESSFUL: {

        const {receipt} = payload;

        notification = Vue.$snotify.html(
          CONTENTS.confirmed(this.etherscanBase, receipt.transactionHash),
          {
            ...defaults,
            timeout: 10000, // 10s timeout
            type: 'success',
          });
        break;
      }
      case mutations.PURCHASE_FAILED: {

        const {error, transaction} = payload;

        notification = Vue.$snotify.html(
          CONTENTS.failed(this.etherscanBase, account, transaction),
          {
            ...defaults,
            type: 'warning',
          });
        break;
      }
    }

    this.setNotificationAndPayload(id, notification, payload);
  }

  showSelfServiceEditionCreated(payload) {
    console.log(payload);

    // Defaults for all notifications
    const {type, account, transactionHash} = payload;

    // Composite ID for the purchase
    const id = `${account}`;

    this.clearNotificationId(id);

    let notification;

    switch (type) {
      case mutations.SELF_SERVICE_TRIGGERED: {
        notification = Vue.$snotify.html(
          CONTENTS.triggered(),
          {
            ...defaults,
            type: 'simple',
          });
        break;
      }
      case mutations.SELF_SERVICE_STARTED: {
        notification = Vue.$snotify.html(
          CONTENTS.successful(this.etherscanBase, transactionHash),
          {
            ...defaults,
            type: 'info',
          });
        break;
      }
      case mutations.SELF_SERVICE_SUCCESSFUL: {
        notification = Vue.$snotify.html(
          CONTENTS.confirmed(this.etherscanBase, transactionHash),
          {
            ...defaults,
            timeout: 10000, // 10s timeout
            type: 'success',
          });
        break;
      }
      case mutations.SELF_SERVICE_FAILED: {
        notification = Vue.$snotify.html(
          CONTENTS.failed(this.etherscanBase, account, transactionHash),
          {
            ...defaults,
            type: 'warning',
          });
        break;
      }
    }

    this.setNotificationAndPayload(id, notification, payload);
  }
}
