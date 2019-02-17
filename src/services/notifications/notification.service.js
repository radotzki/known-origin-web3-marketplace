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
      const foundNotification = this.notifications[key];
      if (foundNotification) {
        Vue.$snotify.remove(foundNotification.id);
      }
    });
  }

  clearAllForEditionAndAccount(editionNumber, account) {
    // Composite ID for the purchase
    const id = `${editionNumber}_${account}`;

    // Clear down any previous popups for the editionNumber/account ID
    const foundNotification = this.notifications[id];
    if (foundNotification) {
      Vue.$snotify.remove(foundNotification.id);
    }
  }

  showPurchaseNotification(payload) {
    console.log(payload);

    // Defaults for all notifications
    const {type, edition, account} = payload;

    // Composite ID for the purchase
    const id = `${edition.edition}_${account}`;

    // Clear down any previous popups for the edition/account ID
    const foundNotification = this.notifications[id];
    if (foundNotification) {
      Vue.$snotify.remove(foundNotification.id);
    }

    let notification;

    switch (type) {
      case mutations.PURCHASE_TRIGGERED: {
        notification = Vue.$snotify.html(
          `<div class="snotifyToast__body">
            <div class="notification-icon"> 👍 </div>
            <div class="notification-msg">
              <div> Your wallet will take care of it from here!</div>
            </div>
            </div>`,
          {
            ...defaults,
            type: 'simple',
          });
        break;
      }
      case mutations.PURCHASE_STARTED: {

        const {transaction} = payload;

        notification = Vue.$snotify.html(
          `<div class="snotifyToast__body">
              <div class="notification-icon"> 🙌 </div>
              <div class="notification-msg">
                <div>️Processing transaction</div>
                <div class="small"><a href="${this.etherscanBase}/tx/${transaction}" target="_blank">View on etherscan</a></div>
              </div>
            </div>`,
          {
            ...defaults,
            type: 'info',
          });

        break;
      }
      case mutations.PURCHASE_SUCCESSFUL: {

        const {receipt} = payload;

        notification = Vue.$snotify.html(
          `<div class="snotifyToast__body">
              <div class="notification-icon"> 🤟 </div>
              <div class="notification-msg">
                <div>️Transaction confirmed</div>
                <div class="small"><a href="${this.etherscanBase}/tx/${receipt.transactionHash}" target="_blank">View on etherscan</a></div>
              </div>
            </div>`,
          {
            ...defaults,
            timeout: 10000, // 10s timeout
            type: 'success',
          });

        break;
      }
      case mutations.PURCHASE_FAILED: {

        const {error, transaction} = payload;

        const link = transaction
          ? `<a href="${this.etherscanBase}/tx/${transaction}" target="_blank">View on etherscan</a>`
          : `<a href="${this.etherscanBase}/address/${account}" target="_blank">View on etherscan</a>`;

        notification = Vue.$snotify.html(
          `<div class="snotifyToast__body">
              <div class="notification-icon">😞</div>
              <div class="notification-msg">
                <div>Unknown issue</div>
                <div class="small">${link}</div>
              </div>
            </div>`,
          {
            ...defaults,
            type: 'warning',
          });

        break;
      }

    }

    // Keep a track of the notifications for now
    this.notifications[id] = {
      notification: notification,
      payload: payload
    };
  }
}
