import {
  Request,
  Response,
} from 'express';

import { PrismaClient } from '@prisma/client';

import sendmail from '../core/config/sendmail';
import { HttpCode } from '../core/constants';
import { myerrors } from './Employe.Controllers';

const prisma = new PrismaClient()
  const NotifController ={

    SendNotif: async (req: Request, res: Response)=>{

      try {
           const {id,sujet, message}=req.body
  
          const email = await prisma.employes.findUnique({
              where:{
                  employeID: id
              },
              select:{
                  email:true
                  
              }
             })
              if(!email){
                return res.status(HttpCode.NOT_FOUND).json(myerrors.USER_NOT_FOUND)
              }else{
                sendmail(email.email,sujet,message)
              }
             
      } catch (error) {
        console.error(error)
        res.status(HttpCode.INTERNAL_SERVER_ERROR).json(myerrors.INTERNAL_SERVER_ERROR)
      }


    }
  }