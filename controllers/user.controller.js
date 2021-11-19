const User = require('../models/user.model');
const Team = require('../models/team.model');
const mongoose = require('mongoose');
const faker = require('faker');
const ApiError = require('../error/api-error');
const { createTeam, deleteTeam } = require('./team.controller');


exports.registerUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;


        if(await User.findOne({ email })) {
            return next(ApiError.hasConflict('Email already in use'));
        }
        const newUser = new User({ email });
        //createTeam teamOwn = createTeam(props) - for now hard coded teamOwn

        let teamName = faker.name.firstName();
        while(await Team.findOne({ name: teamName })) {
            teamName = faker.name.firstName();
        }

        const teamOwn = await createTeam([
            { position: 'Goalkeeper', num: 3 },
            { position: 'Defender', num: 6 },
            { position: 'Midfielder', num: 6 },
            { position: 'Attacker', num: 5 }, ],
            teamName
        );

        newUser.teamOwn = teamOwn._id;
        newUser.hashedPassword = await newUser.encryptPassword(password);
        if(req.roleFromUser) {
            newUser.role = req.roleFromUser;
        }

        await newUser.save();

        res.status(201).json({ message: `User created successfully with the following email:${newUser.email}` });
    } catch(error) {
        console.log(error);
        if(error.code === 11000) {
            return next(ApiError.badRequest('Email already in use'));
        }
        throw error;
    }
};

exports.createUser = async (req, res, next) => {
    try {

        const { role } = req.body;

        if(role) {
            req.roleFromUser = role;
        }

        return next();
    } catch(error) {
        console.log(error);
        return next(new ApiError());
    }
}


exports.loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if(!user) {
            return next(ApiError.unauthenticated('Email or password is incorrect'));
        }

        const validPassword = await user.validatePassword(password);
        if(!validPassword) {
            return next(ApiError.unauthenticated('Email or password is incorrect'));
        }

        
        req.session.user_id = user._id;
        req.session.role = user.role;

        const { _id, email: emailToResponse, role, teamOwn } = user;
        

        res.status(200).json({ user: {
            _id,
            emailToResponse,
            role,
            teamOwn,
        } })
    } catch(error) {
        res.json({ message: error.message });
        throw error;
    }
};

exports.isAuth = async (req, res, next) => {
    if(req.session.user_id == null) {
        return next(ApiError.unauthenticated());
    }

    return next();
}

exports.isAdmin = async (req, res, next) => {
    if(req.session.role !== 'administrator') {
        return next(ApiError.unauthorized());
    }

    return next();
}

exports.deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        if(!mongoose.Types.ObjectId.isValid(id)) {
            return next(ApiError.badRequest('Invalid user id'))
        }

        const user = await User.findOneAndDelete({ _id: id});

        if(!user) {
            return next(ApiError.notFound('User not found'));
        }
        if(await deleteTeam(user.teamOwn)) {
            return res.status(202).json({ message: 'User deleted successfully'})
        }

        return next(new ApiError());
    } catch(error) {
        console.log(error);
        return next(new ApiError());
    }
}

exports.getUSerById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if(!mongoose.Types.ObjectId.isValid(id)) {
            return next(ApiError.badRequest('Invalid user id'));
        }

        const user = await User.findById(id);

        if(!user) {
            return next(ApiError.notFound('User not found'));
        }

        req.user = user
        return next();
    } catch(error) {
        console.log(error);
        return next(new ApiError());
    }
}

exports.getUser = async (req, res, next) => {
    try {
        const user = req.user;
        user.hashedPassword = '*****';

        return res.status(200).json({ user });
    } catch(error) {
        console.log(error);
        return next(new ApiError());
    }
}

exports.updateUser = async (req, res, next) => {
    try {
        const { user, body } = req
        const { teamOwn } = req.body;


        if(body.hasOwnProperty('teamOwn')) {
            if(! await Team.findById(teamOwn)) {
                return next(ApiError.notFound('Given team id not found'));
            }
        }
        if(body.hasOwnProperty('password')) {
            body['hashedPassword'] = await user.encryptPassword(body['password']);
        }
        for(let property in body) {
            user[property] = body[property]
        }

        await user.save();

        return res.status(200).json(user);
    } catch(error) {
        console.log(error);
        if(error.code === 11000) {
            return next(ApiError.badRequest('Email already in use'));
        }
        return next(new ApiError());
    }
}

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}, {hashedPassword: 0});
        return res.status(200).json({ users });
    } catch(error) {
        console.log(error);
        return next(new ApiError());
    }
}