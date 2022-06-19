import path from 'path';
import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import multer from 'multer';
import { graphqlHTTP } from 'express-graphql';
import { schema } from './graphql/schema';
import { resolver } from './graphql/resolvers';
import type { IResponseError } from './graphql/resolvers';

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    cb(null, `${new Date().toISOString()}-${file.originalname}`);
  }
});

app.use(bodyParser.json());
app.use(
  multer({
    storage: fileStorage,
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype === 'image/png'
        || file.mimetype === 'image/jpg'
        || file.mimetype === 'image/jpeg'
      ) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    }
  }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: resolver,
  graphiql: true,
  formatError(e) {
    if (!e.originalError) {
      return e;
    }
    const data = (e.originalError as IResponseError).data;
    const message = e.message || 'An error occurred';
    const code = (e.originalError as IResponseError).code;
    return {
      message,
      status: code,
      data
    };
  }
}));

app.use((err, req, res) => {
  const { statusCode, message, data } = err as any;
  (res as any).status(statusCode || 500).json({ message, data })
})

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(8080);
  })
  .catch(e => console.log(e));
