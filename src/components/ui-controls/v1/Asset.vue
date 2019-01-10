<template>
  <div class="card shadow-sm" v-if="asset">

    <edition-image class="card-img-top" :src="asset.lowResImg" />

    <ul class="list-group list-group-flush">
      <li class="list-group-item text-center no-top-border">
        <span class="edition-data float-left">
          <token-id :value="asset.tokenId"></token-id>
          <span class="text-muted small">V1</span>
        </span>
      </li>
    </ul>

    <div class="card-body">
      <p class="card-title">{{ asset.otherMeta.artworkName }}</p>
      <img :src="findArtist(asset.artistCode).logo" class="artist-avatar"/>
      <span class="pl-1 artist-name-lg">{{ asset.otherMeta.artist }}</span>

      <p class="card-full-desc pt-4">
        {{ asset.description }}
      </p>

      <high-res-label :high-res-available="asset.highResAvailable"></high-res-label>

      <metadata-attributes :attributes="asset.otherMeta"></metadata-attributes>

      <span class="clearfix"></span>
    </div>

    <ul class="list-group list-group-flush">
      <li class="list-group-item">
        <small>
          <span class="text-muted">Owner:</span>
          <clickable-address :eth-address="asset.owner"></clickable-address>
        </small>
      </li>
      <li class="list-group-item">
        <high-res-download :edition="asset" :version="1"></high-res-download>
      </li>
    </ul>

    <div class="card-footer text-right no-top-border">
      <price-in-eth :value="asset.priceInEther"></price-in-eth>
    </div>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import _ from 'lodash';
  import PriceInEth from '../generic/PriceInEth';
  import TokenId from '../generic/TokenId';
  import EditionNameByArtist from './EditionNameByArtist';
  import ClickableAddress from '../generic/ClickableAddress';
  import TweetAssetButton from './TweetAssetButton';
  import MetadataAttributes from './MetadataAttributes';
  import HighResLabel from "../highres/HighResLabel";
  import HighResDownload from "../highres/HighResDownload";
  import EditionImage from "../generic/EditionImage";

  export default {
    components: {
      EditionImage,
      HighResDownload,
      HighResLabel,
      MetadataAttributes,
      PriceInEth,
      EditionNameByArtist,
      TokenId,
      ClickableAddress,
      TweetAssetButton
    },
    name: 'asset',
    props: {
      asset: {
        type: Object
      },
    },
    computed: {
      ...mapGetters([
        'findArtist'
      ])
    }
  };
</script>

<style scoped lang="scss">
  li.no-bottom-border {
    border-bottom: 0 none;
  }

  .no-top-border {
    border-top: 0 none;
  }

  .card-title {
    font-size: 1.5rem;
  }

  .card-full-desc {
    font-size: 1rem;
  }
</style>
