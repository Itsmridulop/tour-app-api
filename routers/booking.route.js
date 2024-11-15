const express = require('express')
const { createBooking, getAllBooking, getOneBooking, updateBooking, deleteBooking } = require('../controllers/booking.controller')

const router = express.Router()

router.post('/',createBooking)
router.get('/', getAllBooking)
router.get('/:id', getOneBooking)
router.patch('/:id', updateBooking)
router.delete('/:id', deleteBooking)

module.exports = router
