export const config = {
  port: Number(process.env.PORT) || 3000,
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'app_user',
    password: process.env.MYSQL_PASSWORD || 'password_fort',
    database: process.env.MYSQL_DATABASE || 'mydb',
  },
  realtime: {
    port: Number(process.env.REALTIME_PORT) || 3040,
    path: process.env.REALTIME_PATH || '/realtime',
  },
} as const;
