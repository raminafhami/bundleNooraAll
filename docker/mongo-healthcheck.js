const admin = db.getSiblingDB('admin');
if (!admin.auth(process.env.MONGO_INITDB_ROOT_USERNAME, process.env.MONGO_INITDB_ROOT_PASSWORD)) quit(1);
try {
  const status = admin.runCommand({ replSetGetStatus: 1 });
  if (!status.ok) throw status;
} catch (error) {
  if (error.code !== 94 && error.codeName !== 'NotYetInitialized') throw error;
  const result = admin.runCommand({ replSetInitiate: { _id: 'rs0', members: [{ _id: 0, host: 'mongo:27017' }] } });
  if (!result.ok) throw result;
  quit(1);
}
if (!admin.runCommand({ hello: 1 }).isWritablePrimary) quit(1);
