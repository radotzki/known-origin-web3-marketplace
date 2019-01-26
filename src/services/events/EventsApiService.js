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

}

