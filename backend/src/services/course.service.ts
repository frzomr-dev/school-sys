import { PrismaClient, Course, Enrollment } from '@prisma/client';

const prisma = new PrismaClient();

// أنواع البيانات
export interface CreateCourseData {
  name: string;
  code: string;
  description?: string;
  credits?: number;
}

export interface UpdateCourseData {
  name?: string;
  code?: string;
  description?: string;
  credits?: number;
  isActive?: boolean;
}

export interface EnrollmentData {
  studentId: number;
  courseId: number;
  grade?: string;
  status?: string;
}

// خدمات المواد الدراسية
export const courseService = {
  // جلب جميع المواد
  async getAllCourses(): Promise<Course[]> {
    return prisma.course.findMany({
      orderBy: { createdAt: 'desc' }
    });
  },

  // جلب مادة بواسطة ID
  async getCourseById(id: number): Promise<Course | null> {
    return prisma.course.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: {
            student: {
              include: { user: true }
            }
          }
        }
      }
    });
  },

  // جلب مادة بواسطة الكود
  async getCourseByCode(code: string): Promise<Course | null> {
    return prisma.course.findUnique({
      where: { code }
    });
  },

  // إنشاء مادة جديدة
  async createCourse(data: CreateCourseData): Promise<Course> {
    // التحقق من عدم تكرار الكود
    const existingCourse = await this.getCourseByCode(data.code);
    if (existingCourse) {
      throw new Error('كود المادة موجود مسبقاً');
    }

    return prisma.course.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        credits: data.credits || 3,
      }
    });
  },

  // تحديث مادة
  async updateCourse(id: number, data: UpdateCourseData): Promise<Course> {
    // إذا كان التحديث يتضمن تغيير الكود، تحقق من عدم التكرار
    if (data.code) {
      const existingCourse = await prisma.course.findFirst({
        where: {
          code: data.code,
          id: { not: id }
        }
      });
      if (existingCourse) {
        throw new Error('كود المادة موجود مسبقاً لمادة أخرى');
      }
    }

    return prisma.course.update({
      where: { id },
      data
    });
  },

  // حذف مادة
  async deleteCourse(id: number): Promise<Course> {
    // التحقق من عدم وجود طلاب مسجلين في المادة
    const enrollmentsCount = await prisma.enrollment.count({
      where: { courseId: id }
    });

    if (enrollmentsCount > 0) {
      throw new Error('لا يمكن حذف المادة لأنها تحتوي على طلاب مسجلين');
    }

    return prisma.course.delete({
      where: { id }
    });
  },

  // تسجيل طالب في مادة
  async enrollStudent(data: EnrollmentData): Promise<Enrollment> {
    // التحقق من وجود الطالب والمادة
    const student = await prisma.student.findUnique({
      where: { id: data.studentId }
    });
    
    const course = await prisma.course.findUnique({
      where: { id: data.courseId }
    });

    if (!student) throw new Error('الطالب غير موجود');
    if (!course) throw new Error('المادة غير موجودة');
    if (!course.isActive) throw new Error('المادة غير مفعلة');

    // التحقق من عدم التسجيل المسبق
    try {
      return await prisma.enrollment.create({
        data: {
          studentId: data.studentId,
          courseId: data.courseId,
          grade: data.grade,
          status: data.status || 'active'
        },
        include: {
          student: {
            include: { user: true }
          },
          course: true
        }
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('الطالب مسجل مسبقاً في هذه المادة');
      }
      throw error;
    }
  },

  // جلب مواد طالب معين
  async getStudentCourses(studentId: number): Promise<Enrollment[]> {
    return prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: true,
        student: {
          include: { user: true }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    });
  }
};