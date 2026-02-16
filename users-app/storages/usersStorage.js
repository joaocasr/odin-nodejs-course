// storages/usersStorage.js
// This class lets us simulate interacting with a database.
import { faker } from '@faker-js/faker';

class UsersStorage {
  constructor() {
    this.storage = {};
    this.id = 0;
    for(let i=0;i<30;i++){
      this.storage[this.id]={"id":this.id,"firstName":faker.person.firstName(),"lastName":faker.person.lastName(),"email":faker.internet.email(),"age":Math.floor(Math.random() * 10) + 3,}
      this.id+=1;
    }
  }

  addUser({ id, firstName, lastName, email, age, bio }) {
    id = this.id;
    this.storage[id] = { id, firstName, lastName, email, age, bio };
    this.id++;
  }

  getUsers() {
    return Object.values(this.storage);
  }

  getUser(id) {
    return this.storage[id];
  }

  updateUser(id, { firstName, lastName, email, age, bio }) {
    this.storage[id] = { id, firstName, lastName, email, age, bio };
  }

  deleteUser(id) {
    delete this.storage[id];
  }
  searchUsers(name){
    let users = {}
    for(const user of Object.values(this.storage)) {
      if(user.firstName?.toLowerCase().includes(name.toLowerCase()) || user.lastName?.toLowerCase().includes(name.toLowerCase())){
        users[user.id]=user
      }
    }
    return Object.values(users);
  }
}
// Rather than exporting the class, we can export an instance of the class by instantiating it.
// This ensures only one instance of this class can exist, also known as the "singleton" pattern.
export default new UsersStorage();
