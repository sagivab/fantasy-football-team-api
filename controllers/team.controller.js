const faker = require('faker');
const ApiError = require('../error/api-error');
const mongoose = require('mongoose');
const Team = require('../models/team.model');
const Player = require('../models/player.model');
const User = require('../models/user.model');
const { addPlayer } = require('./player.controller');
const { capitalizeFirstLetter, isPropertyIsAllowedToUpdate } = require('../shared');

exports.createTeam = async (playersToAdd = [], name) => {
    try {

        const team = await Team.create({ name, country: faker.address.country() })
        playersToAdd.forEach(player => {
            for(let i = 0; i < player.num; i++) {
                let newPlayer = addPlayer(faker.name.firstName(), faker.name.lastName(), faker.address.country(), player.position);
                team.players.push(newPlayer._id);
            }
        });

        await team.save();

        return team;
    } catch(error) {
        console.log(error);
        return null;
    }
}

exports.createTeamExtended = async (req, res, next) => {
    try {
        const { players } = req.body;

        let teamName = faker.name.firstName();
        while(await Team.findOne({ name: teamName })) {
            teamName = faker.name.firstName();
        }

        const team = await this.createTeam(players, teamName);
        if(team) {
            return res.status(201).json({ message: 'Team created successfully', team})
        }

        return next(new ApiError());
    } catch(error) {
        console.log(error);
        return next(new ApiError());
    }
}

exports.updateTeam = async (req, res, next) => {
    const { team, user, body } = req;

    try {
        for(let property in body) {
            if(isPropertyIsAllowedToUpdate(property, user.role, 'team')) {
                if(typeof req.body[property] === 'string') {
                    body[property] = capitalizeFirstLetter(body[property]);
                }
                team[property] = body[property];
            }
        }

        team.save();

        return res.status(200).json({ team });
    } catch(error) {
        console.log(error);
        return next(new ApiError())
    }
}

exports.deleteTeam = async (team_id) => {
    try {
        team_id = mongoose.Types.ObjectId(team_id);
        const team = await Team.findOneAndDelete({ _id: team_id });

        if(!team) {
            return true;
        }
        await Player.deleteMany({ _id: team.players });

        return true;
    } catch(error) {
        console.log(error);
        return false;
    }
}

exports.deleteTeamExtended = async (req, res, next) => {
    try {

        if(await this.deleteTeam(req.team._id)) {
            return res.status(202).json({ message: 'Team deleted successfully'})
        }

        return next(new ApiError());
    } catch(error) {
        console.log(error);
        return next(new ApiError());
    }
}

exports.getTeamAndUser = async (req, res, next) => {
    const { id } = req.params;
    const { user_id } = req.session;
    
    try {
        if(!mongoose.Types.ObjectId.isValid(id)) {
            return next(ApiError.badRequest('Invalid team id'))
        }
        const team = await Team.findById(id);

        if(!team) {
            return next(ApiError.notFound('Team not found'));
        }

        const currentUser = await User.findById(user_id);
        if(!currentUser) {
            return next(ApiError.unauthorized('Please login'));
        }

        req.user = currentUser;
        req.team = team;

        return next();
    } catch(error) {
        console.log(error);
        return next(new ApiError());
    }
}

exports.isTeamOwner = async (req, res, next) => {
    const { user, team } = req;

    switch (user.role) {
        case 'basic':
            if(user.teamOwn.toString() !== team._id.toString()) {
                return next(ApiError.unauthorized());
            }
        case 'administrator':
            return next();
        default:
            return next(new ApiError());
    }
}

const getTeamValue = async (team) => {
    try {
        if(!team) {
            return null;
        }

        const totalvalue = await Player.aggregate([
            {
                $match: { _id: { '$in': team.players } }
            },
            {
                $group:
                {
                    _id: null,
                    totalValue: { $sum: '$marketValue' }
                }
            },
            {
                $project:
                {
                    _id: 0,
                    totalValue: '$totalValue'
                }
            }
        ]);

        return totalvalue[0].totalValue;
    } catch(error) {
        console.log(error);
        return null;
    }
}

exports.getTeam = async (req, res, next) => {
    const { team } = req;

    const totalValue = await getTeamValue(team);
    if(totalValue === null) {
        return next(new ApiError());
    }
    
    let teamObj = await team.toObject();
    teamObj.totalValue = totalValue;

    return res.status(200).json({ team: teamObj });
}

exports.getAllTeams = async (req, res, next) => {
    try {
        const teams = await Team.find();
        return res.status(200).json({ teams });
    } catch(error) {
        console.log(error);
        return next(new ApiError());
    }
}