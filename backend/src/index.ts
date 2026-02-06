import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import courseRoutes from './routes/course.routes'; 

// تعريف الأنواع
import type { Request, Response } from 'express';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api', courseRoutes);

// 1. مسار التحقق من صحة الخادم والاتصال بقاعدة البيانات
app.get('/health', async (req: Request, res: Response) => {
  try {
    // اختبار الاتصال بقاعدة البيانات
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      service: 'Smart Edu Management System API'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: (error as Error).message 
    });
  }
});

// 2. جلب جميع المستخدمين
app.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: { studentProfile: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// 3. إنشاء مستخدم جديد (مع طالب إذا كان طالباً)
app.post('/users', async (req: Request, res: Response) => {
  try {
    const { email, passwordHash, name, phone, isStudent, isTeacher, isAdmin, studentCode } = req.body;
    
    const userData: any = {
      email,
      passwordHash,
      name,
      phone,
      isStudent: isStudent || false,
      isTeacher: isTeacher || false,
      isAdmin: isAdmin || false,
    };

    // إذا كان طالباً، أضف ملف الطالب
    if (isStudent && studentCode) {
      userData.studentProfile = {
        create: {
          studentCode,
          enrollmentDate: new Date()
        }
      };
    }

    const newUser = await prisma.user.create({
      data: userData,
      include: { studentProfile: true }
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// 4. جلب جميع الطلاب
app.get('/students', async (req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany({
      include: { user: true }
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// 5. الحصول على مستخدم محدد (GET by ID)
app.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const user = await prisma.user.findUnique({
      where: { id },
      include: { studentProfile: true }
    });
    
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'المستخدم غير موجود' });
    }
  } catch (error) {
    res.status(500).json({ error: 'فشل في جلب المستخدم' });
  }
});

// 6. تحديث مستخدم (PUT)
app.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { email, passwordHash, name, phone, isActive, isStudent, isTeacher, isAdmin } = req.body;
    
    // التحقق من وجود المستخدم أولاً
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email,
        passwordHash,
        name,
        phone,
        isActive: isActive !== undefined ? isActive : existingUser.isActive,
        isStudent: isStudent !== undefined ? isStudent : existingUser.isStudent,
        isTeacher: isTeacher !== undefined ? isTeacher : existingUser.isTeacher,
        isAdmin: isAdmin !== undefined ? isAdmin : existingUser.isAdmin
      },
      include: { studentProfile: true }
    });
    
    res.json({ 
      message: 'تم تحديث المستخدم بنجاح',
      user: updatedUser 
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// 7. حذف مستخدم (DELETE)
app.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    
    // التحقق من وجود المستخدم أولاً
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }
    
    // حذف المستخدم (سيحذف الطالب المرتبط تلقائياً بسبب onDelete: Cascade)
    await prisma.user.delete({
      where: { id }
    });
    
    res.status(200).json({ 
      message: 'تم حذف المستخدم بنجاح',
      deletedUserId: id 
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// 8. تحديث بيانات طالب (PUT للطالب)
app.put('/students/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { studentCode, dateOfBirth, gender, nationality, address, academicStatus } = req.body;
    
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        studentCode,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        nationality,
        address,
        academicStatus
      },
      include: { user: true }
    });
    
    res.json({ 
      message: 'تم تحديث بيانات الطالب بنجاح',
      student: updatedStudent 
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// بدء الخادم
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 Courses API: http://localhost:${PORT}/api/courses`);
  console.log(`🎓 Enrollment API: http://localhost:${PORT}/api/enrollments`);
  console.log(`📝 Student Courses: http://localhost:${PORT}/api/students/:studentId/courses`);
  console.log(`👥 Users API: http://localhost:${PORT}/users`);
  console.log(`👤 Students API: http://localhost:${PORT}/students`);
});