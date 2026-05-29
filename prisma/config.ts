import { defineConfig } from 'prisma/config'

export default defineConfig({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
})