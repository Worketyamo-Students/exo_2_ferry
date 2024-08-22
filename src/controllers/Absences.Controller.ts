import {
  Request,
  Response,
} from 'express';

import { PrismaClient } from '@prisma/client';

import CalculHeures from '../core/config/calculHeuresMois';
import { HttpCode } from '../core/constants';
import { myerrors } from './Employe.Controllers';

const prisma = new PrismaClient()


const SalaireController = {

    AjusterSalaire: async (req: Request, res: Response) => {
try {
  
  const { employeeID } = req.params;
    
   const employe= await prisma.employes.findUnique({where:{
    employeID:employeeID
   }})

  if (!employe) {
    
    return res.status(HttpCode.NOT_FOUND).json(myerrors.USER_NOT_FOUND)
    
  } 
    const salaire: number = employe.salaire
    const salairejours = salaire / 22
    const salaireheures = salairejours / 8
    const heuresAbsences = await CalculHeures(employe.employeID)
    const salairefinal = salaire-(heuresAbsences*salaireheures)
    res.json({msg:`le salaire reduit est de ${salairefinal}`})
  


} catch (error) {
    console.error(error)
    res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ msg: myerrors.INTERNAL_SERVER_ERROR });
}
}
}
export default SalaireController
