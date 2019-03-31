import axios from 'axios';
import {getApi, AXIOS_CONFIG} from "../../utils";

export default class EditionLookupService {

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

  /**
   * Loads only the provided editions, default sorted order apply in the backend
   * @param editions
   * @return {Promise<*>}
   */
  async getEditions(editions = []) {
    console.log(`Load editions [${editions}] on network [${this.currentNetworkId}]`);

    const mappedEditions = editions.map((edition) => `&edition=${edition}`).join('');

    const results = await axios.get(`${this.api}/editions?network=${this.currentNetworkId}${mappedEditions}`, AXIOS_CONFIG);
    if (results.data.success) {
      return results.data;
    }
    return {
      success: false
    };
  }

  /**
   * Load a specific edition
   * @param edition
   * @return {Promise<*>}
   */
  async getEdition(edition) {
    console.log(`Load edition [${edition}] on network [${this.currentNetworkId}]`);

    const results = await axios.get(`${this.api}/editions/${edition}?network=${this.currentNetworkId}`, AXIOS_CONFIG);
    if (results.data.success) {
      return results.data;
    }
    return {
      success: false
    };
  }

  /**
   * Load gallery editions, special method for paging the editions KODA has
   * Does not show editions which are sold out or inactive
   * @param orderBy - default priceInEther, also supports other fields
   * @param order - asc/desc
   * @param offset - the count of where to start from
   * @param limit the max result size to return
   * @return {Promise<*>}
   */
  async getGalleryEditions(orderBy = 'priceInEther', order = 'asc', offset = 0, limit = 20) {
    console.log(`Load gallery editions on network [${this.currentNetworkId}] orderBy=[${orderBy}] order=[${order}] offset=[${offset}] limit=[${limit}]`);

    const results = await axios.get(`${this.api}/editions/gallery?orderBy=${orderBy}&order=${order}&limit=${limit}&offset=${offset}&network=${this.currentNetworkId}`, AXIOS_CONFIG);
    if (results.data.success) {
      return results.data;
    }
    return {
      success: false
    };
  }

  /**
   * Loads all editions for the given address
   * @param artistAccount
   * @return {Promise<*>}
   */
  async getEditionsForArtist(artistAccount) {
    console.log(`Load editions for artist [${artistAccount}] on network [${this.currentNetworkId}]`);

    const results = await axios.get(`${this.api}/editions/artist/${artistAccount}?network=${this.currentNetworkId}`, AXIOS_CONFIG);
    if (results.data.success) {
      return results.data;
    }
    return {
      success: false
    };
  }

  /**
   * Loads all editions for the given address which dont have a registered high-res download
   *
   * @param artistAccount
   * @return {Promise<*>}
   */
  async getEditionsWithoutHighResForArtist(artistAccount) {
    console.log(`Load editions for artist [${artistAccount}] missing high-res on network [${this.currentNetworkId}]`);

    const results = await axios.get(`${this.api}/editions/artist/${artistAccount}/highres/missing?network=${this.currentNetworkId}`, AXIOS_CONFIG);
    if (results.data.success) {
      return results.data;
    }
    return {
      success: false
    };
  }

  /**
   * Loads all editions for the given edition type
   * @param editionType
   * @return {Promise<*>}
   */
  async getEditionsForType(editionType = 1) {
    console.log(`Load editions for type [${editionType}] on network [${this.currentNetworkId}]`);

    const results = await axios.get(`${this.api}/editions/type/${editionType}?network=${this.currentNetworkId}`, AXIOS_CONFIG);
    console.log(results);
    if (results.data.success) {
      return results.data;
    }
    return {};
  }

  /**
   * Refresh edition data in the back end
   *
   * @param edition
   * @return {Promise<*>}
   */
  async refreshEditionData(edition) {
    console.log(`Refresh edition [${edition}] on network [${this.currentNetworkId}]`);

    const results = await axios.get(`${this.api}/editions/refresh?network=${this.currentNetworkId}&edition=${edition}`, AXIOS_CONFIG);
    console.log(results);
    if (results.data.success) {
      return results.data;
    }
    return {};
  }

  /**
   * Finds the latest creations on KODA
   *
   * @param limit
   * @return {Promise<*>}
   */
  async latestCreations(limit = 12) {
    console.log(`Load latest creations on network [${this.currentNetworkId}]`);

    const results = await axios.get(`${this.api}/editions/feed/latest?network=${this.currentNetworkId}&limit=${limit}`, AXIOS_CONFIG);
    if (results.data.success) {
      return results.data;
    }
    return {
      success: false
    };
  }

  /**
   * Finds the latest trending items on KODA
   *
   * @param limit
   * @return {Promise<*>}
   */
  async trendingEditions(limit = 8) {
    console.log(`Load trending on network [${this.currentNetworkId}]`);
    const results = await axios.get(`${this.api}/editions/feed/trending?network=${this.currentNetworkId}&limit=${limit}`, AXIOS_CONFIG);
    if (results.data.success) {
      return results.data;
    }
    return {
      success: false
    };
  }

}

