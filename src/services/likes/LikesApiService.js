import axios from 'axios';
import {getApi} from "../../utils";
import FirestoreLikesService from "./FirestoreLikesService";

export default class LikesApiService extends FirestoreLikesService {

  constructor(firebasePath, currentNetworkId = 1) {
    super(firebasePath);
    this.currentNetworkId = currentNetworkId;
    this.api = getApi();
  }

  getLikesForEditionAndAccount(editionNumber, account) {
    //console.log(`Loading favourite count for [${editionNumber}] and account [${account}]`);
    return axios
      .get(`${this.api}/likes/edition/${editionNumber}/address/${account}?network=${this.currentNetworkId}`)
      .then((res) => {
        return {
          like: _.get(res.data, 'like'),
          totalEditionLikes: _.get(res.data, 'totalEditionLikes')
        };
      });
  }

  getLikesForEdition(editionNumber) {
    //console.log(`Loading favourite count for [${editionNumber}]`);
    return axios
      .get(`${this.api}/likes/edition/${editionNumber}?network=${this.currentNetworkId}`)
      .then((res) => {
        return {
          like: false,
          totalEditionLikes: _.get(res.data, 'likes')
        };
      });
  }

  getLikesForAccount(account) {
    return axios
      .get(`${this.api}/likes/address/${account}?network=${this.currentNetworkId}`)
      .then((res) => {
        const accountFavorites = _.map(_.get(res.data, 'likes', []), 'edition');
        console.log(`Found a total of [${_.size(accountFavorites)}] favorites for your account`);
        return accountFavorites;
      });
  }

  registerLike(editionNumber, account) {
    //console.log(`Registering like for [${editionNumber}] and account [${account}]`);
    return axios
      .post(`${this.api}/like?network=${this.currentNetworkId}`, {
        "edition": editionNumber,
        "address": account
      })
      .then((res) => {
        return {
          like: _.get(res.data, 'like'),
          totalEditionLikes: _.get(res.data, 'totalEditionLikes')
        };
      });
  }
}
