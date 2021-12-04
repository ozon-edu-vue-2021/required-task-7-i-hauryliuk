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

class People {
  #members = {};

  constructor(people) {
    people.forEach((person) => (this.#members[person.id] = new Person(person)));
  }

  getMembers() {
    return this.#members;
  }

  getMemberById(id) {
    return this.#members[id];
  }
}

class App {
  #people;
  #elementsRefs = {};

  constructor() {
    this.#people = null;
    this.#elementsRefs.contactList = document.querySelector('.contacts-list');
  }

  init(peopleData) {
    this.#people = new People(peopleData);
    if (Object.keys(this.#people.getMembers()).length === 0) {
      alert('Nothing to display');
    } else {
      this.afterInit();
    }
  }

  afterInit() {
    console.log(this);
    this.displayPeople();
  }

  displayPeople() {
    const contacts = document.createDocumentFragment();
    let itemIndex = 0;
    Object.keys(this.#people.getMembers()).forEach((memberId) => {
      const nameElement = document.createElement('strong');
      const contactElement = document.createElement('li');
      contactElement.setAttribute('data-id', memberId);
      contactElement.setAttribute('style', `--index: ${itemIndex++};`);
      nameElement.textContent = this.#people.getMemberById(memberId).getName();
      contactElement.append(nameElement);
      contacts.append(contactElement);
    });
    this.#elementsRefs.contactList.append(contacts);
  }
}

const app = new App();

peopleApi
  .getPeople()
  .then((data) => {
    app.init(data);
  })
  .catch((error) => {
    console.log(error);
  });
