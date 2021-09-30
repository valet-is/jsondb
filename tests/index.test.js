const JsonDb = require('../dist');

let db;
let docs;

describe('JsonDB', () => {
  beforeAll(() => {
    db = new JsonDb();
  });

  test('initializing', () => {
    expect(typeof db).toBe('function');

    const cursor = db();
    expect.objectContaining(cursor);
    expect(typeof cursor.createCollection).toBe('function');
    expect(typeof cursor.dropCollection).toBe('function');
  });

  test('creating and dropping a collection', () => {
    let cursor = db();
    expect.not.objectContaining(cursor.posts);

    cursor.createCollection('posts');
    cursor = db();
    expect.objectContaining(cursor.posts);

    cursor.dropCollection('posts');
    cursor = db();
    expect.not.objectContaining(cursor.posts);
  });

  test('insert a new doc', () => {
    db().createCollection('posts');
    docs = db().posts.find({ a: 1 });
    expect(docs.length).toBe(0);

    db().posts.insert({ a: 1 });
    docs = db().posts.find({ a: 1 });
    expect(docs.length).toBe(1);
  });
});
