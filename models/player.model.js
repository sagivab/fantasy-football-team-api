const mongoose = require('mongoose');
const { allowedPositions } = require('../shared');

const DEFAULT_VALUE = 1000000;

const playerSchema = new mongoose.Schema({
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        age: {
            type: Number,
            required: true,
        },
        position: {
            type: String,
            enum: allowedPositions,
            required: true,
        },
        marketValue: {
            type: Number,
            default: DEFAULT_VALUE,
        },
        isOnMarket: {
            type: Boolean,
            default: false,
        },
        marketPrice: {
            type: Number,
            required: function() { return this.isOnMarket },
        },
    },
    { 
        collection: 'players'
    },
);


module.exports = mongoose.model('Player', playerSchema);

