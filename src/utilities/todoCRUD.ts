import {BaseUrl, ApiRoutes} from '../constants';

// update an item from the online API
export const UpdateItem = async (item: any) => {
  const {id, key, title, compeleted} = item;
  const options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      key,
      title,
      compeleted: compeleted,
    }),
  };
  const response = await fetch(
    BaseUrl + ApiRoutes.TO_DOS + id,
    options,
  ).then((response) => response.json());
  return response;
};

// delete an item from the online API
export const DeleteItem = async (item: any) => {
  const {id, key, title, compeleted} = item;
  const options = {
    method: 'DELETE',
    headers: {'Content-Type': 'application/json'},
  };
  const response = await fetch(
    BaseUrl + ApiRoutes.TO_DOS + id,
    options,
  ).then((response) => response.json());
  return response;
};
