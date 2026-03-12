// import { NestFactory } from '@nestjs/core';
// import { ExpressAdapter } from '@nestjs/platform-express';
// import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
// import express, { Request, Response } from 'express';
// import { AppModule } from './app.module';
// import cors from 'cors';
// import cookieParser from 'cookie-parser';

// const logger = new Logger('NestJS Vercel');

// const server = express();

// let app: any;

// async function bootstrap() {
//   if (!app) {
//     app = await NestFactory.create(
//       AppModule,
//       new ExpressAdapter(server),
//       { bodyParser: false }
//     );

//     configGlobalPipes(app);

//     app.use(cookieParser());

//     configCors(app);

//     await app.init();
//   }
//   return server;
// }

// function configGlobalPipes(app: INestApplication) {
//   app.useGlobalPipes(
//     new ValidationPipe({
//       transform: true,
//       whitelist: true,
//       forbidNonWhitelisted: true,
//     }),
//   );
// }

// function configCors(app: INestApplication) {
//   const whiteList = process.env.CORS_WHITELIST
//     ? process.env.CORS_WHITELIST.split(', ')
//     : [];

//   logger.debug(`Origens permitidas no CORS: ${whiteList.join(', ')}`);

//   let currentRoute: string = '';

//   app.use((req: Request, _: Response, next: () => {}) => {
//     currentRoute = req.path;
//     next();
//   });

//   app.use(
//     cors({
//       origin: function (origin: string, callback) {
//         if (whiteList.includes(origin) || !origin) {
//           if (process.env.PRODUCTION === 'false')
//             logger.debug(`Origem permitida através do CORS. Origem ${origin} na rota ${currentRoute}`);
//           callback(null, true);
//         } else {
//           logger.error(`Origem não permitida através do CORS. Origem ${origin} na rota ${currentRoute}`);
//         }
//       },
//       methods: ['GET', 'POST', 'PATCH', 'DELETE'],
//       credentials: true,
//     }),
//   );
// }

// export default async function handler(req, res) {
//   const server = await bootstrap();
//   return server(req, res);
// }

import { ForbiddenException, INestApplication, Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Request, Response } from "express";

const logger = new Logger('main.ts');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  configCors(app);

  configGlobalPipes(app);

  const port = 3000;
  const enviroment = process.env.PRODUCTION === 'true' ? 'Produção' : 'Desenvolvimento';

  await app.listen(port);

  logger.log(`Servidor de ${enviroment} rodando na porta ${port}`)
}

function configCors(app: INestApplication) {
  const whiteList = process.env.CORS_WHITELIST
    ? process.env.CORS_WHITELIST.split(',')
    : [];

  logger.debug(`Origens permitidas no CORS: ${whiteList.join(', ')}`);

  let currentRoute: string = '';

  app.use((req: Request, _: Response, next: () => {}) => {
    currentRoute = req.path;
    next();
  });

  app.use(
    cors({
      origin: function (origin: string, callback) {
        if (whiteList.includes(origin) || !origin) {
          logger.debug(`Origem ${origin} permitida através do CORS na rota ${currentRoute}`);

          callback(null, true);
        } else {
          logger.error(`Origem ${origin} não permitida através do CORS na rota ${currentRoute}`);
          callback(new ForbiddenException('Origem da requisição não permitida'), origin);
        }
      },
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true,
    }),
  );
}

function configGlobalPipes(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
}

bootstrap();