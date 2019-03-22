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

    // /events/{network}/data/[events...]
    this.eventsStream = this.firestore.collection('events').doc(firebasePath).collection('data');
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
}
