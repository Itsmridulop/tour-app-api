const express = require('express')
const { getUsers, getOneUser, createUser, deleteUser, updateUser } = require('../controllers/user.controller')
const { signup, login, forgotPassword, resetPassword, updatePassword, protect } = require('../controllers/auth.controller')

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.post('/forgotPassword', forgotPassword)
router.patch('/resetPassword/:token', resetPassword)
router.patch('/updatePassword', protect, updatePassword)
router.get('/', getUsers)
router.post('/', createUser)
router.get('/:id', getOneUser)
router.delete('/:id', deleteUser)
router.patch('/:id', updateUser)

module.exports = router;