const mongoose = require('mongoose');
const Player = require('../models/player.model');
const User = require('../models/user.model');
const Team = require('../models/team.model');
const faker = require('faker');
const ApiError = require('../error/api-error');
const { getRandomNumber, capitalizeFirstLetter, isPropertyIsAllowedToUpdate, MIN_AGE_PLAYER, MAX_AGE_PLAYER, allowedPositions } = require('../shared');



exports.addPlayer = (firstName, lastName, country, position) => {
    try {
        const newPlayer = new Player({
            firstName,
            lastName,
            country,
            position,
            age: getRandomNumber(MIN_AGE_PLAYER, MAX_AGE_PLAYER),
        });

        newPlayer.save();

        return newPlayer;
    } catch(error) {
        console.log(error);
        return null;
    }
};

exports.createPlayer = async (req, res, next) => {
    try {

        const { marketPrice, teamOwn } = req.body;
        const position = allowedPositions[getRandomNumber(0, allowedPositions.length)];
        let team = null;

        if(teamOwn) {
            team = await Team.findById(teamOwn);

            if(!team) {
                return next(ApiError.notFound('Team not found'));
            }
        }

        const newPlayer = await this.addPlayer(faker.name.firstName(), faker.name.lastName(), faker.address.country(), position);

        if(marketPrice) {
            setOnMarketAndUpdatePrice(newPlayer, marketPrice);
        }

        if(team) {
            team.players.push(newPlayer._id);
            team.save();
        }

        return res.status(201).json({ player: newPlayer })
    } catch(error) {
        console.log(error);
        return next(new ApiError());
    }
}

exports.deletePlayer = async (player_id) => {
    try {
            player_id = mongoose.Types.ObjectId(player_id)
            await Team.findOneAndUpdate({ players: player_id },
            {
                $pull: { players: player_id },
            },
            { new: true }
        );

        await Player.deleteOne({ _id: player_id });

        return true;
    } catch(error) {
        console.log(error);
        return false;
    }
}

exports.deletePlayerdExtended = async (req, res, next) => {
    try {

        if(await this.deletePlayer(req.player._id)) {
            return res.status(202).json({ message: 'Player deleted successfully'})
        }

        return next(new ApiError());
    } catch(error) {
        console.log(error);
        return next(new ApiError());
    }
}

const setOnMarketAndUpdatePrice = (player, marketPrice) => {
    player.isOnMarket = true;
    player.marketPrice = marketPrice;
}

exports.updatePlayer = (req, res, next) => {
    const { player, user, body } = req;

    try {
        if(!body.hasOwnProperty('isOnMarket')) {
            delete body.marketPrice;
        }
        for(let property in body) {
            if(isPropertyIsAllowedToUpdate(property, user.role, 'player')) {
                if(typeof body[property] === 'string'){
                    body[property] = capitalizeFirstLetter(body[property]);
                }
                player[property] = body[property];
            }
        }

        player.save();

        return res.status(200).json({ player });
    } catch(error) {
        console.log(error);
        return next(new ApiError());
    }
}

const isTeamOwner = async (player, user) => {
    //Get the player's team(if exist)
    const team = await Team.findOne({ players: mongoose.Types.ObjectId(player._id) }, { _id:1 });
    return team ? team.equals(user.teamOwn) : false;
}

exports.getPlayer = async (req, res, next) => {
    const { player, user } = req
    
    if(await isTeamOwner(player, user) || user.role === 'administrator' || player.isOnMarket) {
        return res.status(200).json({ player: req.player });
    } 

    return next(ApiError.unauthorized());
};


exports.getPlayersTransferList = async (req, res, next) => {
    const { firstName, lastName, country, minPrice, maxPrice, teamName } = req.query;
    const marketPriceMin = minPrice || 1;
    const marketPriceMax = maxPrice || Number.MAX_SAFE_INTEGER;

    const queryToDB = {
        isOnMarket: true,
        marketPrice:
        {
            $gte: marketPriceMin, $lte: marketPriceMax
        },
    };

    try {
        queryToDB.firstName = { '$regex': firstName || '', '$options': 'i' };
        queryToDB.lastName = { '$regex': lastName || '', '$options': 'i '};
        queryToDB.country = { '$regex': country ? '^'+country+'$' : '', '$options': 'i' };
        if(teamName) {
            queryToDB.teamName = { '$regex': '^'+teamName+'$', '$options': 'i' };;
        }
        const players = await Player.aggregate([
            { $lookup:
                {
                    from: 'teams', localField: '_id', foreignField: 'players', as: 'team'
                }
            },
            { $addFields:
                {
                    teamName: '$team.name'
                }
            },
            { $unwind:
                {
                    path: '$teamName',
                    preserveNullAndEmptyArrays: true,
                }
            },
            { $project:
                {
                    team: 0
                }
            },
            { $match: queryToDB }
        ]);

        return res.status(200).json({players});
    } catch(error) {
        console.log(error);
    }

    return res.json();
}

exports.buyPlayer = async (req, res, next) => {
    const { user, player } = req;

    try {
        const buyingTeam = await Team.findById(user.teamOwn);
        const sellingTeam = await Team.findOne({ players: player._id });

        if(sellingTeam && sellingTeam._id.toString() === user.teamOwn.toString()) {
            return next(ApiError.badRequest('Assigned team sell and buy is the same'));
        }
        if(!player.isOnMarket) {
            return next(ApiError.unauthorized('Player isn\'t on the transfer list'));
        }
        if(buyingTeam.budget < player.marketPrice) {
            return next(ApiError.unauthorized('insufficient fund'))
        }

        buyingTeam.budget -= player.marketPrice;
        buyingTeam.players.push(player._id);
        buyingTeam.save();

        //remove player from selling team and update budget if player is assigned to a team.
        await Team.findOneAndUpdate({ players: player._id },
            {
                $pull: { players: player._id },
                $inc: { budget: player.marketPrice }
            },
            { new: true }
        );

        player.isOnMarket = false;
        player.marketValue += getRandomNumber(10, 100)*player.marketValue/100;
        await player.save();

        return res.status(200).json({ message: 'Player transferd to the new team successfully', player });
    } catch(error) {
        console.log(error);
        return(next(new ApiError()));
    }

}

exports.sellPlayer = async (req, res, next) => {
    const { player } = req;
    const { marketPrice } = req.body;

    try {
        setOnMarketAndUpdatePrice(player, marketPrice);

        player.save();

        return res.status(200).json({ message: `Marked player to sell with price:${marketPrice}$`, player });
    } catch (error) {
        console.log(error);
        return ApiError.badRequest(error);
    }
};

exports.getPlayerAndUser = async (req, res, next) => {
    const { id } = req.params;
    const { user_id } = req.session;

    try {
        if(!mongoose.Types.ObjectId.isValid(id)) {
            return next(ApiError.badRequest('Invalid player id'))
        }
        const player = await Player.findById(id);

        if(!player) {
            return next(ApiError.notFound('Player not found'));
        }

        const currentUser = await User.findById(user_id);

        if(!currentUser) {
            return next(ApiError.unauthorized('Please login'));
        }

        req.user = currentUser;
        req.player = player;

        return next();
    } catch(error) {
        console.log(error);
        return next(new ApiError());
    }
}

exports.isOwner = async (req, res, next) => {
    const { user, player } = req;

    switch (user.role) {
        case 'basic':
            const isUserTeamOwner = await isTeamOwner(player, user);
            if(!isUserTeamOwner) {
                return next(ApiError.unauthorized());
            }
        case 'administrator':
            return next();
        default:
            return next(new ApiError());
    }
}

exports.getAllplayers = async (req, res, next) => {
    try {
        const players = await Player.find();
        return res.status(200).json({ players });
    } catch(error) {
        console.log(error);
        return next(new ApiError());
    }
}