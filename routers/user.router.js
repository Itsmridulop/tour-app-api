const express = require('express')
const { getUsers, getOneUser, createUser, deleteUser, updateUser, updateMe, deleteMe } = require('../controllers/user.controller')
const { signup, login, forgotPassword, resetPassword, updatePassword, protect, restrictTo } = require('../controllers/auth.controller')

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.post('/forgotPassword', forgotPassword)
router.patch('/resetPassword/:token', resetPassword)
router.patch('/updatePassword', protect, updatePassword)
router.patch('/updateMe', protect, updateMe)
router.delete('/deleteMe', protect, deleteMe)
router.get('/', protect, restrictTo('admin'), getUsers)
router.post('/', protect, restrictTo('admin'), createUser)
router.get('/:id', protect, restrictTo('admin'), getOneUser)
router.delete('/:id', protect, restrictTo('admin'), deleteUser)
router.patch('/:id', protect, restrictTo('admin'), updateUser)

module.exports = router;