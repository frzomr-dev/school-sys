import { Router } from 'express';
import { courseController } from '../controllers/course.controller';

const router = Router();

// مسارات المواد الدراسية
router.get('/courses', courseController.getAllCourses);
router.get('/courses/:id', courseController.getCourseById);
router.post('/courses', courseController.createCourse);
router.put('/courses/:id', courseController.updateCourse);
router.delete('/courses/:id', courseController.deleteCourse);

// مسارات التسجيل
router.post('/enrollments', courseController.enrollStudent);
router.get('/students/:studentId/courses', courseController.getStudentCourses);

export default router;