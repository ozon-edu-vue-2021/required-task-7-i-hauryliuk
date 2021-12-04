'use strict';

class peopleApi {
  static #url = './data.json';

  static async getPeople() {
    try {
      const response = await fetch(peopleApi.#url);
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      const results = await response.json();
      return results;
    } catch (err) {
      console.log(err);
      return [];
    }
  }
}

peopleApi
  .getPeople()
  .then((data) => {
    console.log(data);
  })
  .catch((error) => {
    console.log(error);
  });
