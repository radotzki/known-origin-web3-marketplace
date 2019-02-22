import FirestoreEventService from "./FirestoreEventService";
import {getApi, AXIOS_CONFIG} from "../../utils";
import axios from "axios";

export default class EventsApiService extends FirestoreEventService {

  constructor(firebasePath = 'mainnet', currentNetworkId = 1) {
    super(firebasePath);
    this.currentNetworkId = currentNetworkId;
    this.api = getApi();
  }

  setFirebasePathAndNetworkId(firebasePath, currentNetworkId) {
    super.setFirebasePath(firebasePath);
    this.currentNetworkId = currentNetworkId;
  }

  async loadEventsActivity(limit = 50, offset = 0) {
    console.log(`Load events activity for network [${this.currentNetworkId}] offset [${offset}] limit [${limit}]`);
    const results = await axios.get(`${this.api}/events/activity?limit=${limit}&offset=${offset}&network=${this.currentNetworkId}`, AXIOS_CONFIG);
    if (results.data.success) {
      return results.data;
    }
    return {
      success: false
    };
  }

  async loadAddressActivity(address) {
    console.log(`Load address activity for network [${this.currentNetworkId}]`);
    const results = await axios.get(`${this.api}/events/activity/address/${address}?network=${this.currentNetworkId}`, AXIOS_CONFIG);
    if (results.data.success) {
      return results.data;
    }
    return {
      success: false
    };
  }

  async loadPurchaseEventsForEditions(editions = []) {
    console.log(`Load purchase events for editions [${editions}] for network [${this.currentNetworkId}]`);

    const mappedEditions = editions.map((edition) => `&edition=${edition}`).join('');

    const results = await axios.get(`${this.api}/events/edition/purchases?network=${this.currentNetworkId}${mappedEditions}`, AXIOS_CONFIG);
    if (results.data.success) {
      return results.data;
    }
    return {
      success: false
    };
  }

}

