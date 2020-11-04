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

module.exports.newWord = (guildId, word) => {
    return new Promise((res, rej) => {
        wordCollection = client.db(guildId).collection('words');
        wordCollection.find({}).toArray(function (err, wordList) {
            if (wordList.length > 0) res(true); 
        });
        wordCollection.insertOne({ 'text': word }, (err, result) => {
            res(err ? true : false);
        });
    });
};

module.exports.newPhrase = (guildId, phrase) => {
    return new Promise((res, rej) => {
        phraseCollection = client.db(guildId).collection('phrases');
        phraseCollection.find({}).toArray(function (err, phraseList) {
            if (phraseList.length > 0) res(true); 
        });
        phraseCollection.insertOne({ 'text': phrase }, (err, result) => {
            res(err ? true : false);
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