const EVMRevert = 'revert';

module.exports = async promise => {
  try {
    await promise;
    assert.fail('Expected revert not received');
  } catch (error) {
    if (error.reason) {
      console.log("Failure reason", error.reason);
    }
    const revertFound = error.message.search(EVMRevert) >= 0;
    assert(revertFound, `Expected "revert", got ${error} instead`);
  }
};
