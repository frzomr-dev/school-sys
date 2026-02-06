const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  console.log('🔍 Checking existing data...');
  
  // 1. جلب جميع الطلاب
  const students = await prisma.student.findMany({
    include: { user: true }
  });
  console.log('\n🎓 Students:');
  students.forEach(s => {
    console.log(`   ID: ${s.id}, Name: ${s.user.name}, Code: ${s.studentCode}`);
  });
  
  // 2. جلب جميع المواد
  const courses = await prisma.course.findMany();
  console.log('\n📚 Courses:');
  courses.forEach(c => {
    console.log(`   ID: ${c.id}, Code: ${c.code}, Name: ${c.name}, Active: ${c.isActive}`);
  });
  
  // 3. جلب التسجيلات الحالية
  const enrollments = await prisma.enrollment.findMany({
    include: {
      student: { include: { user: true } },
      course: true
    }
  });
  console.log('\n📝 Current Enrollments:');
  enrollments.forEach(e => {
    console.log(`   Student: ${e.student.user.name}, Course: ${e.course.name}`);
  });
  
  await prisma.$disconnect();
}

test().catch(console.error);