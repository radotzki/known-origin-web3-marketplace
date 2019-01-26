import axios from 'axios';
import {getApi, AXIOS_CONFIG} from "../../utils";
import FirestoreLikesService from "./FirestoreLikesService";

export default class LikesApiService extends FirestoreLikesService {

  constructor(firebasePath = 'mainnet', currentNetworkId = 1) {
    super(firebasePath);
    this.currentNetworkId = currentNetworkId;
    this.api = getApi();
  }

  setFirebasePathAndNetworkId(firebasePath, currentNetworkId) {
    super.setFirebasePath(firebasePath);
    this.currentNetworkId = currentNetworkId;
  }

  getLikesForEditionAndAccount(editionNumber, account) {
    // console.log(`Loading favourite count for [${editionNumber}] and account [${account}] on network [${this.currentNetworkId}]`);
    return axios
      .get(`${this.api}/likes/edition/${editionNumber}/address/${account}?network=${this.currentNetworkId}`, AXIOS_CONFIG)
      .then((res) => {
        return {
          like: _.get(res.data, 'like'),
          totalEditionLikes: _.get(res.data, 'totalEditionLikes')
        };
      });
  }

  getLikesForEdition(editionNumber) {
    // console.log(`Loading favourite count for [${editionNumber}] on network [${this.currentNetworkId}]`);
    return axios
      .get(`${this.api}/likes/edition/${editionNumber}?network=${this.currentNetworkId}`, AXIOS_CONFIG)
      .then((res) => {
        return {
          like: false,
          totalEditionLikes: _.get(res.data, 'likes')
        };
      });
  }

  getLikesForAccount(account) {
    console.log(`Get likes for account [${account}] on network [${this.currentNetworkId}]`);
    return axios
      .get(`${this.api}/likes/address/${account}?network=${this.currentNetworkId}`, AXIOS_CONFIG)
      .then((res) => {
        const accountFavorites = _.map(_.get(res.data, 'likes', []), 'edition');
        console.log(`Found a total of [${_.size(accountFavorites)}] favorites for your account`);
        return accountFavorites;
      });
  }

  registerLike(editionNumber, account) {
    console.log(`Registering like for [${editionNumber}] and account [${account}] on network [${this.currentNetworkId}]`);
    return axios
      .post(`${this.api}/like?network=${this.currentNetworkId}`, {
        "edition": editionNumber,
        "address": account
      }, AXIOS_CONFIG)
      .then((res) => {
        return {
          like: _.get(res.data, 'like'),
          totalEditionLikes: _.get(res.data, 'totalEditionLikes')
        };
      });
  }
}
