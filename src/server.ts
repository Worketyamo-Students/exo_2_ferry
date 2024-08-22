import compression from 'compression';
import cookieParser from 'cookie-parser';
// src/server.ts
// Configurations de Middlewares
import express from 'express';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import {
  ONE_HUNDRED,
  SIXTY,
} from './core/constants';
import routeEmploye from './routes/Employe.routes';
import routePresence from './routes/Presence.routes';
import routeRapport from './routes/Rapport.routes';
import routeSalaire from './routes/Salaire.routes';
import { setupSwagger } from './swagger';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(
	rateLimit({
		max: ONE_HUNDRED,
		windowMs: SIXTY,
		message: 'Trop de Requete à partir de cette adresse IP '
	})
);


app.use(cookieParser())
// Routes
app.use("/employes",routeEmploye);
app.use("/attendance",routePresence);
app.use("/salary",routeSalaire);
app.use("/reports",routeRapport);
app.use(morgan('combined'));
setupSwagger(app);
export default app;
