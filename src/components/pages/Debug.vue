<template>
  <div>
    <div class="row bg-primary full-banner-secondary pt-3 mt-1 mb-3">
      <div class="col text-center text-danger">
        ⚠️ Debug View - you shouldn't be here ⚠️
      </div>
    </div>

    <div class="container-fluid mt-4">
      <p>
        Connected Account: <code>{{account}}</code>
      </p>
      <p>
        Current Network: <code>{{currentNetwork}} / {{currentNetworkId}}</code>
      </p>

      <hr/>

      <h4>Application Logs</h4>

      <pre v-for="log in consoleData">
        {{log}}
      </pre>
    </div>
  </div>
</template>

<script>

  import {mapState} from 'vuex';

  export default {
    name: 'DebugView',
    components: {},
    methods: {},
    data() {
      return {
        originalConsole: null,
        consoleData: []
      };
    },
    computed: {
      ...mapState([
        'account',
        'currentNetworkId',
        'currentNetwork',
      ]),
    },
    created() {
      this.originalConsole = console.log;

      console.log = (message) => {
        if (typeof message === 'object') {
          this.consoleData.push(JSON.stringify(message));
        } else {
          this.consoleData.push(message);
        }
      };

    },
    destroyed() {
      console.log = this.originalConsole;
    }
  };
</script>
