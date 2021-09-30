# @valet-is/jsondb

[![npm](https://img.shields.io/npm/v/@valet-is/jsondb?style=flat-square)](https://www.npmjs.com/package/@valet-is/jsondb)
[![license:MIT](https://img.shields.io/npm/l/@valet-is/jsondb?style=flat-square)](https://github.com/valet-is/jsondb/blob/master/LICENSE)

```bash
git clone git@github.com:valet-is/jsondb.git
cd jsondb
npm install
```

Run `npm test` to execute test suit.

### Usage

```bash
npm i @valet-is/jsondb
```

**App.js**

```js
import JsonDB from '@valet-is/jsondb';

const db = new JsonDB();

db().createCollection('posts');

db().posts.insert({ title: 'Post Title' });
db().posts.insertMany([{ title: 'Post Title 1' }, { title: 'Post Title 2' }]);

db().posts.find({});
db().posts.findOne({ id });

db().posts.updateOne({ id }, { greet: 'hello world!' });

db().posts.remove({ id });

db().dropCollection('posts');
```
