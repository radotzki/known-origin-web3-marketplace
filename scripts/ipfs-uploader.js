const IPFS = require('ipfs-api');
const fs = require('fs');
const streams = require('memory-streams');
const _ = require('lodash');

const ipfs = IPFS('ipfs.infura.io', '5001', {protocol: 'https'});

// Reset this cache file to { } to push fresh data to IPFS
const CACHE_FILE = './config/data/ipfs_data/cache.json';

//IPFS meta contract based on https://github.com/ethereum/eips/issues/721

/*
- meta upload should return full IPFS hash with corresponding subpaths in this format https://github.com/multiformats/multiaddr
- e.g. /ipfs/127.0.0.1/udp/1234
- example of specification https://ipfs.io/ipfs/QmZU8bKEG8fhcQwKoLHfjtJoKBzvUT5LFR3f8dEz86WdVeTransfer

/             -> (required) - root path  - full IPFS hash
/name         -> (required) - A name SHOULD be 50 characters or less, and unique amongst all NFTs tracked by this contract
/image        -> (optional) - it MUST contain a PNG, JPEG, or SVG image with at least 300 pixels of detail in each dimension
/description  -> (optional) - The description SHOULD be 1500 characters or less.
/other meta   -> (optional) - A contract MAY choose to include any number of additional subpaths
 */

const uploadMetaData = ({ipfsPath}) => {
  console.log(`Attempting to upload files in [${ipfsPath}]`);

  // Check cache as to not upload duplicates
  let cachedIpfsHash = getCachedIpfsHashes(ipfsPath);
  if (cachedIpfsHash) {
    console.log(`Found cached version of [${ipfsPath}] - ipfs hash ${cachedIpfsHash}`);
    return Promise.resolve({hash: cachedIpfsHash})
  }

  let meta = require(`../config/data/ipfs_data/${ipfsPath}/meta.json`);

  // Load in either a gif or a jpeg
  let image;
  if (fs.existsSync(`./config/data/ipfs_data/${ipfsPath}/low_res.gif`)) {
    image = fs.createReadStream(`./config/data/ipfs_data/${ipfsPath}/low_res.gif`);
  } else {
    image = fs.createReadStream(`./config/data/ipfs_data/${ipfsPath}/low_res.jpeg`)
  }

  return ipfs.add([
      {
        path: `${ipfsPath}/name`,
        content: new streams.ReadableStream(`${meta.artworkName} - ${meta.artist}`).read(),
      },
      {
        path: `${ipfsPath}/image`,
        content: image,
      },
      {
        path: `${ipfsPath}/description`,
        content: new streams.ReadableStream(`${meta.description}`).read(),
      },
      {
        path: `${ipfsPath}/other`,
        content: fs.createReadStream(`./config/data/ipfs_data/${ipfsPath}/meta.json`),
      }
    ], {recursive: false}
  )
    .then((res) => {
      console.log('Uploaded file to IPFS', res);
      let rootHash = _.last(res);

      // TODO convert to multi address support https://github.com/multiformats/multiaddr

      cacheIpfsHashes(ipfsPath, rootHash);

      return rootHash;
    });
};

const cacheIpfsHashes = (ipfsPath, rootHash) => {
  let cache = JSON.parse(fs.readFileSync(CACHE_FILE));
  let updatedCache = _.set(cache, ipfsPath, rootHash.hash);
  console.log(updatedCache);
  fs.writeFileSync(CACHE_FILE, JSON.stringify(updatedCache, null, 4));
};

const getCachedIpfsHashes = (ipfsPath) => {
  let cache = JSON.parse(fs.readFileSync(CACHE_FILE));
  return _.get(cache, ipfsPath);
};

module.exports = {
  uploadMetaData: uploadMetaData
};
