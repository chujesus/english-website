const { Router } = require('express');
const { check } = require('express-validator');
const { fieldsValidates } = require('../middlewares/fields-validates');
const { 
    updateCourseProgress,
    getStudentDashboard
} = require('../controllers/student');

const router = Router();

/**
 * @route   PUT /student/:userId/course/:courseId
 * @desc    Update course progress status
 * @access  Public
 */
router.put('/student/:userId/course/:courseId', [
    check('userId', 'User ID is required').isNumeric(),
    check('courseId', 'Course ID is required').isNumeric(),
    check('status', 'Status is required').isIn(['not_started', 'in_progress', 'completed']),
    fieldsValidates
], updateCourseProgress);

/**
 * @route   GET /dashboard/:userId
 * @desc    Get student dashboard data
 * @access  Public
 */
router.get('/dashboard/:userId', [
    check('userId', 'User ID is required').isNumeric(),
    fieldsValidates
], getStudentDashboard);

module.exports = router;
