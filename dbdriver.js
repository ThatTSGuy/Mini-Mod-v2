const Mongodb = require('mongodb').MongoClient;
const { Channel } = require('discord.js');
const config = require('./config.json');

const uri = `mongodb+srv://${config.dbuser}:${config.dbpass}@${config.dbcluster}.mfjtx.mongodb.net/?retryWrites=true&w=majority`;
const client = new Mongodb(uri, { useUnifiedTopology: true });

client.connect(err => {
    console.log('Database connected')
});

module.exports.getFilter = guildId => {
    return new Promise((res, rej) => {
        wordCollection = client.db(guildId).collection('words');
        phraseCollection = client.db(guildId).collection('phrases');
        channelCollection = client.db(guildId).collection(`channels`);
        categoryCollection = client.db(guildId).collection(`categories`);

        wordCollection.find({}).toArray(function (err, wordList) {
            phraseCollection.find({}).toArray(function (err, phraseList) {
                channelCollection.find({}).toArray(function (err, channelList) {
                    categoryCollection.find({}).toArray(function (err, categoryList) {
                        if (err) throw err;
                        res({
                            words: wordList,
                            phrases: phraseList,
                            channels: channelList,
                            categories: categoryList,
                        });
                    });
                });
            });
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


module.exports.newChannel = (guildId, channel) => {
    return new Promise((res, rej) => {
        channelCollection = client.db(guildId).collection('channels');
        channelCollection.find({ 'text': channel }).toArray(function (err, channelList) {
            if (channelList.length > 0) {
                res(true);
                return;
            } else {
                channelCollection.insertOne({ 'text': channel }, (err, result) => {
                    res(err ? true : false);
                });
            };
        });
    });
};



module.exports.newCategory = (guildId, category) => {
    return new Promise((res, rej) => {
        categoryCollection = client.db(guildId).collection('categories');
        categoryCollection.find({ 'text': category }).toArray(function (err, categoryList) {
            if (categoryList.length > 0) {
                res(true);
                return;
            } else {
                categoryCollection.insertOne({ 'text': category }, (err, result) => {
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


module.exports.deleteChannel = (guildId, channel) => {
    return new Promise((res, rej) => {
        channelCollection = client.db(guildId).collection('channels');
        channelCollection.deleteOne({ 'text': channel }, (err, result) => {
            res(result.result.n ? true : false);
        });
    });
};



module.exports.deleteCategory = (guildId, category) => {
    return new Promise((res, rej) => {
        categoryCollection = client.db(guildId).collection('categories');
        categoryCollection.deleteOne({ 'text': category }, (err, result) => {
            res(result.result.n ? true : false);
        });
    });
};
