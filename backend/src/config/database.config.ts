import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    // @ts-ignore
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USERNAME || 'babylog',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'babylogplus',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    migrationsRun: true,
}));