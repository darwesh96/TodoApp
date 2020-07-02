import Realm from 'realm';
import {todoItem, insertedItem} from '../interfaces';

// define the db schema
export const TODO_SCHEMA = 'Todo';

// Define the todo model and it's properties
export const TodoSchema = {
  name: TODO_SCHEMA,
  primaryKey: 'id',
  properties: {
    id: {type: 'int', default: 1},
    key: {type: 'string', default: 1},
    title: 'string',
    compeleted: 'bool',
  },
};

// db options
const databaseOptions = {
  path: 'Todo.realm',
  schema: [TodoSchema],
  schemaVersion: 0, //optional
};

//insert new item in the database
export const insertNewItem = (newItem: insertedItem) =>
  new Promise((resolve, reject) => {
    Realm.open(databaseOptions)
      .then((realm) => {
        const results: Array<todoItem> | any = realm
          .objects(TODO_SCHEMA)
          .sorted('id');
        const incremment_id =
          results.length > 0 ? results[results.length - 1].id + 1 : 1;
        realm.write(() => {
          realm.create(TODO_SCHEMA, {
            id: incremment_id,
            key: incremment_id.toString(),
            ...newItem,
          });
          resolve(newItem);
        });
      })
      .catch((error) => reject(error));
  });

//update an excesting item
export const updateItem = (newItem: todoItem) =>
  new Promise((resolve, reject) => {
    const {id, key, title, compeleted} = newItem;
    Realm.open(databaseOptions)
      .then((realm) => {
        let itemToUpdate: any = realm.objectForPrimaryKey(TODO_SCHEMA, id);
        realm.write(() => {
          itemToUpdate.title = title;
          itemToUpdate.compeleted = compeleted;
          resolve();
        });
      })
      .catch((error) => reject(error));
  });

// delete an item
export const deleteItem = (id: number) =>
  new Promise((resolve, reject) => {
    Realm.open(databaseOptions)
      .then((realm) => {
        realm.write(() => {
          let itemToDelete = realm.objectForPrimaryKey(TODO_SCHEMA, id);
          realm.delete(itemToDelete);
          resolve();
        });
      })
      .catch((error) => reject(error));
  });

// get all items for the database
export const queryAllItems = () =>
  new Promise((resolve, reject) => {
    Realm.open(databaseOptions)
      .then((realm) => {
        let allItems = realm.objects(TODO_SCHEMA);
        resolve(allItems);
      })
      .catch((error) => {
        reject(error);
      });
  });
export default new Realm(databaseOptions);
