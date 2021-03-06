import FirestoreService from "../FirestoreService";

export default class FirestoreLikesService extends FirestoreService {

  constructor(firebasePath) {
    super(firebasePath);
    this.likes = this.firestore.collection('likes').doc(firebasePath);
  }

  loadTopLikedEditions() {
    console.log(`Get top likes on network [${this.firebasePath}]`);
    return this.likes
      .collection('counters') // total counts
      .where('count', '>=', 1) // more than 1 like
      .orderBy('count', 'desc') // ordered by most liked
      .limit(8)
      .get()
      .then((querySet) => {
        const editionNumbers = new Set();
        querySet.forEach((doc) => {
          editionNumbers.add(doc.data().edition);
        });
        const favourites = Array.from(editionNumbers);
        console.log(`Loaded favourite editions of [${favourites}]`);
        return favourites;
      });
  }
}
