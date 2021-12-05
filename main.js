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
    const membersInFriendsAllOccurrence = people.reduce((res, person) => {
      res.push(...person.friends);
      return res;
    }, []);

    people.forEach((person) => {
      this.#members[person.id] = {};
      this.#members[person.id].person = new Person(person);
      this.#members[person.id].timesInFriends =
        membersInFriendsAllOccurrence.filter(
          (item) => item === person.id
        ).length;
    });
  }

  getMembers() {
    return this.#members;
  }

  getMemberById(id) {
    return this.#members[id].person;
  }

  getMemberFriendsById(id) {
    return this.#members[id].person.getFriends();
  }

  getMemberNotFriendsById(id) {
    return Object.keys(this.#members)
      .map((memberId) => Number(memberId))
      .filter(
        (memberId) =>
          memberId !== id &&
          !this.#members[id].person.getFriends().includes(memberId)
      );
  }

  getMembersIdByDescPopularity() {
    return Object.keys(this.#members).sort((prev, next) =>
      this.#members[prev].timesInFriends === this.#members[next].timesInFriends
        ? this.#members[prev].person.getName().toLowerCase() <
          this.#members[next].person.getName().toLowerCase()
          ? -1
          : 1
        : this.#members[next].timesInFriends -
          this.#members[prev].timesInFriends
    );
  }
}

class App {
  #OUTPUT_VALUES_COUNT = 3;
  #people;
  #elementsRefs = {};
  #handlers = {};

  constructor() {
    this.#people = null;
    this.#elementsRefs.container = document.querySelector('#container');
    this.#elementsRefs.contactList = document.querySelector('.contacts-list');
    this.#elementsRefs.friendsNames =
      document.querySelectorAll('.friends-name');
    this.#elementsRefs.notFriendsNames =
      document.querySelectorAll('.not-friends-name');
    this.#elementsRefs.topFromFriendsNames = document.querySelectorAll(
      '.top-from-friends-name'
    );
    this.#handlers.personClicked = (event) => {
      this.#elementsRefs.selectedPerson = event.currentTarget;
      this.setPersonDetails(
        Number(this.#elementsRefs.selectedPerson.dataset.id)
      );
      this.#elementsRefs.selectedPerson.classList.add('active');
      this.#elementsRefs.container.classList.add('details');
    };
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
      contactElement.addEventListener('click', this.#handlers.personClicked);
      nameElement.textContent = this.#people.getMemberById(memberId).getName();
      contactElement.append(nameElement);
      contacts.append(contactElement);
    });
    this.#elementsRefs.contactList.append(contacts);
  }

  setPersonDetails(personId) {
    const randomFriendsIds = this.getRandomValuesByQuantity(
      this.#people.getMemberFriendsById(personId),
      this.#OUTPUT_VALUES_COUNT
    );
    const randomNotFriendsIds = this.getRandomValuesByQuantity(
      this.#people.getMemberNotFriendsById(personId),
      this.#OUTPUT_VALUES_COUNT
    );
    const membersIdByDescPopularity =
      this.#people.getMembersIdByDescPopularity();

    for (let i = 0; i < this.#OUTPUT_VALUES_COUNT; i++) {
      this.#elementsRefs.friendsNames[i].textContent = this.#people
        .getMemberById(randomFriendsIds[i])
        .getName();
      this.#elementsRefs.notFriendsNames[i].textContent = this.#people
        .getMemberById(randomNotFriendsIds[i])
        .getName();
      this.#elementsRefs.topFromFriendsNames[i].textContent = this.#people
        .getMemberById(membersIdByDescPopularity[i])
        .getName();
    }
  }

  getRandomValuesByQuantity(list, quantity) {
    function getRandomIntegerFromTo(min, max) {
      let from = Math.ceil(min);
      let to = Math.floor(max);
      return Math.floor(Math.random() * (to - from) + from);
    }

    const result = [];
    while (result.length < quantity) {
      const randomValue = list[getRandomIntegerFromTo(0, list.length)];
      if (!result.includes(randomValue)) {
        result.push(randomValue);
      }
    }

    return result;
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
