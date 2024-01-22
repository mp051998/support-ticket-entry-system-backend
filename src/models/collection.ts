import { Db, Document, Filter, OptionalId, Sort, UpdateFilter } from 'mongodb'; // Import the Document type from the mongodb package

import { db as _db } from '../app';

// Create a class that represents a collection in the mongodb database
export class Collection {
  name: string;
  db: Db = _db;
  project = {
    '_id': 0
  };

  constructor(name: string) {
    this.name = name;
  }

  async count(query: Filter<Document>) {
    await this.ensureCollectionExists();
    return await this.db.collection(this.name).countDocuments(query);
  }

  async insertOne(data: OptionalId<Document>) {
    await this.ensureCollectionExists();
    // Create a copy of the data object to avoid mutating the original object
    const dataCopy = Object.assign({}, data);
    const result = await this.db.collection(this.name).insertOne(dataCopy);
    if (result.insertedId) {
      return true;
    }
    return false;
  }

  async insertMany(data: OptionalId<Document>[]) {
    await this.ensureCollectionExists();
    return await this.db.collection(this.name).insertMany(data);
  }

  async findOne(query:Filter<Document>={}, sort:Sort={}, project: object | undefined = this.project) {
    await this.ensureCollectionExists();
  
    const options = {
      projection: project
    }
    const result = await this.db.collection(this.name).find(query, options).sort(sort).limit(1).toArray().then((response) => {
      return response[0];
    });
    return result;
  }

  async findMany(query: Filter<Document>) {
    await this.ensureCollectionExists();
    return await this.db.collection(this.name).find(query).toArray();
  }

  async findManyPaginated(query: Filter<Document>, project: object | undefined, page: number, size: number) {
    await this.ensureCollectionExists();
    const options = {
      projection: project || this.project,
    }
    return await this.db.collection(this.name).find(query, options).skip((page - 1) * size).limit(size).toArray();
  }

  async updateOne(query: Filter<Document>, data: UpdateFilter<Document> | Partial<Document>) {
    await this.ensureCollectionExists();
    const result = await this.db.collection(this.name).updateOne(query, data);
    if (result.modifiedCount > 0) {
      return true;
    }
    return false;
  }

  async deleteOne(query: Filter<Document> | undefined) {
    await this.ensureCollectionExists();
    return await this.db.collection(this.name).deleteOne(query);
  }

  private async ensureCollectionExists() {
    const collections = await this.db.collections();
    const collectionExists = collections.some((collection) => collection.collectionName === this.name);
    if (!collectionExists) {
      await this.db.createCollection(this.name);
    }
  }
}

