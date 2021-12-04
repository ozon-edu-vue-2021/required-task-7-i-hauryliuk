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
    } catch (error) {
      console.log(error);
      return [];
    }
  }
}

class Person {
  #id;
  #name;
  #friends;
  constructor(personData) {
    this.#id = personData.id;
    this.#name = personData.name;
    this.#friends = personData.friends;
  }
  getId() {
    return this.#id;
  }
  getName() {
    return this.#name;
  }
  getFriends() {
    return this.#friends;
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
