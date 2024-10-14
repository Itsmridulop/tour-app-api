const express = require('express')
const { protect, restrictTo } = require('../controllers/auth.controller')
const { getAllReview, createReview } = require('../controllers/review.controller')

const router = express.Router()

router.get('/', protect, restrictTo('admin', 'lead-guide'), getAllReview)
router.post('/', protect, restrictTo('user'), createReview)

module.exports = router