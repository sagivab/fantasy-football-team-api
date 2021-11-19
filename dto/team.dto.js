const yup = require('yup');
const { validateName } = require('../shared');
const { positionValidation } = require('./player.dto');

exports.updateTeamSchema = yup.object({
    name: yup.string().trim().test('name', 'Team name isn\'t valid', name => name ? validateName(name) : true),
    country: yup.string().trim().test('country', 'Country name isn\'t valid', country => country ? validateName(country) : true),
    budget: yup.number().moreThan(-1),
});

exports.addTeamSchema = yup.object({
    players: yup.array()
        .of(
            yup.object({
                position: positionValidation,
                num: yup.number().integer().moreThan(0),
            })
        )
})
