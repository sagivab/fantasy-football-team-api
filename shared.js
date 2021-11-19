exports.MIN_AGE_PLAYER = 18;
exports.MAX_AGE_PLAYER = 40;
exports.allowedPositions = ['Goalkeeper', 'Defender', 'Midfielder', 'Attacker'];

const allowedPropertiesBasicRoleForPlayer = ['firstName', 'lastName', 'country'];
const allowedPropertiesAdministratorRoleForPlayer = ['age', 'position', 'marketValue', 'isOnMarket', 'marketPrice'];
const allowedPropertiesBasicRoleForTeam = ['name', 'country'];
const allowedPropertiesAdministratorRoleForTeam = ['budget'];

exports.isPropertyIsAllowedToUpdate = (property, role, document) => {
    let allowedPropertiesBasicRole;
    let allowedPropertiesAdministratorRole;
    if(document === 'player') {
        allowedPropertiesBasicRole = allowedPropertiesBasicRoleForPlayer;
        allowedPropertiesAdministratorRole = allowedPropertiesAdministratorRoleForPlayer;
    } else if(document === 'team') {
        allowedPropertiesBasicRole = allowedPropertiesBasicRoleForTeam;
        allowedPropertiesAdministratorRole = allowedPropertiesAdministratorRoleForTeam
    } else {
        return false;
    }

    if(allowedPropertiesBasicRole.includes(property)) {
        return true;
    } else if(allowedPropertiesAdministratorRole.includes(property) && role === 'administrator') {
        return true;
    }
    return false;
}



exports.getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

exports.validateEmail = (email) => {
    let re = /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/;
    return re.test(email);
}

exports.validatePassword = (password) => {
    let re = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/;
    return re.test(password);
}

exports.validateName = (name) => {
    let re = /^[a-zA-Z ,.'-]{3,}$/;
    return re.test(name);
}

exports.capitalizeFirstLetter = (str) => {
    str = str.toLowerCase();
    return str.charAt(0).toUpperCase() + str.slice(1);
}

exports.positionValidation = (position) => {
    return this.allowedPositions.includes(this.capitalizeFirstLetter(position));
}

