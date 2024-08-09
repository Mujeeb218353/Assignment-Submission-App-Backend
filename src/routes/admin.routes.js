import { Router } from "express";
import {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getCurrentAdmin,
  refreshAdminAccessToken,
  updateProfilePicture,
  updateProfileDetails,
  getAllAdmins,
  editAdminCityOrCampusOrVerification,
  deleteAdmin,
} from "../controllers/admin.controllers.js";
import { getCity, addCity } from "../controllers/city.controller.js";
import { addCampus, getCampus } from "../controllers/campus.controllers.js";
import {
  addCourse,
  getCourse,
  getAllCourses,
  editCourse,
  deleteCourse,
  deleteCourseCampus,
  deleteCourseCity,
} from "../controllers/course.controllers.js";
import {
  addClass,
  // getClass,
  getAllClasses,
  getTeachersByCourse,
} from "../controllers/class.controllers.js";
import { 
  getAllTeachers,
  editTeacherVerification,
  deleteTeacher,
 } from "../controllers/teacher.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAdminJWT } from "../middlewares/admin.auth.middleware.js";

const router = Router();

// routes

router.route("/register").post(verifyAdminJWT, upload.single("profile"), registerAdmin);
router.route("/login").post(loginAdmin);

// secure routes

router.route("/logout").post(verifyAdminJWT, logoutAdmin);
router.route("/getCurrentAdmin").get(verifyAdminJWT, getCurrentAdmin);
router.route("/refreshAdminAccessToken").post(refreshAdminAccessToken);

router
  .route("/updateAdminProfilePicture")
  .put(verifyAdminJWT, upload.single("profile"), updateProfilePicture);
router
  .route("/updateAdminProfileDetails")
  .put(verifyAdminJWT, updateProfileDetails);

router.route("/addCity").post(verifyAdminJWT, addCity);
router.route("/getCities").get(verifyAdminJWT, getCity);

router.route("/addCampus").post(verifyAdminJWT, addCampus);
router.route("/getCampuses").get(verifyAdminJWT, getCampus);

router.route("/addCourse").post(verifyAdminJWT, addCourse);
router.route("/getCourses").get(verifyAdminJWT, getCourse);
router.route("/getAllCourses").get(verifyAdminJWT, getAllCourses);
router.route("/editCourse/:courseId").put(verifyAdminJWT, editCourse);
router.route("/deleteCourse/:courseId").delete(verifyAdminJWT, deleteCourse);

router.route("/addClass").post(verifyAdminJWT, addClass);
// router.route('/getClass').get(verifyAdminJWT, getClass)
// router.route('/getClasses').get(verifyAdminJWT, getClasses)
router.route("/getTeachersByCourse").get(verifyAdminJWT, getTeachersByCourse);
router.route("/getAllTeachers").get(verifyAdminJWT, getAllTeachers);
router.route("/getAllAdmins").get(verifyAdminJWT, getAllAdmins);
router.route("/getAllClasses").get(verifyAdminJWT, getAllClasses);

router.route("/deleteCourseCity/:cityId&:courseId").delete(verifyAdminJWT, deleteCourseCity);
router.route("/deleteCourseCampus/:campusId&:courseId").delete(verifyAdminJWT,deleteCourseCampus);

router.route('/editAdminCityOrCampusOrVerification/:adminId').put(verifyAdminJWT, editAdminCityOrCampusOrVerification)
router.route("/deleteAdmin/:adminId").delete(verifyAdminJWT, deleteAdmin);

router.route("/editTeacherVerification/:teacherId").put(verifyAdminJWT, editTeacherVerification);
router.route("/deleteTeacher/:teacherId").delete(verifyAdminJWT, deleteTeacher);

export default router;