import { CreateApi } from 'protolib/api'
import * as fs from 'fs';
import * as path from 'path';
import * as fspath from 'path';
import { DatabaseEntryModel, DatabaseModel } from './databasesSchemas';
import { connectDB, getDB } from 'protolib/api'
import { getRoot } from '../../api';

const dbDir = (root) => fspath.join(root, "/data/databases/")

function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

async function moveFolder(src, dest) {
  try {
      const timestamp = getTimestamp();
      const destTime = `${dest}_${timestamp}`;
      const parentDest = path.dirname(dest);
      await fs.promises.mkdir(parentDest, { recursive: true });
      await fs.promises.rename(src, destTime);
  } catch (error) {
      console.error('Error moving folder:', error);
  }
}

const customGetDB = (path, req, session) => {
  const db = {
    async *iterator() {
      const databases = await getDatabases();
      for (const db of databases) {
        yield [db.name, JSON.stringify(db)];
      }
    },

    async put(key, value) {
      value = JSON.parse(value)
      if (value._deleted) {
        const origin = fspath.join(dbDir(getRoot(req)), key)   
        const dest = fspath.join(getRoot(req), 'data', 'deleted_databases', key)  
        moveFolder(origin, dest)
        return
      }
      await connectDB(fspath.join(dbDir(getRoot(req)), fspath.basename(key)))
    },

    async *get(key) {
      const dbPath = fspath.join(dbDir(getRoot(req)), fspath.basename(key))
      const db = getDB(dbPath)
      yield* db.iterator()
    }
  };

  return db;
}

export const getDatabases = async () => {
  return (await fs.promises.readdir('../../' + path.join('data', 'databases'))).map((name) => {
    return {
      name: name
    }
  })
}

export const DatabasesAPI = CreateApi('databases', DatabaseModel, __dirname, '/adminapi/v1/', '', {}, () => { }, customGetDB, ['list', 'create', 'read', 'delete'], false, {
  paginatedRead: {model: DatabaseEntryModel},
  requiresAdmin: ['*']
})

export default DatabasesAPI