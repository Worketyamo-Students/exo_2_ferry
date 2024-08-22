import {
  Request,
  Response,
} from 'express';
import fs from 'fs';
import { json2csv } from 'json-2-csv';
import path from 'path';

import { PrismaClient } from '@prisma/client';

import { HttpCode } from '../core/constants';
import { myerrors } from './Employe.Controllers';

const prisma = new PrismaClient()


const RapportController = {


    rapports: async (req: Request, res: Response) => {

        try {
            const { options } = req.body
            let utcDebutMois: Date;
            let DebutMois: Date;
            const utcFinMois = new Date();
            const FinMois = new Date(utcFinMois.getTime() - utcFinMois.getTimezoneOffset() * 60000)
            if (options === 'semaine') {

                utcDebutMois = new Date()
                DebutMois = new Date(utcDebutMois.getTime() - utcDebutMois.getTimezoneOffset() * 60000)
                DebutMois.setDate(FinMois.getDate() - 7)
            } else if (options === 'mois') {
                utcDebutMois = new Date()
                DebutMois = new Date(utcDebutMois.getTime() - utcDebutMois.getTimezoneOffset() * 60000);
                DebutMois.setMonth(FinMois.getMonth() - 1)

            } else {

                return res.status(HttpCode.NOT_FOUND).json({ msg: `veuillez choisir entre mois et semaine ` })
            }
            // Récupérer les données de présences
            const RapPresence = await prisma.presences.findMany({
                where: {
                    date: {
                        gte: DebutMois,
                        lte: FinMois,
                    },
                },
                include: {
                    employes: true, // Inclure les informations des employés
                },
            });

            // Récupérer les données d'absences 
            const absences = await prisma.absences.findMany({
                where: {
                    date: {
                        gte: DebutMois,
                        lte: FinMois,
                    },
                },
                include: {
                    employes: true, // Inclure les informations des employés
                },
            });

            // Préparation des données de présences pour le CSV
            const presenceData = RapPresence.map(Presence => ({
                employeID: Presence.employeIDs.join(','), // 
                nom: Presence.employes.map(e => e.nom).join(','), // Récupérer les noms des employés
                date: Presence.date.toISOString(), // Récupère la date en string
                heureDebut: Presence.heureDebut ? Presence.heureDebut.toISOString().split('T')[1] : '', // Récupère l'heure de début en string
                heureFin: Presence.heureFin ? Presence.heureFin.toISOString().split('T')[1] : '', // Récupère l'heure de fin en string
                estpresent: Presence.estpresent ? 'Oui' : 'Non', // Indique si l'employé est présent
                heureAbsences:'',
                données: 'Présence' // Type de données
            }));

            // Préparation des données d'absences pour le CSV
            const absenceData = absences.map(absence => ({
                employeID: absence.employeIDs.join(','),
                nom: absence.employes.map(e => e.nom).join(','), // Récupérer les noms des employés
                date: absence.date.toISOString(), // Récupère la date en string
                heureDebut: '', // Pas d'heure de début pour une absence
                heureFin: '', // Pas d'heure de fin pour une absence
                estpresent: '',
                heureAbsences: absence.heureAbsences, // Heures d'absence
                données: 'Absence'
            }));

            // Combiner les données de présences et d'absences
            const AllData = [...presenceData, ...absenceData];
            const datacsv = await json2csv(AllData);
            console.log("je suis le format csv",datacsv)

            const cheminFichier = path.join(__dirname, '..', 'Rapports', `rapport_${Date.now()}.csv`);
            fs.writeFileSync(cheminFichier, datacsv)
            res.status(HttpCode.OK).json({ msg: `Le rapport du mois a été envoyé à votre adresse mail` })

        } catch (error) {
            console.error(error)
            res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ msg: myerrors.INTERNAL_SERVER_ERROR });
        }
    },
    download: (req: Request, res: Response) => {
        const fileName = req.params.fileName;
        const cheminFichier = path.join(__dirname, '..', 'Rapports', fileName);

        if (fs.existsSync(cheminFichier)) {
            res.download(cheminFichier, (err) => {
                if (err) {
                    console.error(err);
                    res.status(HttpCode.INTERNAL_SERVER_ERROR).json({ msg: myerrors.INTERNAL_SERVER_ERROR });
                }
                fs.unlinkSync(cheminFichier);
            });
        } else {
            res.status(HttpCode.NOT_FOUND).json({ msg: 'Fichier non trouvé' });
        }
    },
}

export default RapportController


