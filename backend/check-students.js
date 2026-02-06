const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStudents() {
  console.log('🔍 جلب جميع الطلاب:');
  
  const students = await prisma.student.findMany({
    include: { user: true }
  });
  
  if (students.length === 0) {
    console.log('❌ لا يوجد طلاب في قاعدة البيانات!');
    return;
  }
  
  console.log(`✅ عدد الطلاب: ${students.length}`);
  
  students.forEach(student => {
    console.log(`\n🎓 الطالب ID: ${student.id}`);
    console.log(`   user_id: ${student.userId}`);
    console.log(`   الاسم: ${student.user.name}`);
    console.log(`   الكود: ${student.studentCode}`);
    console.log(`   البريد: ${student.user.email}`);
  });
  
  // تحقق من المستخدمين
  console.log('\n👥 جميع المستخدمين:');
  const users = await prisma.user.findMany({
    where: { isStudent: true }
  });
  
  users.forEach(user => {
    console.log(`   ID: ${user.id} - ${user.name} (${user.email}) - isStudent: ${user.isStudent}`);
  });
}

checkStudents().catch(console.error).finally(() => prisma.$disconnect());