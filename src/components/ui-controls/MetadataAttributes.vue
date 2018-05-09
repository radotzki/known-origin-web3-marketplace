<template>
  <span class="attributes">

    <span v-if="this.attributes">
        <a style="cursor: pointer" v-on:click="isActive = !isActive" v-if="!isActive">more</a>
    </span>

    <span v-for="(value, key) in this.attributes" v-show="isActive">
      <span v-if="isArray(value)">
        <span v-for="v in value" class="badge badge-light">{{v}}</span>
      </span>
      <span v-else>
        <span class="badge badge-light">{{value}}</span>
      </span>
    </span>

  </span>
</template>

<script>
  export default {
    name: 'metadataAttributes',
    props: ['attributes'],
    data() {
      return {
        isActive: false
      };
    },
    methods: {
      isString: function (value) {
        return value instanceof String;
      },
      isArray: function (value) {
        return value instanceof Array;
      },
      isBoolean: function (value) {
        return value instanceof Boolean;
      },
      isNumber: function (value) {
        return value instanceof Number;
      },
    },
    computed: {
      prettyPrintAttributes: function () {
        return this.attributes;
      },
    }
  };
</script>

<style scoped>

</style>
