<template>
  <div class="like-card-container">
    <lazy-component @show="visibilityChanged">
      <span v-if="hasLoaded">

        <!--Account locked -->
        <span v-if="!account">
          <font-awesome-icon :icon="['far', 'heart']"
                             :size="size || 'lg'"
                             v-b-tooltip.hover title="An ETH account is needed to like this">
          </font-awesome-icon>
        </span>

        <span v-else v-bind:class="{ 'text-muted': !account }">
          <font-awesome-icon :icon="['far', 'heart']" class="hand-pointer"
                             :size="size || 'lg'"
                             v-if="!like" :disabled="working"
                             @click="registerLike">
          </font-awesome-icon>

          <font-awesome-icon :icon="['fas', 'heart']" class="liked-icon hand-pointer"
                             :size="size || 'lg'"
                             v-if="like" :disabled="working"
                             @click="registerLike">
          </font-awesome-icon>
        </span>

        <span v-bind:class="{ 'liked-icon': like, 'text-muted': !like }">
          <span>{{totalEditionLikes || 0}}</span>
        </span>

      </span>
    </lazy-component>
  </div>
</template>

<script>
  import {mapGetters, mapState} from 'vuex';
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome';

  export default {
    components: {FontAwesomeIcon},
    name: 'likeIconButton',
    props: ['editionNumber', 'size'],
    data() {
      return {
        count: null,
        like: false,
        working: false,
        hasLoaded: false,
        totalEditionLikes: null,
        loaded: false
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
      },
      registerLike() {
        // Attempt to prevent smashing the buttpn
        if (this.working) {
          return;
        }

        if (this.account && this.editionNumber) {
          this.working = true;

          // Immediately toggle
          this.like
            ? this.totalEditionLikes -= 1
            : this.totalEditionLikes += 1;

          // Inverse
          this.like = !this.like;

          // Fire off request
          this.$store.state.likesService.registerLike(this.editionNumber, this.account)
            .then(({like, totalEditionLikes}) => {
              this.like = like;
              this.totalEditionLikes = totalEditionLikes;
            })
            .finally(() => {
              this.working = false;
            });
        }
      },
    },
    mounted() {

    }
  };
</script>

<style scoped lang="scss">
  @import '../../../ko-colours.scss';

  .hand-pointer {
    cursor: pointer;
  }

  .liked-icon {
    color: $liked-action;
  }

  .like-card-container {
    height: 20.047px;
  }

</style>
