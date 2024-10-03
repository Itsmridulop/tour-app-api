const express = require('express')
const { getUsers, getOneUser, createUser, deleteUser, updateUser } = require('../controllers/user.controller')

const router = express.Router()

router.get('/',getUsers)
router.post('/', createUser)
router.get('/:id', getOneUser)
router.delete('/:id', deleteUser)
router.patch('/:id', updateUser)

module.exports = router;