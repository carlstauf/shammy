import { db } from './client'

async function seed() {
  console.log('Seeding database...')
  // Add seed data here
  console.log('Seed complete')
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
