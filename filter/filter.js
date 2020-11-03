const filterWords = require('./filterList.json');

module.exports.filter = content => {
    let filtered = false;
    
    filterWords.words.forEach(word => {
        if (content.includes(word)) filtered = true;
    });

    filterWords.wordgroups.forEach(group => {
        if (content.includes(group)) filtered = true;
    });

    return filtered;
};