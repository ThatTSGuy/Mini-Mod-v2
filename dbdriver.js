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

        wordCollection.find({}).toArray(function (err, wordList) {
            phraseCollection.find({}).toArray(function (err, phraseList) {
                if (err) throw err;
                res({
                    words: wordList,
                    phrases: phraseList,
                });
            });
        });
    });
};

module.exports.newFilter = (guildId, type, text) => {
    return new Promise((res, rej) => {
        collection = client.db(guildId).collection(type);
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

module.exports.newWord = (guildId, word) => {
    return new Promise((res, rej) => {
        wordCollection = client.db(guildId).collection('words');
        wordCollection.find({ 'text': word }).toArray(function (err, wordList) {
            if (wordList.length > 0) {
                res(true);
                return;
            } else {
                wordCollection.insertOne({ 'text': word }, (err, result) => {
                    res(err ? true : false);
                });
            };
        });
    });
};

module.exports.newPhrase = (guildId, phrase) => {
    return new Promise((res, rej) => {
        phraseCollection = client.db(guildId).collection('phrases');
        phraseCollection.find({ 'text': phrase }).toArray(function (err, phraseList) {
            if (phraseList.length > 0) {
                res(true);
                return;
            } else {
                phraseCollection.insertOne({ 'text': phrase }, (err, result) => {
                    res(err ? true : false);
                });
            };
        });
    });
};

module.exports.newRoleExeption = (guildId, roleExeption) => {
    return new Promise((res, rej) => {
        roleExeptionCollection = client.db(guildId).collection('roleExeptions');
        roleExeptionCollection.find({ 'text': roleExeption }).toArray(function (err, roleExeptionList) {
            if (roleExeptionList.length > 0) {
                res(true);
                return;
            } else {
                roleExeptionCollection.insertOne({ 'text': roleExeption }, (err, result) => {
                    res(err ? true : false);
                });
            };
        });
    });
};

module.exports.newRoleExeption = (guildId, phrase) => {
    return new Promise((res, rej) => {
        phraseCollection = client.db(guildId).collection('phrases');
        phraseCollection.find({ 'text': phrase }).toArray(function (err, phraseList) {
            if (phraseList.length > 0) {
                res(true);
                return;
            } else {
                phraseCollection.insertOne({ 'text': phrase }, (err, result) => {
                    res(err ? true : false);
                });
            };
        });
    });
};

module.exports.deleteWord = (guildId, word) => {
    return new Promise((res, rej) => {
        wordCollection = client.db(guildId).collection('words');
        wordCollection.deleteOne({ 'text': word }, (err, result) => {
            res(result.result.n ? true : false);
        });
    })
};

module.exports.deletePhrase = (guildId, phrase) => {
    return new Promise((res, rej) => {
        phraseCollection = client.db(guildId).collection('phrases');
        phraseCollection.deleteOne({ 'text': phrase }, (err, result) => {
            res(result.result.n ? true : false);
        });
    });
};