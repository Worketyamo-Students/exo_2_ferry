import {
  Request,
  Response,
} from 'express';

import { PrismaClient } from '@prisma/client';

import { HttpCode } from '../core/constants';
import { myerrors } from './Employe.Controllers';

const prisma = new PrismaClient()


const PresenceController = {

  checkInt: async (req: Request, res: Response) => {
    try {
      const { employeID } = req.body;
      const HeureArrive = new Date(Date.now());
      const heureNormalA: Date = new Date();
      heureNormalA.setHours(8, 30, 0, 0); // Heure normale de début du travail
      let heuresAbsence: number = 0;
      const Datejour: Date = new Date();
      Datejour.setHours(0, 0, 0, 0); // obtenir la date du jour 

      const employe = await prisma.employes.findUnique({
        where: { employeID },
      });

      if (!employe) {
        return res.status(HttpCode.NOT_FOUND).json({ msg: myerrors.USER_NOT_FOUND });
      }

      // Vérifier si une présence existe déjà pour l'employé ce jour-là
      const existPresence = await prisma.presences.findFirst({
        where: {
          employeIDs: { has: employeID },
          date: Datejour,
        },
      });

      if (existPresence) {
        // Mise à jour de la présence existante
        const presenceUpdate = await prisma.presences.update({
          where: { presenceID: existPresence.presenceID },
          data: {
            heureDebut: HeureArrive,
            estpresent: true,
          },
        });

        // Si l'employé est en retard
        if (HeureArrive > heureNormalA) {
          const retardArrivee = (HeureArrive.getTime() - heureNormalA.getTime()) / (1000 * 60 * 60);
          heuresAbsence += retardArrivee;
          console.log(heuresAbsence);
          // Vérifier s'il existe déjà une absence pour ce jour
          const existAbsence = await prisma.absences.findFirst({
            where: {
              employeIDs: { has: employeID },
              date: Datejour,
            },
          });

          if (!existAbsence) {
            await prisma.absences.create({
              data: {
                employeIDs: [employeID],
                date: Datejour,
                heureAbsences: heuresAbsence,
              },
            });
            console.log('Absence créée');
          } else {
            await prisma.absences.update({
              where: { absencesID: existAbsence.absencesID },
              data: {
                heureAbsences: existAbsence.heureAbsences + heuresAbsence,
              },
            });
            console.log('Absence mise à jour');
          }
        }

        return res.status(HttpCode.OK).json(presenceUpdate);
      } 
      else {
        // Créer une nouvelle présence si aucune n'est enregistrée
        const newPresence = await prisma.presences.create({
          data: {
            date: Datejour,
            heureDebut: HeureArrive, // Heure actuelle comme heure de début
            employeIDs: [employeID],
            estpresent: true,
          },
        });

        // Vérifier les retards et les absences pour la nouvelle présence
        if (HeureArrive > heureNormalA) {
          const retardArrivee = (HeureArrive.getTime() - heureNormalA.getTime()) / (1000 * 60 * 60);
          heuresAbsence += retardArrivee;

          await prisma.absences.create({
            data: {
              employeIDs: [employeID],
              date: Datejour,
              heureAbsences: heuresAbsence,
            },
          });
        }
        console.log("nouvelle présence créée")
        return res.status(HttpCode.CREATED).json(newPresence);
      }
    } catch (error) {
      console.error(error);
      res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ msg: myerrors.INTERNAL_SERVER_ERROR });
    }
  },

  checkOut: async (req: Request, res: Response) => {
    try {
      const { employeID } = req.body;
      const heureFin = new Date();
      heureFin.setHours(15,50, 0, 0); // Heure normale de fin de travail

      const currentTime = new Date();
      const jour = new Date();
      jour.setHours(0, 0, 0, 0); 

      // Vérifier si une présence existe pour l'employé ce jour-là
      const existingPresence = await prisma.presences.findFirst({
        where: {
          employeIDs: { has: employeID },
          date: jour,
          heureFin: null, // Assurez-vous que l'heure de fin n'est pas déjà enregistrée
        }
      });

      if (!existingPresence) {
        return res.status(HttpCode.NOT_FOUND).json({ msg: `Aucune présence enregistrée pour cet employé aujourd'hui` });
      } else {
        // Mise à jour de la présence existante
        const presenceUpdate = await prisma.presences.update({
          where: { presenceID: existingPresence.presenceID },
          data: {
            heureFin: currentTime, // Heure actuelle comme heure de fin
            estpresent: false,
          },
        });

        // Si l'employé quitte avant l'heure normale de fin
        if (currentTime < heureFin) {
          const partiAvant = (heureFin.getTime() - currentTime.getTime()) / (1000 * 60 * 60);

          const existAbsence = await prisma.absences.findFirst({
            where: {
              employeIDs: { has: employeID },
              date: jour,
            },
          });

          if (!existAbsence) {
            await prisma.absences.create({
              data: {
                employeIDs: [employeID],
                date: jour,
                heureAbsences:partiAvant,
              },
            });
            console.log(`partie avant`);
          } else {
            await prisma.absences.update({
              where: { absencesID: existAbsence.absencesID },
              data: {
                heureAbsences: existAbsence.heureAbsences + partiAvant,
              },
            });
            console.log('partie');
          }
        }
        return res.status(HttpCode.OK).json(presenceUpdate);
      }
    } catch (error) {
      console.error(error);
      return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ msg: myerrors.INTERNAL_SERVER_ERROR });
    }
  },

  }

export default PresenceController