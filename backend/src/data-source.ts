import { DataSource } from 'typeorm';
import { join } from 'path';

/**
 * DataSource for the TypeORM CLI (generating / running migrations by hand).
 * The app itself runs pending migrations on startup (see app.module.ts).
 */
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'guide_badges',
  entities: [join(__dirname, '**', '*.entity.js')],
  migrations: [join(__dirname, 'migrations', '*.js')],
});
