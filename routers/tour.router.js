const express = require('express')
const { getTour, getOneTour, createTour, deleteTour, updateTour, checkID, checkBody } = require('../controllers/tour.controller')

const router = express.Router()

router.param('id', checkID)

router.get('/', getTour)
router.post('/', checkBody, createTour)
router.get('/:id', getOneTour)
router.delete('/:id', deleteTour)
router.patch('/:id', updateTour)

module.exports = router