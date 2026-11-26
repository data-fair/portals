import 'dotenv/config'

// the database of the dev API: MONGO_URL wins over the development default, as in the api config
export const mongoUrl = process.env.MONGO_URL || `mongodb://localhost:${process.env.MONGO_PORT}/data-fair-portals-development`
