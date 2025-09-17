const { Router } = require('express');
const { check } = require('express-validator');
const { fieldsValidates } = require('../middlewares/fields-validates');
const { 
    getCourseModules, 
    getCourseModulesWithProgress, 
    createCourseModule, 
    updateCourseModule, 
    deleteCourseModule,
    bulkUpdateCourseModules 
} = require('../controllers/course-modules');

const router = Router();

/**
 * Get all course modules
 * GET /api/course-modules
 */
router.get('/', [
], getCourseModules);

/**
 * Get course modules with student progress
 * GET /api/course-modules/with-progress
 */
router.get('/with-progress', [
], getCourseModulesWithProgress);

/**
 * Create a new course module
 * POST /api/course-modules
 */
router.post('/', [
    check('title', 'Title is required').notEmpty(),
    check('level', 'Level is required').notEmpty(),
    check('level', 'Level must be A1, A2, B1, or B2').isIn(['A1', 'A2', 'B1', 'B2']),
    check('description', 'Description is required').notEmpty(),
    check('topics', 'Topics must be a number').isNumeric(),
    fieldsValidates
], createCourseModule);

/**
 * Update course module
 * PUT /api/course-modules/:id
 */
router.put('/:id', [
    check('id', 'Invalid course module ID').isNumeric(),
    fieldsValidates
], updateCourseModule);

/**
 * Delete course module
 * DELETE /api/course-modules/:id
 */
router.delete('/:id', [
    check('id', 'Invalid course module ID').isNumeric(),
    fieldsValidates
], deleteCourseModule);

/**
 * Bulk update course modules (for JSON editor)
 * PUT /api/course-modules/bulk-update
 */
router.put('/bulk-update', [
    check('courseModules', 'courseModules array is required').isArray(),
    fieldsValidates
], bulkUpdateCourseModules);

module.exports = router;