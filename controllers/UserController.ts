import express from 'express';
import { validationResult } from 'express-validator';
import { UserModel, UserModelInterface } from '../models/UserModel';
import { generateMD5 } from '../utils/generateHash';
import { sendMail } from '../utils/sendEmail';

class UserController {
  async index(_: any, res: express.Response): Promise<void> {
    try {
      const users = await UserModel.find({}).exec();
      res.json({
        status: 'success',
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error,
      });
    }
  }
  async create(req: express.Request, res: express.Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ status: 'error', errors: errors.array() });
        return;
      }
      const data: UserModelInterface = {
        email: req.body.email,
        password: req.body.password,
        username: req.body.username,
        fullname: req.body.fullname,
        confirmHash: generateMD5(
          process.env.SECRET_KEY || Math.random().toString(),
        ),
      };
      const user = await UserModel.create(data);
      sendMail(
        {
          emailFrom: 'admin@twitter.com',
          emailTo: data.email,
          subject: 'Потверждение почты Twitter clone',
          html: `Для того, чтобы потвердить почту, перейдите <a href='http://localhost:${
            process.env.PORT || 8888
          }/users/verify?hash=${data.confirmHash}'>по этой ссылке</a>`,
        },
        (error: Error | null) => {
          if (error) {
            res.status(500).json({
              status: 'error',
              message: error,
            });
          } else {
            res.status(201).json({ status: 'success', data: user });
          }
        },
      );
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error,
      });
    }
  }
  async verify(req: any, res: express.Response): Promise<void> {
    try {
      const hash = req.query.hash;
      if (!hash) {
        res.status(400).send();
        return;
      }
      const user = await UserModel.findOne({ confirmHash: hash }).exec();
      if (user) {
        user.confirmed = true;
        user.save();
        res.json({ status: 'success' });
      } else {
        res
          .status(404)
          .json({ status: 'error', message: 'Пользователь не найден' });
      }
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error,
      });
    }
  }
}

export const UserCtrl = new UserController();
