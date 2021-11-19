const yup = require('yup');
const { validatePassword } = require('../shared');
const mongoose = require('mongoose');

const allowedUserRoles = ['basic', 'administrator'];

exports.userSchema = yup.object({
    email: yup.string().email().required(),
    password: yup.string().required().test('password', 'Invalid password, password must contain at least 1 number, 1 uppercase, 1 lowercase, 1 non-alpha numeric number with lengeth 8-16 characters', password => validatePassword(password)),
    role: yup.string().test('role', 'invalid role, [basic, administrator]', role =>  role ? allowedUserRoles.includes(role) : true),
});

exports.updateUserSchema = yup.object({
    email: yup.string().email(),
    password: yup.string().test('password', 'Invalid password, password must contain at least 1 number, 1 uppercase, 1 lowercase, 1 non-alpha numeric number with lengeth 8-16 characters', password => password ? validatePassword(password) : true),
    role: yup.string().test('role', 'invalid role, [basic, administrator]', role =>  role ? allowedUserRoles.includes(role) : true),
    teamOwn: yup.string().test('teamOwn', 'Team id own isn\'t valid', teamOwn => teamOwn ? mongoose.Types.ObjectId.isValid(teamOwn) : true),
})