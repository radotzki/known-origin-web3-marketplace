#!/usr/bin/env bash

node ./node_modules/.bin/truffle-flattener ./contracts/KnownOriginDigitalAsset.sol > ./contracts-flat/FLAT-KnownOriginDigitalAsset.sol;

node ./node_modules/.bin/truffle-flattener ./contracts/Migrations.sol > ./contracts-flat/FLAT-Migrations.sol;

node ./node_modules/.bin/truffle-flattener ./contracts/KodaBatchMinter.sol > ./contracts-flat/FLAT-KodaBatchMinter.sol;

node ./node_modules/.bin/truffle-flattener ./contracts/v2/KnownOriginDigitalAssetV2.sol > ./contracts-flat/FLAT-KnownOriginDigitalAssetV2.sol;
