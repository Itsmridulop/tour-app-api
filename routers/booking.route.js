const express = require('express')
const { createBooking, getAllBooking, getOneBooking, updateBooking, deleteBooking, getBookingOfOneUser, getBookingOfUser } = require('../controllers/booking.controller')
const { protect } = require('../controllers/auth.controller')

const router = express.Router()

router.use(protect)
router.post('/', createBooking)
router.get('/user', getBookingOfOneUser)
router.get('/user/:id', getBookingOfUser)
router.get('/', getAllBooking)
router.get('/:id', getOneBooking)
router.patch('/:id', updateBooking)
router.delete('/:id', deleteBooking)

module.exports = router
