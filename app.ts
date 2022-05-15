import express from 'express';
import { router as feedRoutes } from './routes/feed';

const app = express();

app.use('/feed', feedRoutes);

app.listen(8080);
