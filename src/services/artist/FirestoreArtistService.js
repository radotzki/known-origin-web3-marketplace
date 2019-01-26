import FirestoreService from "../FirestoreService";

export default class FirestoreArtistService extends FirestoreService {

  constructor() {
    super();
    this.artistDocRef = this.firestore.collection('artist-data');
  }

  loadArtistsData() {
    console.log(`Loading artist data on network [${this.firebasePath}]`);

    // Return from here so we can change them in views
    return this.artistDocRef
      .orderBy('name')
      .get()
      .then((querySnapshot) => {
        let artistData = [];
        querySnapshot.forEach((doc) => {
          artistData.push(doc.data());
        });
        console.log(`Loaded a total of [${artistData.length}] artists`);
        return artistData;
      });
  }

}
