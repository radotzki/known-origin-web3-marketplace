<template>
  <div class="container-fluid mt-4">
    <div class="row editions-wrap">
      <div class="col-sm-4 order-2 order-sm-1 mb-5" v-if="edition">
        <edition-card :edition="edition"></edition-card>

        <div class="shadow-sm bg-white pt-0 pl-4 pr-4 pb-4">
          <small>
            <span class="text-muted">Owned by:</span>
            <clickable-address :eth-address="edition.owner"></clickable-address>
          </small>
          <high-res-download :edition="edition" :version="2" class="mt-3 text-center"></high-res-download>
        </div>
      </div>
      <div class="col-sm-8 order-1 order-sm-2 mb-5">
        <div class="card shadow-sm" v-if="edition">
          <edition-image class="card-img-top" :src="edition.lowResImg" :id="edition.edition"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import _ from 'lodash';
  import * as actions from '../../../store/actions';
  import PriceInEth from '../generic/PriceInEth';
  import UsdPrice from '../generic/USDPrice';
  import RarityIndicator from '../v2/RarityIndicator';
  import MetadataAttributes from '../v2/MetadataAttributes';
  import Availability from '../v2/Availability';
  import TweetEditionButton from '../v2/TweetEditionButton';
  import ClickableAddress from '../generic/ClickableAddress';
  import TokenId from '../generic/TokenId';
  import HighResLabel from '../highres/HighResLabel';
  import HighResDownload from '../highres/HighResDownload';
  import IpfsBadge from '../badges/IpfsBadge';
  import Erc721Badge from '../badges/ERC721Badge';
  import BirthTransactionBadge from '../badges/BirthTransactionBadge';
  import PurchaseTransactionBadge from '../badges/PurchaseTransactionBadge';
  import EditionImage from '../generic/EditionImage';
  import EditionCard from './EditionCard';

  export default {
    name: 'tokenDetails',
    components: {
      EditionCard,
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

</style>
