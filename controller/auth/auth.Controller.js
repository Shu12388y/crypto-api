import { z } from 'zod';
import { User } from '../../model/auth.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateToken } from '../../utils/tokenGenrater.js';

export class AuthController {
  // create the signup controller
  static async signup(req, res) {
    try {
      const { username, password } = await req.body;
      const userObj = z.object({
        username: z.string().min(8).max(20),
        password: z.string().min(10).password(20),
      });
      const validObj = userObj.safeParse({
        username,
        password,
      });

      if (validObj.success == false) {
        res.json({ message: validObj.error }).status(400);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const createNewUser = await User.create({
        username,
        password: hashedPassword,
      });

      if (!createNewUser) {
        return res.json({ message: 'Server Error' }).status(500);
      }
      return res.json({ message: 'created' }).status(201);
    } catch (error) {
      res.json({ message: error }).status(500);
    }
  }

  static async signIn(req, res) {
    try {
      const { username, password } = await req.body;
      const userObj = z.object({
        username: z.string().min(8).max(20),
        password: z.string().min(10).password(20),
      });
      const validObj = userObj.safeParse({
        username,
        password,
      });

      if (validObj.success == false) {
        res.json({ message: validObj.error }).status(400);
      }

      const findUser = await User.findOne({
        username,
      });

      if (!findUser) {
        return res.status(400).json({ message: 'Not Founded' });
      }

      const checkPassword = await bcrypt.compare(findUser.password, password);

      if (!checkPassword) {
        return res.status(400).json({ message: 'wrong password' });
      }
      const userToken = await jwt.sign(
        JSON.stringify(findUser._id),
        process.env.SECERT_KEY
      );
      return res
        .json({ message: 'Login success', token: userToken })
        .status(202);
    } catch (error) {
      return res.json({ message: error }).status(500);
    }
  }

  static async GenrateToken(req, res) {
    try {
      const authToken = req.headers['authorization'];
      console.log(authToken);
      return res.json({ message: authToken }).status(200);
    } catch (error) {
      return res.json({ message: error }).status(500);
    }
  }
}
