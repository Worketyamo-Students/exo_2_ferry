import {
  Request,
  Response,
} from 'express';

import { PrismaClient } from '@prisma/client';

import { HttpCode } from '../core/constants';
import { myerrors } from './Employe.Controllers';

const prisma= new PrismaClient ()


const PresenceController ={

   checkInt: async (req:Request, res:Response)=>{
     try {
        const {employeID}= req.body;

        //recupérer l'heure en fonction du decalage horaire
        const userTimezoneOffset = new Date().getTimezoneOffset();

        // Calculer la date locale en tenant compte du décalage horaire
        const Datejour = new Date(new Date().getTime() + userTimezoneOffset * 60 * 1000);
      
    const employe = await prisma.employes.findUnique({
            where: {
            employeID
            },  
        })
        if(!employe){
            res.status(HttpCode.NOT_FOUND).json({msg:myerrors.USER_NOT_FOUND})
        }
        //verifier si l'employé a déja une présence enregistré

        const existPresence = await prisma.presences.findFirst({
            where:{
            employes:{
                some:{
                    employeID
                }
            }
            }
        })

        if(existPresence){
            await prisma.presences.update({
                where:{
                    presenceID: existPresence.presenceID
                },
                data:{
                    
                    heureDebut: Datejour,
                }

            })
        }

          const newpresence= await prisma.presences.create({
            data:{
              date: Datejour,
              heureDebut: Datejour,
              employeIDs:[employeID],              
            },
          })
      res.status(HttpCode.CREATED).json(newpresence)
        
     } catch (error) {
        console.error(error)
        res.status(HttpCode.INTERNAL_SERVER_ERROR).json({msg:myerrors.INTERNAL_SERVER_ERROR})

     }
   },

}

export default PresenceController