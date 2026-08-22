import { defineConfig } from '@prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'npx tsx ./prisma/seed.ts',
  },
  datasource: {
    url: 'postgresql://postgres:postgresql@localhost:5432/medintel',
  },
})
