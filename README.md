<h1 align="center">
  <img src="https://raw.githubusercontent.com/TrustWallet/tokens/master/images/0xdde2d979e8d39bb8416eafcfc1758f3cab2c9c72.png"
srcset="https://raw.githubusercontent.com/TrustWallet/tokens/master/images/0xdde2d979e8d39bb8416eafcfc1758f3cab2c9c72.png 2x"
  alt="KnownOrigin"></a>
</h1>

<h1 align="center">KnownOrigin Marketplace</h1>
<div align="center">
  Discover, buy and collect digital copies of artwork
</div>

<br />

<div align="center">
  <a href="https://www.ethereum.org/" target="_blank"><img src="https://img.shields.io/badge/platform-Ethereum-brightgreen.svg?style=flat-square" alt="Ethereum" /></a>
  <a href="http://erc721.org/" target="_blank"><img src="https://img.shields.io/badge/token-ERC721-ff69b4.svg?style=flat-square" alt="Token ERC721" /> </a>
  <img src="https://img.shields.io/badge/contributions-welcome-orange.svg?style=flat-square" alt="Contributions Welcome" />
  <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="MIT License" />
  <a href="https://travis-ci.org/knownorigin/known-origin-web3-marketplace" target="_blank"<img src="https://travis-ci.org/knownorigin/known-origin-web3-marketplace.svg?branch=master" /><a/>
  
  <a href="https://t.me/knownorigin" target="_blank"><img src="https://img.shields.io/badge/Join%20Us%20On-Telegram-2599D2.svg?style=flat-square" alt="Join Us On Telegram" /></a>
</div>

<div align="center">
  <sub>Built by
  <a href="https://twitter.com/knownorigin_io" target="_blank">KnownOrigin</a> and <a href="http://blockrocket.tech" target="_blank">BlockRocket</a>
</div>

# About

Discover, buy and collect digital artwork by some of the worlds most respected artists, illustrators and creative practitioners.

We provide a platform for our artists to exhibit and sell their work as 'digital assets'.

© 2018 KNOWNORIGIN

BE ORIGINAL. BUY ORIGINAL

# Authors

Originally created by [KnownOrigin](https://twitter.com/knownorigin_io) and [BlockRocket](http://blockrocket.tech)


# Features

* **Multiple Artists & Assets** - Artists & Assets from around the world 
* **Full ERC-721 Compatibility** - Smart Contract is fully ERC-721 compliant
* **Full ERC-721 Metadata Compatibility** - Each ERC-721 token uses latest standards for ERC-721 metadata
* **Full ERC-165 Compatibility** - Smart Contract is fully ERC-165 compliant
* **IPFS Support** - Internally IPFS is used for storing asset files and metadata
* **Artist Controls** - the ability for artists to modify prices and gift NFTs
* **Auctions/Offers** - the ability for users to make offers on artworks and artists to accept these offers
* **Artist Profiles** - artists can update and modify there own profiles and details

## Installation
1. Install [Node](https://nodejs.org/en/) v8.x or above

2. Install [Ganache](http://truffleframework.com/ganache/).

3. Install [Truffle](http://truffleframework.com). (**Truffle 5**)
	```
	npm install -g truffle
	```
4. Install [Metamask](https://metamask.io/) in chrome so you can test purchasing assets
   * Tested in Chrome, Brave Browser, TrustWallet, Coinbase Wallet, Opera Mobile 
   * Should work in any modern web 3 enabled browser

5. Install node modules for project
  ```
  npm install
  ```
6. When running locally you will need to link your *Metamask* account and your locally running Ganache.
  * In Metamask - ensure you are logged out.
  * In Metamask - `Restore from seed phrase` and place the 12 word seed from the Ganache in to Metamask
     * This will link the accounts inside Ganache with Metamask & give you 100 ETH to test with
  * In Metamask - add a custom network of `http://127.0.0.1:7545` - this is Ganache
     * This will point Metamask at your locally running Ganache blockchain

7. Compile and migrate the contracts to your local blockchain (default is *ganache*).
	```
	./clean_deploy_local.sh
	```
	* This will compile the contracts and place the ABI files into `/build/` as well as deploying to Ganache

8. Run the webpack server for front-end hot reloading. Smart contract changes do not support hot reloading for now.
	```
	npm run start
	```
  **It should now work!**

## Build for production
To build the application for production, use the build command. A production build will be compiled in the `dist` folder.
```javascript
npm run build
```

#### History

* Original project based on https://github.com/wespr/truffle-vue
* Some contracts based on https://github.com/OpenZeppelin/zeppelin-solidity

# License

[MIT](https://opensource.org/licenses/MIT)

