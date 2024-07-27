import { Router } from 'express'
import {
    registerAdmin,
    loginAdmin,
    logoutAdmin,
    getCurrentAdmin,
    refreshAdminAccessToken,
} from '../controllers/admin.controllers.js'
import {
    getCity, 
    addCity,
} from '../controllers/city.controller.js'
import {
    addCampus,
    getCampus,
} from '../controllers/campus.controllers.js'
import {
    addCourse,
    getCourse,
} from '../controllers/course.controllers.js'
import {
    addClass,
    // getClass,
    // getClasses,
    getTeachersByCourse
} from '../controllers/class.controllers.js'
import { upload } from '../middlewares/multer.middleware.js'
import { verifyAdminJWT } from '../middlewares/admin.auth.middleware.js'

const router = Router()

// routes

router.route('/register').post(upload.single('profile'), registerAdmin)
router.route('/login').post(loginAdmin)

// secure routes

router.route('/logout').post(verifyAdminJWT, logoutAdmin)
router.route('/getCurrentAdmin').get(verifyAdminJWT, getCurrentAdmin)
router.route('/refreshAdminAccessToken').post(verifyAdminJWT, refreshAdminAccessToken)

router.route('/addCity').post(verifyAdminJWT, addCity)
router.route('/getCities').get(verifyAdminJWT, getCity)

router.route('/addCampus').post(verifyAdminJWT, addCampus)
router.route('/getCampuses').get(verifyAdminJWT, getCampus)

router.route('/addCourse').post(verifyAdminJWT, addCourse)
router.route('/getCourses').get(verifyAdminJWT, getCourse)

router.route('/addClass').post(verifyAdminJWT, addClass)
// router.route('/getClass').get(verifyAdminJWT, getClass)
// router.route('/getClasses').get(verifyAdminJWT, getClasses)
router.route('/getTeachersByCourse').get(verifyAdminJWT, getTeachersByCourse)

export default router