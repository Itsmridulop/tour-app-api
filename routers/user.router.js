const express = require('express')
const { getUsers, getOneUser, createUser, deleteUser, updateUser, updateMe, deleteMe, getMe, uploadUserImage, resizeImage, getAssociatedTour } = require('../controllers/user.controller')
const { signup, login, forgotPassword, resetPassword, updatePassword, protect, restrictTo } = require('../controllers/auth.controller')

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.post('/forgotPassword', forgotPassword)
router.patch('/resetPassword/:token', resetPassword)
router.use(protect)
router.patch('/updatePassword', updatePassword)
router.get('/me', getMe)
router.patch('/updateMe', uploadUserImage, resizeImage, updateMe)
router.delete('/deleteMe', deleteMe)
router.use(restrictTo('admin'))
router.get('/', getUsers)
router.get('/associatedTour/:id', getAssociatedTour)
router.post('/', uploadUserImage, resizeImage, createUser)
router.get('/:id', getOneUser)
router.delete('/:id', deleteUser)
router.patch('/:id',uploadUserImage, resizeImage, updateUser)

module.exports = router;
