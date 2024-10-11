const express = require('express')
const { getTours, getOneTour, createTour, deleteTour, updateTour, topTours, tourStats, getMonthlyPlan } = require('../controllers/tour.controller')
const { protect } = require('../controllers/auth.controller')

const router = express.Router()

router.get('/', protect, getTours)
router.post('/', createTour)
router.get('/stats', tourStats)
router.get('/monthly-plan', getMonthlyPlan)
router.get('/top-5-tours', topTours, getTours)
router.get('/:id', getOneTour)
router.delete('/:id', deleteTour)
router.patch('/:id', updateTour)

module.exports = router