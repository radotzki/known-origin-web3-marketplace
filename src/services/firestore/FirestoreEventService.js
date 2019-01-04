import FirestoreService from "./FirestoreService";
import _ from "lodash";
import Web3 from "web3";

export default class FirestoreEventService extends FirestoreService {

  contracts = {
    AUCTION_V1: 'auction-v1',
    KODA_V2: 'koda-v2'
  };

  /**
   * /raw/{network}/{contract}/[events...]
   */
  constructor(firebasePath) {
    super(firebasePath);
    this.events = this.firestore.collection('raw').doc(firebasePath);
  }

  loadActivity() {
    const auctionRef = this.events.collection(this.contracts.AUCTION_V1);
    const kodaRef = this.events.collection(this.contracts.KODA_V2);

    return Promise.all([
      auctionRef
        .where('event', '==', 'BidPlaced')
        .orderBy('blockNumber', 'desc')
        .limit(25).get(),
      auctionRef
        .where('event', '==', 'BidAccepted')
        .orderBy('blockNumber', 'desc')
        .limit(25).get(),
      auctionRef
        .where('event', '==', 'BidIncreased')
        .orderBy('blockNumber', 'desc')
        .limit(25).get(),
      kodaRef
        .where('event', '==', 'EditionCreated')
        .orderBy('blockNumber', 'desc')
        .limit(25).get(),
      kodaRef
        .where('event', '==', 'Minted')
        .orderBy('blockNumber', 'desc')
        .limit(25).get()
    ])
      .then((querySet) => {
        const activity = [];
        _.forEach(querySet, (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            activity.push(doc.data());
          });
        });
        return activity;
      });
  }

  loadLatestCreations() {
    return this.events
      .collection(this.contracts.KODA_V2)
      .where('event', '==', 'EditionCreated')
      .orderBy('blockNumber', 'desc')
      .limit(15)
      .get()
      .then((querySet) => {
        const editionNumbers = new Set();
        querySet.forEach((doc) => {
          editionNumbers.add(doc.data()._args._editionNumber);
        });
        const latest = Array.from(editionNumbers);
        console.log(`Loaded latest editions of [${latest}]`);
        return latest;
      });
  }

  loadTrendingEditions() {
    const auctionRef = this.events.collection(this.contracts.AUCTION_V1);
    const kodaRef = this.events.collection(this.contracts.KODA_V2);

    return Promise.all([
      kodaRef
        .where('event', '==', 'Purchase')
        .orderBy('blockNumber', 'desc')
        .limit(30).get(),
      auctionRef
        .where('event', '==', 'BidPlaced')
        .orderBy('blockNumber', 'desc')
        .limit(10).get(),
    ])
      .then((querySet) => {
        const editionNumbers = new Set();
        _.forEach(querySet, (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            editionNumbers.add(doc.data()._args._editionNumber);
          });
        });
        const trending = Array.from(editionNumbers);
        console.log(`Loaded trending of [${trending}]`);
        return trending;
      });
  }

  loadAuctionEvents({edition}) {
    const auctionRef = this.events.collection(this.contracts.AUCTION_V1);
    const editionString = edition.toString();

    return Promise.all([
      auctionRef
        .where("event", '==', "BidPlaced")
        .where("_args._editionNumber", '==', editionString)
        .orderBy("blockNumber", "desc")
        .limit(5).get(),
      auctionRef
        .where("event", '==', "BidAccepted")
        .where("_args._editionNumber", '==', editionString)
        .orderBy("blockNumber", "desc")
        .limit(5).get(),
      auctionRef
        .where("event", '==', "BidIncreased")
        .where("_args._editionNumber", '==', editionString)
        .orderBy("blockNumber", "desc")
        .limit(5).get(),
      auctionRef
        .where("event", '==', "AuctionCancelled")
        .where("_args._editionNumber", '==', editionString)
        .orderBy("blockNumber", "desc")
        .limit(5).get(),
    ])
      .then((querySet) => {
        const auctionEvents = [];
        _.forEach(querySet, (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            auctionEvents.push(doc.data());
          });
        });
        return auctionEvents;
      });
  }

  findBirthTransaction({edition}) {
    return this.events
      .collection(this.contracts.KODA_V2)
      .where('event', '==', 'EditionCreated')
      .where("_args._editionNumber", '==', edition.toString())
      .orderBy('blockNumber', 'desc')
      .limit(1)
      .get()
      .then((querySet) => {
        let data = null;
        querySet.forEach((doc) => {
          data = doc.data();
        });
        return data;
      });
  }

  findPurchaseTransaction(tokenId) {
    return this.events
      .collection(this.contracts.KODA_V2)
      .where('event', '==', 'Transfer')
      .where("_args._tokenId", '==', tokenId.toString())
      .limit(1)
      .get()
      .then((querySet) => {
        let data = null;
        querySet.forEach((doc) => {
          data = doc.data();
        });
        return data;
      });
  }

  loadAuctionStats() {
    const auctionRef = this.events.collection(this.contracts.AUCTION_V1);

    let ethPlaced = new Web3.utils.BN(0);
    let ethAccepted = new Web3.utils.BN(0);
    let bidsAccepted = 0;

    return Promise.all([
      auctionRef.where("event", '==', "BidPlaced").get(),
      auctionRef.where("event", '==', "BidAccepted").get(),
      auctionRef.where("event", '==', "BidIncreased").get()
    ])
      .then(async (querySet) => {

        _.forEach(querySet, (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const data = doc.data();

            if (data.event === 'BidAccepted') {
              bidsAccepted++;
              ethAccepted = ethAccepted.add(new Web3.utils.BN(_.get(data, '_args._amount')));
            } else {
              ethPlaced = ethPlaced.add(new Web3.utils.BN(_.get(data, '_args._amount')));
            }
          });
        });

        return {
          ethPlaced: Web3.utils.fromWei(ethPlaced.toString(10), 'ether').valueOf(),
          ethAccepted: Web3.utils.fromWei(ethAccepted.toString(10), 'ether').valueOf(),
          bidsAccepted
        };
      });
  }
}
