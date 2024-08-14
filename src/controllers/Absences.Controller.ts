import {
  Request,
  Response,
} from 'express';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()


const AbsenceController = {

  createAbsence: async (req: Request, res: Response) => {

    try {
      const { employeID } = req.params;
      const heureDebut = new Date()
      const Datejour: Date = new Date();
      heureDebut.setHours(8, 0, 0, 0)// mettre l'heure de debut a 8h00,
      const heureFin = new Date();
      heureFin.setHours(16, 0, 0, 0)// mettre l'heure a 16h00,
      let heuresAbsence:number=0

      const existPresence = await prisma.presences.findFirst({
        where: {
          employes: {
            some: {
              employeID
            }
          }
        }
      });
      if (!existPresence) {

        const newpresence = await prisma.presences.create({
          data: {
            date: Datejour,
            heureDebut: Datejour,
            employeIDs: [employeID],
            estpresent: true,
          },
        });
         console.log(newpresence)
        }
        if (existPresence?.estpresent === false) {

          const heureArrive = new Date(existPresence.heureDebut);
          if (heureArrive > heureDebut) {
            const retardArrivee = (heureArrive.getTime() - heureDebut.getTime()) / (1000 * 60 * 60);
            heuresAbsence += retardArrivee;
            console.log(heuresAbsence)
            res.json({heure:heuresAbsence})
        }
          // res.json(existPresence)
    }
  }
    catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Une erreur interne s\'est produite' })
    }

  }
}

export default AbsenceController
