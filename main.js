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

  get name() {
    return this.#name;
  }

  get friends() {
    return this.#friends;
  }
}

class People {
  #members = {};

  constructor(people) {
    people.forEach((person) => {
      this.#members[person.id] = new Person(person);
    });
  }

  get #allMembersAllFriends() {
    return this.#keys.reduce((res, id) => {
      res.push(...this.getFriendsByMemberId(id));
      return res;
    }, []);
  }

  get #keys() {
    return Object.keys(this.#members);
  }

  get keys() {
    return this.#keys;
  }

  get members() {
    return this.#members;
  }

  get size() {
    return this.#keys.length;
  }

  #timesInFriendsByMemberId(id) {
    return this.#allMembersAllFriends.filter((item) => item === Number(id))
      .length;
  }

  getMemberById(id) {
    return this.members[id];
  }

  getFriendsByMemberId(id) {
    return this.getMemberById(id).friends;
  }

  getNotFriendsByMemberId(id) {
    return this.#keys
      .map((memberId) => Number(memberId))
      .filter(
        (memberId) =>
          memberId !== id && !this.getFriendsByMemberId(id).includes(memberId)
      );
  }

  getMembersIdsByDescPopularity() {
    return [...this.#keys].sort((prevId, nextId) =>
      this.#timesInFriendsByMemberId(prevId) ===
      this.#timesInFriendsByMemberId(nextId)
        ? this.getMemberById(prevId).name.toLowerCase() <
          this.getMemberById(nextId).name.toLowerCase()
          ? -1
          : 1
        : this.#timesInFriendsByMemberId(nextId) -
          this.#timesInFriendsByMemberId(prevId)
    );
  }
}

class App {
  #OUTPUT_VALUES_COUNT = 3;
  #people = null;
  #elementsRefs = {};
  #handlers = {};

  constructor() {
    this.#elementsRefs.container = document.querySelector('#container');
    this.#elementsRefs.contactList = document.querySelector('.contacts-list');
    this.#elementsRefs.backBtn = document.querySelector('.back');
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
    this.#handlers.backBtnClicked = () => {
      this.#elementsRefs.selectedPerson.classList.remove('active');
      this.#elementsRefs.selectedPerson = null;
      this.#elementsRefs.container.classList.remove('details');
    };

    this.#elementsRefs.backBtn.addEventListener(
      'click',
      this.#handlers.backBtnClicked
    );
  }

  getPeople() {
    return this.#people;
  }

  init(peopleData) {
    this.#people = new People(peopleData);

    if (this.#people.size === 0) {
      alert('Nothing to display');
    } else {
      this.afterInit();
    }
  }

  afterInit() {
    this.displayPeople();
  }

  displayPeople() {
    const contacts = document.createDocumentFragment();
    let itemIndex = 0;

    this.#people.keys.forEach((memberId) => {
      const nameElement = document.createElement('strong');
      const contactElement = document.createElement('li');
      contactElement.setAttribute('data-id', memberId);
      contactElement.setAttribute('style', `--index: ${itemIndex++};`);
      contactElement.addEventListener('click', this.#handlers.personClicked);
      nameElement.textContent = this.#people.getMemberById(memberId).name;
      contactElement.append(nameElement);
      contacts.append(contactElement);
    });
    this.#elementsRefs.contactList.append(contacts);
  }

  setPersonDetails(personId) {
    const randomFriendsIds = this.getRandomValuesByQuantity(
      this.#people.getFriendsByMemberId(personId),
      this.#OUTPUT_VALUES_COUNT
    );
    const randomNotFriendsIds = this.getRandomValuesByQuantity(
      this.#people.getNotFriendsByMemberId(personId),
      this.#OUTPUT_VALUES_COUNT
    );
    const membersIdByDescPopularity =
      this.#people.getMembersIdsByDescPopularity();

    for (let i = 0; i < this.#OUTPUT_VALUES_COUNT; i++) {
      this.#elementsRefs.friendsNames[i].textContent =
        this.#people.getMemberById(randomFriendsIds[i]).name;
      this.#elementsRefs.notFriendsNames[i].textContent =
        this.#people.getMemberById(randomNotFriendsIds[i]).name;
      this.#elementsRefs.topFromFriendsNames[i].textContent =
        this.#people.getMemberById(membersIdByDescPopularity[i]).name;
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
