const express = require('express')
const { protect, restrictTo } = require('../controllers/auth.controller')
const { getAllReview, createReview, updateReview, deleteReview } = require('../controllers/review.controller')

const router = express.Router({ mergeParams: true })

router.get('/', protect, restrictTo('admin', 'lead-guide'), getAllReview)
router.post('/', protect, restrictTo('user'), createReview)
router.delete('/:id',  protect, restrictTo('user'), deleteReview)
router.patch('/:id',  protect, restrictTo('user'), updateReview)

module.exports = router