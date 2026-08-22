import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgresql@localhost:5432/medintel';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start seeding...');

  // 1. Create a dummy doctor (User)
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@medintel.com' },
    update: {},
    create: {
      email: 'doctor@medintel.com',
      name: 'Dr. Gregory House',
      password: hashedPassword,
    },
  });
  
  console.log(`Created dummy doctor: ${doctor.email}`);

  // 2. Create dummy patients linked to the doctor
  const patientsData = [
    { name: "John Doe", age: 45, status: "Critical", summary: "Patient admitted with severe hypertension. History of Type 2 Diabetes." },
    { name: "Jane Smith", age: 32, status: "Stable", summary: "Routine checkup. Blood work shows normal levels. Needs follow-up on iron." },
    { name: "Robert Johnson", age: 58, status: "Review", summary: "Post-op recovery from appendectomy. Incision healing well." },
    { name: "Emily Davis", age: 24, status: "Stable", summary: "Asthma flare-up. Prescribed Albuterol inhaler." },
    { name: "Michael Brown", age: 71, status: "Critical", summary: "Cardiac arrhythmia detected. ECG uploaded. Pending cardiologist review." },
    { name: "Sarah Wilson", age: 41, status: "Stable", summary: "Annual physical. No significant changes. Vaccinations up to date." },
  ];

  for (const p of patientsData) {
    const patient = await prisma.patient.create({
      data: {
        name: p.name,
        age: p.age,
        status: p.status,
        summary: p.summary,
        doctorId: doctor.id,
      },
    });
    console.log(`Created patient: ${patient.name}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

