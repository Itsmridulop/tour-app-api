const express = require('express')
const { protect, restrictTo } = require('../controllers/auth.controller')
const { getAllReview, createReview, updateReview, deleteReview, getDailyReview, getReviewOfUser } = require('../controllers/review.controller')

const router = express.Router({ mergeParams: true })

router.use(protect)
// router.get('/dailyReviews', restrictTo('admin', 'lead-guide'), getDailyReview, getAllReview)
router.get('/user/:id', restrictTo('admin', 'lead-guide'), getReviewOfUser)
router.get('/', restrictTo('admin', 'lead-guide'), getAllReview)
router.post('/', restrictTo('user'), createReview)
router.delete('/:id', restrictTo('user'), deleteReview)
router.patch('/:id', restrictTo('user'), updateReview)

module.exports = router
