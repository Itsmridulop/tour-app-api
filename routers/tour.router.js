const express = require('express')
const { getTour, getOneTour, createTour, deleteTour, updateTour } = require('../controllers/tour.controller')

const router = express.Router()

router.get('/', getTour)
router.post('/', createTour)
router.get('/:id', getOneTour)
router.delete('/:id', deleteTour)
router.patch('/:id', updateTour)

module.exports = router