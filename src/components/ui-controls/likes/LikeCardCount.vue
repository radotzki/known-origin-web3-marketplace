<template>
  <span class="like-card-container">
    <lazy-component @show="visibilityChanged">
        <span v-if="hasLoaded">

          <font-awesome-icon :icon="['far', 'heart']" v-if="!like">
          </font-awesome-icon>

          <font-awesome-icon :icon="['fas', 'heart']" v-if="like" class="liked-icon">
          </font-awesome-icon>

          <span v-bind:class="{ 'liked-icon': like, 'text-muted': !like }">
            <span>{{totalEditionLikes || 0}}</span>
          </span>

        </span>
    </lazy-component>
  </span>
</template>

<script>
  import {mapGetters, mapState} from 'vuex';
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';

  export default {
    components: {FontAwesomeIcon},
    name: 'likeCardCount',
    props: ['editionNumber'],
    data() {
      return {
        like: false,
        hasLoaded: false,
        totalEditionLikes: 0
      };
    },
    computed: {
      ...mapState([
        'account',
        'currentNetworkId',
      ]),
    },
    methods: {
      // We only trigger the loading when we become visible to save the extra load
      visibilityChanged(component) {

        if (!this.loaded && this.$store.state.likesService && component) {
          this.loaded = true;

          // If we have both then look up for address
          if (this.account) {
            this.$store.state.likesService.getLikesForEditionAndAccount(this.editionNumber, this.account)
              .then(({like, totalEditionLikes}) => {
                this.hasLoaded = true;
                this.like = like;
                this.totalEditionLikes = totalEditionLikes;
              });
          } else {
            //Otherwise assume not logged in and look up for edition only
            this.$store.state.likesService.getLikesForEdition(this.editionNumber)
              .then(({like, totalEditionLikes}) => {
                this.hasLoaded = true;
                this.like = like;
                this.totalEditionLikes = totalEditionLikes;
              });
          }

        }
      }
    }
  };
</script>

<style scoped lang="scss">
  @import '../../../ko-colours.scss';

  .liked-icon {
    color: $liked-action;
  }

  .like-card-container {
    height: 20.047px;
  }
</style>
