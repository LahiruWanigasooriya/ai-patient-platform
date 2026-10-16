import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgresql@localhost:5458/medintel';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedVitals() {
  console.log("Seeding longitudinal vitals...");

  const john = await prisma.patient.findFirst({ where: { name: "John Doe" } });
  const jane = await prisma.patient.findFirst({ where: { name: "Jane Smith" } });

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  if (john) {
    // Clear any existing vitals for clean seed
    await prisma.vitalReading.deleteMany({ where: { patientId: john.id } });

    const johnVitals = [
      { systolic: 152, diastolic: 94, heartRate: 78, spo2: 97, daysAgo: 5 },
      { systolic: 158, diastolic: 96, heartRate: 82, spo2: 96, daysAgo: 4 },
      { systolic: 162, diastolic: 99, heartRate: 84, spo2: 96, daysAgo: 3 },
      { systolic: 165, diastolic: 101, heartRate: 86, spo2: 95, daysAgo: 2 },
      { systolic: 168, diastolic: 102, heartRate: 88, spo2: 95, daysAgo: 1 },
      { systolic: 172, diastolic: 105, heartRate: 91, spo2: 94, daysAgo: 0 },
    ];

    for (const v of johnVitals) {
      await prisma.vitalReading.create({
        data: {
          patientId: john.id,
          systolic: v.systolic,
          diastolic: v.diastolic,
          heartRate: v.heartRate,
          spo2: v.spo2,
          recordedAt: new Date(now - v.daysAgo * dayMs),
        },
      });
    }
    console.log(`Seeded ${johnVitals.length} vitals for John Doe.`);
  }

  if (jane) {
    await prisma.vitalReading.deleteMany({ where: { patientId: jane.id } });

    const janeVitals = [
      { systolic: 118, diastolic: 76, heartRate: 70, spo2: 99, daysAgo: 5 },
      { systolic: 120, diastolic: 78, heartRate: 72, spo2: 98, daysAgo: 4 },
      { systolic: 116, diastolic: 74, heartRate: 68, spo2: 99, daysAgo: 3 },
      { systolic: 118, diastolic: 75, heartRate: 71, spo2: 99, daysAgo: 2 },
      { systolic: 121, diastolic: 77, heartRate: 73, spo2: 98, daysAgo: 1 },
      { systolic: 119, diastolic: 76, heartRate: 70, spo2: 99, daysAgo: 0 },
    ];

    for (const v of janeVitals) {
      await prisma.vitalReading.create({
        data: {
          patientId: jane.id,
          systolic: v.systolic,
          diastolic: v.diastolic,
          heartRate: v.heartRate,
          spo2: v.spo2,
          recordedAt: new Date(now - v.daysAgo * dayMs),
        },
      });
    }
    console.log(`Seeded ${janeVitals.length} vitals for Jane Smith.`);
  }

  console.log("Finished seeding vitals.");
}

seedVitals()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
