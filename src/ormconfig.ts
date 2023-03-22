import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

const config: PostgresConnectionOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'userwebsite',
  password: '321',
  database: 'website',
  entities: [__dirname + '/**/*.entity{.ts,.js}'], // !REQUIRED! typeORM to know where we store entity classes
  // synchronize: true, // add TABLE if not exist
  synchronize: false,
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
};

export default config;
