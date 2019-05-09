 db = db.getSiblingDB('dine');
 db.createUser(
    {
      user: "dine",
      pwd: "out",
      roles: [ "readWrite", "dbAdmin" ]
    }
 )
 db.new_collection.insert({ some_key: "some_value" })