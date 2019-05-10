 db = db.getSiblingDB('dine');
 db.createUser(
    {
      user: "dine",
      pwd: "out",
      roles: [ "readWrite", "dbAdmin" ]
    }
 )
 db.new_collection.insert({ some_key: "some_value" })

db.getProfilingLevel()
db.setProfilingLevel(2)
db.getProfilingLevel()
db.setLogLevel(5, "query")
db.system.profile.find().pretty()
