const { Router } = require('express');
const { 
    getCourses,
    getCoursesByUserId
} = require('../controllers/course');

const router = Router();

/**
 * Get all courses.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with the list of all courses.
*/
router.get('/', getCourses);

/**
 * Get courses by user ID, including progress percentage.
 * @param {Object} req - Express request object with user ID as a parameter.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with the list of courses and progress percentage for the specified user.
*/
router.get('/:id', getCoursesByUserId);

module.exports = router;
