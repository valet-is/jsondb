import path from 'path';
import fs from 'fs';
import uniqid from 'uniqid';

const charset = 'utf8';

// utils
const ensureDbSync = function () {
  try {
    if (fs.existsSync(this.root)) return;
    fs.mkdirSync(this.root);
  } catch (err) {
    throw new Error(err);
  }
};

const isFileExists = function (fp) {
  try {
    fs.lstatSync(fp);
  } catch (err) {
    if (err.code === "ENOENT") throw new Error(err);
  }
  return true;
};

const readDir = function (path) {
  try {
    const colls = fs.readdirSync(path);
    return colls.map((c) => c.replace('.json', ''));
  } catch (err) {
    return [];
  }
};

const syncStorage = function () {
  try {
    const collPath = `${this.root}/${this.cursor}.json`;
    fs.writeFileSync(
      collPath,
      JSON.stringify(this.storage, null, 2),
      charset
    );
  } catch (err) {
    throw new Error(err);
  }
};

// handlers
const insert = function (cursor, doc) {
  try {
    this.cursor = cursor;

    const collPath = `${this.root}/${this.cursor}.json`;
    if (!isFileExists(collPath)) {
      createCollection.call(this, cursor);
    }

    this.storage = JSON.parse(
      fs.readFileSync(collPath, charset)
    );
    const newDoc = {
      ...doc,
      _id: uniqid(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.storage.push(newDoc);
    this.save();
    return newDoc;
  } catch (err) {
    throw new Error(err);
  }
};

const find = function (cursor, query = null) {
  try {
    this.cursor = cursor;

    const collPath = `${this.root}/${this.cursor}.json`;
    if (!isFileExists(collPath)) {
      createCollection.call(this, cursor);
    }

    this.storage = JSON.parse(
      fs.readFileSync(collPath, charset)
    );
    let filtered = this.storage;
    if (query && typeof query === 'object') {
      const keys = Object.keys(query);
      // TODO: Improve
      filtered = this.storage.filter((doc) => {
        let include = true;
        keys.forEach((key) => {
          if (doc[key] !== query[key]) {
            include = false;
          }
        });
        return include;
      });
    }
    return filtered;
  } catch (err) {
    throw new Error(err);
  }
};

const findOne = function (cursor, query) {
  try {
    this.cursor = cursor;

    const collPath = `${this.root}/${this.cursor}.json`;
    if (!isFileExists(collPath)) {
      createCollection.call(this, cursor);
    }

    this.storage = JSON.parse(
      readFileSync(collPath, charset)
    );
    let filtered = null;
    if (query && typeof query === 'object') {
      const keys = Object.keys(query);
      // TODO: Improve
      filtered = this.storage.filter((doc) => {
        let include = true;
        keys.forEach((key) => {
          if (doc[key] !== query[key]) {
            include = false;
          }
        });
        return include;
      });
    }
    return filtered[0] || null;
  } catch (err) {
    throw new Error(err);
  }
};

const updateOne = function (cursor, filter, doc) {
  try {
    this.cursor = cursor;

    const collPath = `${this.root}/${this.cursor}.json`;
    if (!isFileExists(collPath)) {
      createCollection.call(this, cursor);
    }

    const storage = JSON.parse(
      readFileSync(collPath, charset)
    );

    const keys = Object.keys(filter);
    this.storage = storage.filter((doc) => {
      let include = true;
      keys.forEach((key) => {
        if (doc[key] === filter[key]) {
          include = false;
        }
      });
      return include;
    });
    const newDoc = { ...doc, updatedAt: new Date() };
    this.storage.push(newDoc);
    this.save();
    return newDoc;
  } catch (err) {
    throw new Error(err);
  }
};

const remove = function (cursor, query) {
  try {
    this.cursor = cursor;

    const collPath = `${this.root}/${this.cursor}.json`;
    if (!isFileExists(collPath)) {
      createCollection.call(this, cursor);
    }

    this.storage = JSON.parse(
      readFileSync(collPath, charset)
    );
    const keys = Object.keys(query);

    const storage = this.storage.filter((doc) => {
      let include = true;
      keys.forEach((key) => {
        if (doc[key] === query[key]) {
          include = false;
        }
      });
      return include;
    });
    this.storage = storage;
    this.save();
    return true;
  } catch (err) {
    throw new Error(err);
  }
};

// core API
function getCollections() {
  const collections = {};
  readDir(this.root).forEach((collName) => {
    // pattern: db.collections.{collName}.*()
    collections[collName] = {};
    collections[collName].insert = insert.bind(this, collName);
    collections[collName].insertMany = () => { }; // TODO
    collections[collName].find = find.bind(this, collName);
    collections[collName].findOne = findOne.bind(this, collName);
    collections[collName].update = () => { }; // TODO
    collections[collName].findOneAndUpdate = () => { }; // TODO
    collections[collName].updateOne = updateOne.bind(this, collName);
    collections[collName].updateMany = () => { }; // TODO
    collections[collName].remove = remove.bind(this, collName);
  });
  return collections;
}

function createCollection(collName, options = {}) {
  try {
    const path = `${this.root}/${collName}.json`;
    fs.writeFileSync(path, '[]', charset);
  } catch (err) {
    throw new Error(err);
  }
};

function dropCollection(collName) {
  try {
    const path = `${this.root}/${collName}.json`;
    if (!isFileExists(path)) return;
    fs.unlinkSync(path);
  } catch (err) {
    throw new Error(err);
  }
};

const _root = path.join(__dirname, '..', '.jsondb');

export default function JsonDB(root = _root) {
  try {
    this.root = root;
    this.cursor = null;
    this.storage = null;
    ensureDbSync.call(this);

    return () => {
      const collections = getCollections.call(this);

      const cursor = {
        ...collections
      };
      cursor.createCollection = createCollection.bind(this);
      cursor.dropCollection = dropCollection.bind(this);

      return cursor;
    };
  } catch (err) {
    throw new Error(err);
  }
}

JsonDB.prototype.save = function () {
  syncStorage.call(this);
  this.storage = null;
  this.cursor = null;
};
