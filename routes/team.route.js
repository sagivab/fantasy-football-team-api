const router = require('express').Router();
const { getTeamAndUser, isTeamOwner, getTeam, updateTeam, deleteTeamExtended, createTeamExtended, getAllTeams } = require('../controllers/team.controller');
const { isAuth, isAdmin } = require('../controllers/user.controller');
const validateDto = require('../middleware/validate-dto');
const { updateTeamSchema, addTeamSchema } = require('../dto/team.dto');

router.get('/teams', isAuth, isAdmin, getAllTeams);
router.get('/:id', isAuth, getTeamAndUser, isTeamOwner, getTeam);
router.put('/update/:id', isAuth, getTeamAndUser, isTeamOwner, validateDto(updateTeamSchema, 'body'), updateTeam);
router.delete('/delete/:id', isAuth, isAdmin, getTeamAndUser, deleteTeamExtended);
router.post('/create', isAuth, isAdmin, validateDto(addTeamSchema, 'body'), createTeamExtended);

module.exports = router;
