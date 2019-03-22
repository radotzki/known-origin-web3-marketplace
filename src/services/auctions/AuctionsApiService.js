import {AXIOS_CONFIG, getApi} from "../../utils";
import axios from "axios";


export default class AuctionsApiService {

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

  async getOpenAuctions() {
    console.log(`Getting open auctions on network [${this.currentNetworkId}]`);

    const results = await axios.get(`${this.api}/auctions/open?network=${this.currentNetworkId}`, AXIOS_CONFIG);
    if (results.data.success) {
      return results.data;
    }
    return {
      success: false
    };
  }

  async getAuctionsForArtist(artistAddress) {
    console.log(`Getting auction details for artists [${artistAddress}] on network [${this.currentNetworkId}]`);

    const results = await axios.get(`${this.api}/auctions/artist/${artistAddress}?network=${this.currentNetworkId}`, AXIOS_CONFIG);
    if (results.data.success) {
      return results.data;
    }
    return {
      success: false
    };
  }

  async getAuctionsForEdition(edition) {
    console.log(`Getting auction details for edition [${edition}] on network [${this.currentNetworkId}]`);

    const results = await axios.get(`${this.api}/auctions/edition/${edition}?network=${this.currentNetworkId}`, AXIOS_CONFIG);
    if (results.data.success) {
      return results.data;
    }
    return {
      success: false
    };
  }

}
