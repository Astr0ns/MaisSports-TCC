import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL
const sql = postgres(connectionString, {
  ssl: 'require' // Supabase geralmente exige SSL fora do localhost
})

export default sql