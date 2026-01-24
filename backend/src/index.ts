import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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
      error: error.message 
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
    res.status(400).json({ error: error.message });
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

// بدء الخادم
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`👥 Users API: http://localhost:${PORT}/users`);
  console.log(`🎓 Students API: http://localhost:${PORT}/students`);
});