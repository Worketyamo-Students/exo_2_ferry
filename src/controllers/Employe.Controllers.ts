import bcrypt from 'bcrypt';
import {
  Request,
  Response,
} from 'express';

import { PrismaClient } from '@prisma/client';

import { HasherLePass } from '../core/config/fonctionHashage';
import mytokens from '../core/config/tokens';
import { HttpCode } from '../core/constants';

const prisma = new PrismaClient()

const EmployeController = {

    CreateEmploye: async (req: Request, res: Response) => {
        try {
            const { nom, email, password, poste, salaire } = req.body;
            const salaireInt: number = parseInt(salaire)
            const hashedpass: string = await HasherLePass(password)
            const newEmploye = await prisma.employes.create({
                data: {
                    nom,
                    email,
                    password: hashedpass,
                    poste,
                    salaire: salaireInt
                }
            });
            res.status(HttpCode.CREATED).json(newEmploye);
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "une erreur est survenue lors de la creation de l'employé" });
        }
    },
    ConnexionEmploye: async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const employé = await prisma.employes.findUnique({
                where: {
                    email
                }
            })
            if (employé) {
                const comparePass = await bcrypt.compare(password, employé.password)
                //génération des tokens
                const AccessToken = mytokens.generateAccessToken(employé)
                const RefreshToken = mytokens.generateRefreshToken(employé)

                res.cookie("cook_emp_xyz", RefreshToken, { httpOnly: true, secure: true, maxAge: 30 * 24 * 60 * 60 * 1000 })
                res.header('Authorization', AccessToken)
                res.json({ msg: "connection reussie" })
                console.log(AccessToken)
            }
            else {
                res.status(HttpCode.FORBIDDEN).json({ msg: "mot de passe ou adresse mail invalide !" })
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "une erreur est survenue lors de la connexion de l'employé" });
        }
    }

}

export default EmployeController