import FirestoreService from "../FirestoreService";
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
  constructor(firebasePath = 'mainnet') {
    super(firebasePath);

    /** @deprectaed /raw/{network}/{contract}/[events...] */
    this.events = this.firestore.collection('raw').doc(firebasePath);

    // /events/{network}/data/[events...]
    this.eventsStream = this.firestore.collection('events').doc(firebasePath).collection('data');
  }

  /**
   * @deprectaed - replaced with new event document store
   */
  loadActivity() {
    console.log(`Load activity on network [${this.firebasePath}]`);

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

  /**
   * @deprectaed - replaced with new event document store
   */
  loadLatestCreations() {
    console.log(`Load latest creations on network [${this.firebasePath}]`);

    return this.eventsStream
      .where('event', '==', 'EditionCreated')
      .orderBy('blockNumber', 'desc')
      .limit(12)
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

  /**
   * @deprectaed - replaced with new event document store
   */
  loadTrendingEditions() {
    console.log(`Load trending on network [${this.firebasePath}]`);
    return this.eventsStream
      .where('queries.trending_events', '==', true)
      .limit(12)
      .get()
      .then((querySnapshot) => {
        const editionNumbers = new Set();
        querySnapshot.forEach((doc) => {
          editionNumbers.add(doc.data()._args._editionNumber);
        });
        const trending = Array.from(editionNumbers);
        console.log(`Loaded trending of [${trending}]`);
        return trending;
      });
  }

  loadAuctionEvents({edition}) {
    console.log(`Load auction events for edition [${edition}] on network [${this.firebasePath}]`);

    const editionString = edition.toString();

    return this.eventsStream
      .where("queries.auction_events", '==', true)
      .where("_args._editionNumber", '==', editionString)
      .orderBy("blockNumber", "desc")
      .limit(10)
      .get()
      .then((querySnapshot) => {
        const auctionEvents = [];
        querySnapshot.forEach((doc) => {
          auctionEvents.push(doc.data());
        });
        return auctionEvents;
      });
  }

  findBirthTransaction({edition}) {
    return this.eventsStream
      .where('event', '==', 'EditionCreated')
      .where("_args._editionNumber", '==', edition.toString())
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
    return this.eventsStream
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

  /**
   * @deprecated = API hit for this info now
   */
  loadAuctionStats() {
    let ethPlaced = new Web3.utils.BN(0);
    let ethAccepted = new Web3.utils.BN(0);
    let bidsAccepted = 0;

    return this.eventsStream
      .where("queries.auction_events", '==', true)
      .get()
      .then(async (querySnapshot) => {

        querySnapshot.forEach((doc) => {
          const data = doc.data();

          const amount = _.get(data, '_args._amount');

          if (data.event === 'BidAccepted' && amount) {
            bidsAccepted++;
            ethAccepted = ethAccepted.add(new Web3.utils.BN(amount));
          } else if (amount) {
            ethPlaced = ethPlaced.add(new Web3.utils.BN(amount));
          }
        });

        return {
          ethPlaced: Web3.utils.fromWei(ethPlaced.toString(10), 'ether').valueOf(),
          ethAccepted: Web3.utils.fromWei(ethAccepted.toString(10), 'ether').valueOf(),
          bidsAccepted
        };
      });
  }
}
