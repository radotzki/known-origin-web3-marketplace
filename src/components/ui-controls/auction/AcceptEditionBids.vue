<template>
  <div class="container-fluid" v-if="listOpenAuctions.length > 0">

    <div class="editions-wrap">
      <h3>Open Offers</h3>
      <p>
        Below is list of ongoing auctions, edition creators can accept offers and user can withdraw them.
      </p>

    </div>

    <div class="row col editions-wrap">

      <table class="table table-striped">
        <tbody>
        <tr v-for="auction in listOpenAuctions" :key="auction.edition">
          <td>
            <router-link :to="{ name: 'confirmPurchaseSimple', params: { editionNumber: auction.edition }}">
              <img :src="getEdition(auction.edition).lowResImg" class="img-thumbnail" style="max-width: 100px"/>
            </router-link>
          </td>
          <td class="d-none d-md-block">
            {{getEdition(auction.edition).name}}
          </td>
          <td>
            <div v-if="auction.highestBid > 0">
              <!--<p>Current highest bidder</p>-->
              <price-in-eth :value="auction.highestBid"></price-in-eth>
              <usd-price :price-in-ether="auction.highestBid"></usd-price>
            </div>
          </td>
          <td class="d-none d-md-block">
            <clickable-address :eth-address="auction.highestBidder"></clickable-address>
            <span class="small text-muted">bidder</span>
          </td>
          <td class="w-25 text-center">
            <accepting-bid-flow :auction="auction"></accepting-bid-flow>
            <withdrawing-bid-flow :auction="auction"></withdrawing-bid-flow>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script>

  import {mapGetters, mapState} from 'vuex';
  import ArtistShortBio from '../../ui-controls/artist/ArtistShortBio';
  import ArtistPanel from '../../ui-controls/artist/ArtistPanel';
  import LoadingSpinner from '../../ui-controls/generic/LoadingSpinner';
  import * as actions from '../../../store/actions';
  import RarityIndicator from '../../ui-controls/v2/RarityIndicator';
  import MetadataAttributes from '../../ui-controls/v2/MetadataAttributes';
  import TweetEditionButton from '../../ui-controls/v2/TweetEditionButton';
  import HighResLabel from '../../ui-controls/generic/HighResLabel';
  import {PAGES} from '../../../store/loadingPageState';
  import LoadingSection from '../../ui-controls/generic/LoadingSection';
  import ClickableAddress from '../../ui-controls/generic/ClickableAddress';
  import Availability from '../../ui-controls/v2/Availability';
  import _ from 'lodash';
  import EthAddress from '../../ui-controls/generic/EthAddress';
  import PriceInEth from '../../ui-controls/generic/PriceInEth';
  import UsdPrice from '../../ui-controls/generic/USDPrice';
  import ClickableTransaction from '../../ui-controls/generic/ClickableTransaction';
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
  import AcceptingBidFlow from "./control-flows/AcceptingBidFlow";
  import WithdrawingBidFlow from "./control-flows/WithdrawingBidFlow";

  export default {
    name: 'acceptEditionBids',
    components: {
      WithdrawingBidFlow,
      AcceptingBidFlow,
      FontAwesomeIcon,
      ClickableTransaction,
      UsdPrice,
      PriceInEth,
      EthAddress,
      Availability,
      LoadingSection,
      HighResLabel,
      TweetEditionButton,
      MetadataAttributes,
      RarityIndicator,
      ArtistShortBio,
      ArtistPanel,
      LoadingSpinner,
      ClickableAddress
    },
    data() {
      return {
        PAGES: PAGES,
      };
    },
    props: {
      editions: {
        type: Object,
        default: () => {
          return {};
        }
      }
    },
    computed: {
      ...mapState([
        'account',
      ]),
      ...mapState('auction', [
        'auction',
      ]),
      ...mapGetters([
        'findArtistsForAddress',
      ]),
      listOpenAuctions: function () {
        const editionNumbers = _.keys(this.editions);
        return _.filter(this.auction, (auction) => {
          if (!auction.enabled || auction.highestBidWei <= 0) {
            return false;
          }
          return _.indexOf(editionNumbers, auction.edition) > -1;
        });
      },
    },
    methods: {
      lookupArtist: function () {
        return this.findArtistsForAddress(this.$route.params.artistAccount);
      },
      getArtistAddress: function () {
        let artists = this.lookupArtist();
        if (_.isArray(artists.ethAddress)) {
          return artists.ethAddress[0];
        }
        return artists.ethAddress;
      },
      getEdition: function (edition) {
        return this.editions[edition] || {};
      },
    },
    destroyed() {
    }
  };
</script>

<style scoped lang="scss">
  @import '../../../ko-colours.scss';
  @import '../../../ko-card.scss';

</style>
