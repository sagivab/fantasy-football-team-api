const mongoose = require('mongoose');
require('./player.model');

const DEFAULT_BUDGET = 5000000;

const teamSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
            unique: true,
        },
        country: {
            type: String,
            required: true,
        },
        budget: {
            type: Number,
            default: DEFAULT_BUDGET,
        },
        players: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Player',
        },
    },
    { 
        collection: 'teams'
    },
);

module.exports = mongoose.model('Team', teamSchema);