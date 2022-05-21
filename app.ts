import path from 'path';
import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { router as feedRoutes } from './routes/feed';

const app = express();

app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/feed', feedRoutes);

app.use((err, req, res) => {
  const { statusCode, message } = err as any;
  (res as any).status(statusCode || 500).json({ message })
})

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(8080);
  })
  .catch(e => console.log(e));
