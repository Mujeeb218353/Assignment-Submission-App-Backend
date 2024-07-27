import { Router } from 'express'
import {
    registerStudent,
    loginStudent,
    logoutStudent,
    getCurrentStudent,
    refreshStudentAccessToken,
} from '../controllers/student.controllers.js'
import { upload } from '../middlewares/multer.middleware.js'
import { verifyStudentJWT } from '../middlewares/student.auth.middleware.js'
import { enrollStudent } from '../controllers/enrollment.controllers.js'
import { getStudentClass } from '../controllers/class.controllers.js'
import { 
    submitAssignment, 
    getUnSubmittedAssignment, 
    getSubmittedAssignment,
    editSubmittedAssignment,
    deleteSubmittedAssignment,
} from '../controllers/assignment.controllers.js'
import { getCity } from '../controllers/city.controller.js'
import { getCampus } from '../controllers/campus.controllers.js'
import { getCourse } from '../controllers/course.controllers.js'

const router = Router()

router.route('/register').post(upload.single('profile'), registerStudent)

router.route('/login').post(loginStudent)

// get city
router.route('/getCities').get(getCity)
// get campus
router.route('/getCampuses').get(getCampus)
// get course
router.route('/getCourses').get(getCourse)

// secure routes
router.route('/logout').post(verifyStudentJWT, logoutStudent)
router.route('/getCurrentStudent').get(verifyStudentJWT, getCurrentStudent)
router.route('/refreshStudentAccessToken').post(verifyStudentJWT, refreshStudentAccessToken)

router.route('/enrollStudent').post(verifyStudentJWT, enrollStudent)
router.route('/getStudentClass').get(verifyStudentJWT, getStudentClass)

router.route('/submitAssignment').post(verifyStudentJWT, submitAssignment)
router.route('/getUnSubmittedAssignment').get(verifyStudentJWT, getUnSubmittedAssignment)
router.route('/getSubmittedAssignment').get(verifyStudentJWT, getSubmittedAssignment)

router.route('/editSubmittedAssignment/:assignmentId').put(verifyStudentJWT, editSubmittedAssignment)
router.route('/deleteSubmittedAssignment/:assignmentId').delete(verifyStudentJWT, deleteSubmittedAssignment)

export default router