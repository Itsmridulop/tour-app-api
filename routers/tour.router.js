const express = require('express')

const { getTours, getOneTour, createTour, deleteTour, updateTour, topTours, tourStats, getMonthlyPlan, gettoursWithin, getDistance } = require('../controllers/tour.controller')
const { protect, restrictTo } = require('../controllers/auth.controller')
const reviewRouter = require('./review.router')

const router = express.Router()

router.use('/:tourId/reviews', protect, reviewRouter)

router.get('/', getTours)
router.get('/top-5-tours', topTours, getTours)
router.get('/tour-within/:distance/center/:latlng/unit/:unit', gettoursWithin)
router.use(protect)
router.get('/distance', getDistance)
router.post('/', restrictTo('admin', 'lead-guide'), createTour)
router.get('/stats', restrictTo('admin'), tourStats)
router.get('/monthly-plan', restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan)
router.get('/:id', getOneTour)
router.delete('/:id', restrictTo('admin', 'lead-guide'), deleteTour)
router.patch('/:id', restrictTo('admin', 'lead-guide'), updateTour)

module.exports = router
