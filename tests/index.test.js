const JsonDb = require('../dist');

let db;
let docs;

describe('JsonDB', () => {
  beforeAll(() => {
    db = new JsonDb();
  });

  test('initializing', () => {
    expect(typeof db).toBe('function');

    expect.objectContaining(db());
    expect(typeof db().createCollection).toBe('function');
    expect(typeof db().dropCollection).toBe('function');
  });

  test('creating and dropping a collection', () => {
    expect.not.objectContaining(db().posts);

    db().createCollection('posts');
    expect.objectContaining(db().posts);

    db().dropCollection('posts');
    expect.not.objectContaining(db().posts);
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
