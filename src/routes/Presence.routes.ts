import { Router } from 'express';

import PresenceController from '../controllers/Presences.Controller';

const routePresence = Router()

routePresence.post('/check-in', PresenceController.checkInt)
routePresence.post('/check-out', PresenceController.checkOut)


export default routePresence