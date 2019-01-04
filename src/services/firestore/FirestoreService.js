import * as Firebase from 'firebase/app';
import 'firebase/firestore';

const firebaseApp = Firebase.initializeApp({
  databaseURL: "https://known-origin-io.firebaseio.com",
  projectId: "known-origin-io",
});

const firestore = firebaseApp.firestore();
firestore.settings({timestampsInSnapshots: true});

export default class FirestoreService {

  constructor(firebasePath = "mainnet") {
    this.firebasePath = firebasePath;
    this.firestore = firestore;
  }

}
