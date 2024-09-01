import { Router } from "express";
import {
  registerTeacher,
  loginTeacher,
  logoutTeacher,
  getCurrentTeacher,
  refreshTeacherAccessToken,
  getClasses,
  updateProfilePicture,
  updateProfileDetails,
} from "../controllers/teacher.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyTeacherJWT } from "../middlewares/teacher.auth.middleware.js";
import {
  createAssignment,
  getCreatedAssignment,
  editAssignment,
  deleteAssignment,
  getStudentsSubmittedAssignment,
  getStudentsNotSubmittedAssignment,
  assignMarks,
} from "../controllers/assignment.controllers.js";
import {
    getStudentsByClass,
  getStudentPerformance,
} from "../controllers/student.controllers.js";

const router = Router();

router.route("/register").post(upload.single("profile"), registerTeacher);

router.route("/login").post(loginTeacher);

// secure routes
router.route("/logout").post(verifyTeacherJWT, logoutTeacher);
router.route("/getCurrentTeacher").get(verifyTeacherJWT, getCurrentTeacher);
router.route("/refreshTeacherAccessToken").post(refreshTeacherAccessToken);
router.route("/getClasses").get(verifyTeacherJWT, getClasses);

router
  .route("/updateTeacherProfilePicture")
  .put(verifyTeacherJWT, upload.single("profile"), updateProfilePicture);
router
  .route("/updateTeacherProfileDetails")
  .put(verifyTeacherJWT, updateProfileDetails);

router.route("/createAssignment").post(verifyTeacherJWT, createAssignment);
router
  .route("/getCreatedAssignments")
  .get(verifyTeacherJWT, getCreatedAssignment);
router
  .route("/editAssignment/:assignmentId")
  .put(verifyTeacherJWT, editAssignment);
router
  .route("/deleteAssignment/:assignmentId")
  .delete(verifyTeacherJWT, deleteAssignment);
router
  .route("/getStudentsSubmittedAssignment/:assignmentId")
  .get(verifyTeacherJWT, getStudentsSubmittedAssignment);
router
  .route("/getStudentsNotSubmittedAssignment/:assignmentId")
  .get(verifyTeacherJWT, getStudentsNotSubmittedAssignment);
router.route("/assignMarks/:assignmentId").put(verifyTeacherJWT, assignMarks);

router
  .route("/getStudentsByClass/:classId")
  .get(verifyTeacherJWT, getStudentsByClass);
router
  .route("/getStudentPerformance/:studentId&:classId")
  .get(verifyTeacherJWT, getStudentPerformance);

export default router;