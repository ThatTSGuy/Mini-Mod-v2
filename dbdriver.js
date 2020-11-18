const Mongodb = require('mongodb').MongoClient;
const config = require('./config.json');

const uri = `mongodb+srv://${config.dbuser}:${config.dbpass}@${config.dbcluster}.yc3lx.mongodb.net/?retryWrites=true&w=majority`;
const client = new Mongodb(uri, { useUnifiedTopology: true });

client.connect(err => {
    console.log('Database connected')
});

module.exports.getFilter = guildId => {
    return new Promise((res, rej) => {
        filterCollection = client.db(guildId).collection('filters');
        roleCollection = client.db(guildId).collection('roles');
        channelCollection = client.db(guildId).collection('channels');

        filterCollection.find({}).toArray(function (err, filterList) {
            if (err) throw err;
            roleCollection.find({}).toArray(function (err, roleList) {
                if (err) throw err;
                channelCollection.find({}).toArray(function (err, channelList) {
                    if (err) throw err;
                    res({
                        filters: filterList,
                        roles: roleList,
                        channels: channelList,
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

module.exports.settings = (guildId, setting, value) => {
    return new Promise((res, rej) => {
        settings = client.db(guildId).collection('settings');
        settings.updateOne({ 'setting': setting }, { $set: { 'value': value } }, (err, result) => {
            res(err);
        });
    })
};

module.exports.getSettings = guildId => {
    return new Promise((res, rej) => {
        settings = client.db(guildId).collection('settings');
        settings.find({}).toArray(function (err, settingsList) {
            if (err) throw err;
            res(settingsList);
        });
    })
};