const router = require('express').Router();
const { registerUser, loginUser, isAuth, isAdmin, deleteUser, getUSerById, getUser, updateUser, createUser, getAllUsers } = require('../controllers/user.controller');
const validateDto  = require('../middleware/validate-dto');
const { userSchema, updateUserSchema} = require('../dto/user.dto');

router.get('/users', isAuth, isAdmin, getAllUsers);
router.get('/:id', isAuth, isAdmin, getUSerById, getUser);
router.post('/register', validateDto(userSchema, 'body'), registerUser);
router.post('/login', validateDto(userSchema, 'body'), loginUser);
router.delete('/delete/:id', isAuth, isAdmin, deleteUser);
router.put('/update/:id', isAuth, isAdmin, validateDto(updateUserSchema, 'body'), getUSerById, updateUser);
router.post('/create', isAuth, isAdmin, validateDto(userSchema, 'body'), createUser, registerUser);

module.exports = router;
