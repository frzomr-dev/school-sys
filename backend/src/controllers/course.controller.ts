import { Request, Response } from 'express';
import { courseService, CreateCourseData, UpdateCourseData, EnrollmentData } from '../services/course.service';

// أنواع الاستجابة
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// المتحكمات للمواد الدراسية
export const courseController = {
  // جلب جميع المواد
  async getAllCourses(req: Request, res: Response): Promise<void> {
    try {
      const courses = await courseService.getAllCourses();
      const response: ApiResponse<typeof courses> = {
        success: true,
        message: 'تم جلب المواد الدراسية بنجاح',
        data: courses
      };
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        message: 'فشل في جلب المواد الدراسية',
        error: error.message
      };
      res.status(500).json(response);
    }
  },

  // جلب مادة محددة
  async getCourseById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id.toString());  
      const course = await courseService.getCourseById(id);

      if (!course) {
        const response: ApiResponse<null> = {
          success: false,
          message: 'المادة غير موجودة'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof course> = {
        success: true,
        message: 'تم جلب المادة بنجاح',
        data: course
      };
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        message: 'فشل في جلب المادة',
        error: error.message
      };
      res.status(500).json(response);
    }
  },

  // إنشاء مادة جديدة
  async createCourse(req: Request, res: Response): Promise<void> {
    try {
      const courseData: CreateCourseData = req.body;

      // التحقق من الحقول المطلوبة
      if (!courseData.name || !courseData.code) {
        const response: ApiResponse<null> = {
          success: false,
          message: 'الاسم والكود مطلوبان'
        };
        res.status(400).json(response);
        return;
      }

      const course = await courseService.createCourse(courseData);
      
      const response: ApiResponse<typeof course> = {
        success: true,
        message: 'تم إنشاء المادة بنجاح',
        data: course
      };
      res.status(201).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        message: 'فشل في إنشاء المادة',
        error: error.message
      };
      res.status(400).json(response);
    }
  },

  // تحديث مادة
  async updateCourse(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id.toString());
      const courseData: UpdateCourseData = req.body;

      const course = await courseService.updateCourse(id, courseData);
      
      const response: ApiResponse<typeof course> = {
        success: true,
        message: 'تم تحديث المادة بنجاح',
        data: course
      };
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        message: 'فشل في تحديث المادة',
        error: error.message
      };
      res.status(400).json(response);
    }
  },

  // حذف مادة
  async deleteCourse(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id.toString());
      const course = await courseService.deleteCourse(id);
      
      const response: ApiResponse<typeof course> = {
        success: true,
        message: 'تم حذف المادة بنجاح',
        data: course
      };
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        message: 'فشل في حذف المادة',
        error: error.message
      };
      res.status(400).json(response);
    }
  },

  // تسجيل طالب في مادة
  async enrollStudent(req: Request, res: Response): Promise<void> {
    try {
      const enrollmentData: EnrollmentData = req.body;

      // التحقق من الحقول المطلوبة
      if (!enrollmentData.studentId || !enrollmentData.courseId) {
        const response: ApiResponse<null> = {
          success: false,
          message: 'معرف الطالب والمعرف المادة مطلوبان'
        };
        res.status(400).json(response);
        return;
      }

      const enrollment = await courseService.enrollStudent(enrollmentData);
      
      const response: ApiResponse<typeof enrollment> = {
        success: true,
        message: 'تم تسجيل الطالب في المادة بنجاح',
        data: enrollment
      };
      res.status(201).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        message: 'فشل في تسجيل الطالب',
        error: error.message
      };
      res.status(400).json(response);
    }
  },

  // جلب مواد طالب معين
  async getStudentCourses(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.studentId.toString());
      const courses = await courseService.getStudentCourses(studentId);
      
      const response: ApiResponse<typeof courses> = {
        success: true,
        message: 'تم جلب مواد الطالب بنجاح',
        data: courses
      };
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        message: 'فشل في جلب مواد الطالب',
        error: error.message
      };
      res.status(500).json(response);
    }
  }
};