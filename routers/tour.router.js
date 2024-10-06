const express = require('express')
const { getTours, getOneTour, createTour, deleteTour, updateTour, topTours } = require('../controllers/tour.controller')

const router = express.Router()

router.get('/', getTours)
router.post('/', createTour)
router.get('/top-5-tours', topTours, getTours)
router.get('/:id', getOneTour)
router.delete('/:id', deleteTour)
router.patch('/:id', updateTour)
// router.route('/top-5-tours').get(topTours, getTours)

module.exports = router