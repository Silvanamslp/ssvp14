const MongoClient = require("mongodb").MongoClient;
const url = "mongodb+srv://sociedadesvp:lsnsjc@cluster0.vnqhu.mongodb.net/ssvp?retryWrites=true&w=majority";
const client = new MongoClient(url, { useUnifiedTopology: true });
//const client = new MongoClient("mongodb://localhost:27017", { useUnifiedTopology: true });
client.connect(function (err) {
    console.log('Connected to Database');
});

module.exports = client;