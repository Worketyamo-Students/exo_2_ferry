import { Router } from 'express';

import EmployeController from '../controllers/Employe.Controllers';
import validateInputUser from '../core/middleware/validate.middleware';

const routeEmploye= Router()


routeEmploye.post('/',validateInputUser.validation,EmployeController.CreateEmploye)
routeEmploye.post('/login',EmployeController.ConnexionEmploye)



export default routeEmploye