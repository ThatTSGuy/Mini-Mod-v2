const Mongodb = require('mongodb').MongoClient;
const config = require('./config.json');

const uri = `mongodb+srv://${config.dbuser}:${config.dbpass}@${config.dbcluster}.yc3lx.mongodb.net/?retryWrites=true&w=majority`;
const client = new Mongodb(uri, { useUnifiedTopology: true });

client.connect(err => {
    console.log('Database connected')
});

module.exports.getFilter = guildId => {
    return new Promise((res, rej) => {
        wordCollection = client.db(guildId).collection('words');
        phraseCollection = client.db(guildId).collection('phrases');
        roleCollection = client.db(guildId).collection('roles');
        channelCollection = client.db(guildId).collection('channels');

        wordCollection.find({}).toArray(function (err, wordList) {
            phraseCollection.find({}).toArray(function (err, phraseList) {
                roleCollection.find({}).toArray(function (err, roleList) {
                    channelCollection.find({}).toArray(function (err, channelList) {
                        if (err) throw err;
                        res({
                            words: wordList,
                            phrases: phraseList,
                            roles: roleList,
                            channels: channelList,
                        });
                    });
                });
            });
        });
    });
};

module.exports.newFilter = (guildId, type, text) => {
    return new Promise((res, rej) => {
        collection = client.db(guildId).collection(type + 's');
        collection.find({ 'text': text }).toArray(function (err, list) {
            if (list.length > 0) {
                res(true);
                return;
            } else {
                collection.insertOne({ 'text': text }, (err, result) => {
                    res(err ? true : false);
                });
            };
        });
    });
};

module.exports.removeFilter = (guildId, type, text) => {
    return new Promise((res, rej) => {
        collection = client.db(guildId).collection(type + 's');
        collection.deleteOne({ 'text': text }, (err, result) => {
            res(result.result.n ? false : true);
        });
    })
};