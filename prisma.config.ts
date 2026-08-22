import { defineConfig } from '@prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: 'postgresql://postgres:postgresql@localhost:5432/medintel',
  },
})
