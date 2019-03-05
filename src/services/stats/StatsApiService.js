import {getApi, AXIOS_CONFIG} from "../../utils";
import axios from "axios";

export default class StatSApiService {

  constructor(currentNetworkId = 1) {
    this.currentNetworkId = currentNetworkId;
    this.api = getApi();
  }

  /**
   * Updates the currentNetworkId, needed for when switching network
   * @param currentNetworkId
   */
  setNetworkId(currentNetworkId) {
    this.currentNetworkId = currentNetworkId;
  }

  async getContractStates() {
    console.log(`Loading contract stats for network [${this.currentNetworkId}]`);
    const results = await axios.get(`${this.api}/stats/contracts?network=${this.currentNetworkId}`, AXIOS_CONFIG);
    if (results.data.success) {
      return results.data;
    }
    return {
      success: false
    };
  }

}

