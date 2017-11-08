import { MongoClient } from "mongodb";

export default async ({ meta, payload, transaction }) => {
  const db = await MongoClient.connect(meta.uri);
  try {
    const res = await db.collection(meta.collection)
      .insertOne({
        ...transaction,
        payload,
      });
    db.close();
    return res;
  } catch (e) {
    db.close();
    throw e;
  }
};
