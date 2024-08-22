import { Router } from 'express';

import RapportController from '../controllers/Rapport.Controllers';

const routeRapport=  Router ()

 routeRapport.get('/attendance', RapportController.rapports);
 routeRapport.get('/attendance/download/:fileName', RapportController.download)

export default routeRapport