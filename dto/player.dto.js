const mongoose = require('mongoose');
const yup = require('yup');
const { validateName, positionValidation, MIN_AGE_PLAYER, MAX_AGE_PLAYER } = require('../shared');

exports.positionValidation = yup.string().trim().test('position', 'Position not valid[Goalkeeper, Defender, Midfielder, Attacker]',
    position => position ? positionValidation(position) : true);

yup.addMethod(yup.object, 'atLeastOneOf', function(list) {
    return this.test({
        name: 'atLeastOneOf',
        message: '${path} must have at least one of these keys: ${keys}',
        exclusive: true,
        params: { keys: list.join(', ') },
        test: value => value == null || list.some(f => value[f] != null)
    })
})

exports.playerSchema = yup.object({
    firstName: yup.string().trim().test('firstName', 'First name isn\'t valid', firstName => firstName ? validateName(firstName) : true),
    lastName: yup.string().trim().test('lastName', 'Last name isn\'t valid', lastName => lastName ? validateName(lastName) : true),
    country: yup.string().trim().test('country', 'Country name isn\'t valid', country => country ? validateName(country) : true),
    age: yup.number().moreThan(MIN_AGE_PLAYER - 1).lessThan(MAX_AGE_PLAYER + 1),
    position: this.positionValidation,
    marketValue: yup.number().moreThan(0),
    isOnMarket: yup.boolean(),
    marketPrice: yup.number().when('isOnMarket',
    {
        is: true,
        then: yup.number().required().moreThan(0),
    }),
});

exports.addPlayerSchema =  yup.object({
    marketPrice: yup.number(),
    teamOwn: yup.string().test('teamOwn', 'Team id own isn\'t valid', teamOwn => teamOwn ? mongoose.Types.ObjectId.isValid(teamOwn) : true),
}).atLeastOneOf(['marketPrice', 'teamOwn']);

exports.sellPlayerSchema = yup.object({
    marketPrice: yup.number().required().moreThan(0),
})

exports.getTransferListScehma = yup.object({
    minPrice: yup.number().moreThan(0),
    maxPrice: yup.number().moreThan(0),
    teamName: yup.string(),
});