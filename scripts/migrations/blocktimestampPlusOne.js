const Promise = require('bluebird');

module.exports = async function(web3) {

  let promisifyGetBlockNumber = Promise.promisify(web3.eth.getBlockNumber);
  let promisifyGetBlock = Promise.promisify(web3.eth.getBlock);

  let blockNumber = await promisifyGetBlockNumber();
  let block = await promisifyGetBlock(blockNumber);
  const _openingTime = block.timestamp + 1; // one second in the future

  console.log(`opening time ${_openingTime}`);

  return _openingTime;
};
