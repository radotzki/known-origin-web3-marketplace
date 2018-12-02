<template>
  <div class="card shadow-sm" v-if="edition">
    <edition-image class="card-img-top" :src="edition.lowResImg" :id="edition.edition" />

    <ul class="list-group list-group-flush">
      <li class="list-group-item text-center no-top-border">
        <span class="float-left">
          <token-id :value="edition.tokenId"></token-id>
          <span class="text-muted small">V2</span>
        </span>
        <span class="edition-data float-right">1 of {{ edition.totalAvailable }}</span>
      </li>
    </ul>

    <div class="card-body">
      <p class="card-title">{{ edition.name }}</p>
      <img :src="findArtistsForAddress(edition.artistAccount).logo" class="artist-avatar"/>
      <span class="pl-1 artist-name-lg">{{ findArtistsForAddress(edition.artistAccount).name }}</span>

      <p class="card-full-desc pt-4">
        {{ edition.description }}
      </p>

      <small class="text-danger" v-if="edition.startDate > 0">
        <span>Available from {{ edition.startDate | moment('from') }}</span>
      </small>

      <high-res-label :high-res-available="edition.highResAvailable"></high-res-label>

      <rarity-indicator :total-available="edition.totalAvailable"></rarity-indicator>

      <metadata-attributes :attributes="edition.attributes"></metadata-attributes>

      <erc721-badge></erc721-badge>

      <ipfs-badge :edition="edition"></ipfs-badge>

      <birth-transaction-badge :edition="edition"></birth-transaction-badge>

      <purchase-transaction-badge :token-id="edition.tokenId" v-if="edition.tokenId"></purchase-transaction-badge>

      <span class="clearfix"></span>
    </div>

    <ul class="list-group list-group-flush">
      <li class="list-group-item">
        <small>
          <span class="text-muted">Owner:</span>
          <clickable-address :eth-address="edition.owner"></clickable-address>
        </small>
      </li>
      <li class="list-group-item">
        <high-res-download :edition="edition" :version="2"></high-res-download>
      </li>
    </ul>

    <div class="card-footer text-right no-top-border">
      <price-in-eth :value="edition.priceInEther"></price-in-eth>
    </div>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex';
  import _ from 'lodash';
  import * as actions from '../../../store/actions';
  import PriceInEth from '../generic/PriceInEth';
  import UsdPrice from '../generic/USDPrice';
  import RarityIndicator from '../v2/RarityIndicator';
  import MetadataAttributes from '../v2/MetadataAttributes';
  import Availability from "../v2/Availability";
  import TweetEditionButton from "../v2/TweetEditionButton";
  import ClickableAddress from '../generic/ClickableAddress';
  import TokenId from '../generic/TokenId';
  import HighResLabel from "../generic/HighResLabel";
  import HighResDownload from "../generic/HighResDownload";
  import IpfsBadge from "../badges/IpfsBadge";
  import Erc721Badge from "../badges/ERC721Badge";
  import BirthTransactionBadge from "../badges/BirthTransactionBadge";
  import PurchaseTransactionBadge from "../badges/PurchaseTransactionBadge";
  import EditionImage from "../generic/EditionImage";

  export default {
    name: 'tokenDetails',
    components: {
      EditionImage,
      PurchaseTransactionBadge,
      HighResDownload,
      HighResLabel,
      Availability,
      UsdPrice,
      RarityIndicator,
      PriceInEth,
      MetadataAttributes,
      ClickableAddress,
      TokenId,
      TweetEditionButton,
      BirthTransactionBadge,
      Erc721Badge,
      IpfsBadge,
    },
    props: {
      edition: {
        type: Object
      }
    },
    computed: {
      ...mapGetters('kodaV2', [
        'isStartDateInTheFuture'
      ]),
      ...mapGetters([
        'findArtistsForAddress'
      ]),
    },
    methods: {},
  };
</script>

<style scoped lang="scss">
  .edition-data {
    font-size: 0.75rem;
  }

  .card-title {
    font-size: 1.5rem;
  }

  .card-full-desc {
    font-size: 1rem;
  }

  li.no-bottom-border {
    border-bottom: 0 none;
  }

  .no-top-border {
    border-top: 0 none;
  }
</style>
