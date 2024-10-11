const express = require('express')

const { getTours, getOneTour, createTour, deleteTour, updateTour, topTours, tourStats, getMonthlyPlan } = require('../controllers/tour.controller')
const { protect, restrictTo } = require('../controllers/auth.controller')

const router = express.Router()

router.get('/', protect, getTours)
router.post('/', protect, restrictTo('admin', 'lead-guide'), createTour)
router.get('/stats', protect, restrictTo('admin'), tourStats)
router.get('/monthly-plan', protect, restrictTo('admin', 'lead-guide'), getMonthlyPlan)
router.get('/top-5-tours',protect, topTours, getTours)
router.get('/:id',protect, getOneTour)
router.delete('/:id', protect, restrictTo('admin', 'lead-guide'), deleteTour)
router.patch('/:id',protect, restrictTo('admin', 'lead-guide'), updateTour)

module.exports = router