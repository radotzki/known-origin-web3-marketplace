const HDWalletProvider = require('truffle-hdwallet-provider');
const infuraApikey = '4396873c00c84479991e58a34a54ebd9';
let mnemonic = require('./mnemonic');

// Check gas prices before live deploy - https://ethgasstation.info/

module.exports = {
  mocha: {
    useColors: true,
    reporter: 'eth-gas-reporter',
    reporterOptions : {
      currency: 'USD',
      gasPrice: 3
    }
  },
  compilers: {
    solc: {
      version: "0.4.24", // ex:  "0.4.20". (Default: Truffle's installed solc)
      settings: {
        optimizer: {
          enabled: true,
          runs: 1000,
        }
      },
    }
  },
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*', // Match any network id
      gas: 0xfffffffffff,
      gasPrice: 0x01
    },
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    },
    testrpc: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*'
    },
    live: {
      provider: function () {
        let mnemonic_live = require('./mnemonic_live');
        return new HDWalletProvider(mnemonic_live, `https://mainnet.infura.io/v3/${infuraApikey}`);
      },
      network_id: 1,
      gas: 6075039, // default = 4712388
      gasPrice: 3000000000 // default = 100 gwei = 100000000000
    },
    coverage: {
      host: "localhost",
      network_id: "*",
      port: 8555,         // <-- If you change this, also set the port option in .solcover.js.
      gas: 0xfffffffffff, // <-- Use this high gas value
      gasPrice: 0x01      // <-- Use this low gas price
    },
    ropsten: {
      provider: function () {
        return new HDWalletProvider(mnemonic, `https://ropsten.infura.io/v3/${infuraApikey}`);
      },
      network_id: 3,
      gas: 7000000, // default = 4712388
      gasPrice: 2000000000 // default = 100 gwei = 100000000000
    },
    rinkeby: {
      provider: function () {
        return new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/${infuraApikey}`);
      },
      network_id: 4,
      gas: 6500000, // default = 4712388
      gasPrice: 10000000000 // default = 100 gwei = 100000000000
    }
  }
};
