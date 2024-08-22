import nodemailer from 'nodemailer';

import { envs } from './env';

async function sendmail(userEmail:string, text:any, sujet:string) {
    const transporter = nodemailer.createTransport({
      service: envs.MAIL_SERVICE,
      host: envs.MAIL_HOST,
      port: envs.MAIL_PORT,
      secure: true,
      auth: {
        user:envs.MAIL_USE,
        pass: envs.PASS_APP_MAIL,
      },
    });
   
    const info = await transporter.sendMail({
      from: '"ferry👻"<youbiferry@gmail.com>',
      to: userEmail,
      subject: sujet,
      html: `<b style="font-size: 32px; color: green;">Bonjour ${text},</b>`
    });
  }

  export default sendmail;
//   `Bonjour, nous vous informons que le(s) livre(s) "${bookTitles.join(', ')}" a/ont bien été retourné(s). Merci de votre visite.`,