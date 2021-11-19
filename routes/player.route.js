const router = require('express').Router();
const { getPlayer, sellPlayer, updatePlayer, buyPlayer, getPlayersTransferList,
    isOwner, getPlayerAndUser, deletePlayerdExtended, createPlayer, getAllplayers } = require('../controllers/player.controller');
const validateDto = require('../middleware/validate-dto');
const { playerSchema, sellPlayerSchema, getTransferListScehma, addPlayerSchema } = require('../dto/player.dto');
const { isAuth, isAdmin } = require('../controllers/user.controller');

router.get('/players', isAuth, isAdmin, getAllplayers)
router.get('/transferlist', isAuth, validateDto(playerSchema, 'query'), validateDto(getTransferListScehma, 'query'), getPlayersTransferList);
router.get('/:id', isAuth, getPlayerAndUser, getPlayer);
router.post('/create', isAuth, isAdmin, validateDto(addPlayerSchema, 'body'), createPlayer);
router.put('/update/:id', isAuth, getPlayerAndUser, isOwner, validateDto(playerSchema, 'body'), updatePlayer);
router.patch('/sell/:id', isAuth, getPlayerAndUser, isOwner, validateDto(sellPlayerSchema, 'body'), sellPlayer);
router.patch('/buy/:id', isAuth, getPlayerAndUser, buyPlayer);
router.delete('/delete/:id', isAuth, isAdmin, getPlayerAndUser, deletePlayerdExtended);

module.exports = router;
