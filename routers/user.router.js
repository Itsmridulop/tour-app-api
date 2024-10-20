const express = require('express')
const { getUsers, getOneUser, createUser, deleteUser, updateUser, updateMe, deleteMe, getMe } = require('../controllers/user.controller')
const { signup, login, forgotPassword, resetPassword, updatePassword, protect, restrictTo } = require('../controllers/auth.controller')

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.post('/forgotPassword', forgotPassword)
router.patch('/resetPassword/:token', resetPassword)
router.use(protect)
router.patch('/updatePassword', updatePassword)
router.get('/me', getMe)
router.patch('/updateMe', updateMe)
router.delete('/deleteMe', deleteMe)
router.use( restrictTo('admin'))
router.get('/', getUsers)
router.post('/', createUser)
router.get('/:id', getOneUser)
router.delete('/:id', deleteUser)
router.patch('/:id', updateUser)  

module.exports = router;