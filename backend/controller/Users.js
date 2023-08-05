import { response } from "express";
import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { where } from "sequelize";

export const getAllUser = async (req, res) => {
  try {
    const users = await userModel.findAll();
    res.json(users);
  } catch (error) {
    console.log(error);
  }
};

export const register = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  if (password !== confirmPassword)
    return res.status(400).json({ msg: "password not match" });
  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(password, salt);
  try {
    await userModel.create({
      name: name,
      email: email,
      password: hashPassword,
    });
    res.json({ msg: "Register Success" });
  } catch (error) {
    console.log(error);
  }
};

export const login = async (req, res) => {
  try {
    const user = await userModel.findAll({
      where: {
        email: req.body.email,
      },
    });
    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      user[0].password
    );
    if (!isPasswordMatch) {
      return res.status(400).json({ msg: "wrong password" });
    }
    const { id: userId, name, email } = user[0];

    const accessToken = jwt.sign(
      { userId, name, email },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "20s",
      }
    );
    const refreshToken = jwt.sign(
      { userId, name, email },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );
    await userModel.update(
      { refresh_token: refreshToken },
      {
        where: {
          id: userId,
        },
      }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      // secure: true,
    });
    res.json({ accessToken });
  } catch (error) {
    res.status(400).json({ msg: "wrong email" });
    console.log(error);
  }
};

export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(204);
  const user = await userModel.findAll({
    where: {
      refresh_token: refreshToken,
    },
  });
  if (!user[0]) return res.status(204);
  const { id: userId } = user[0];
  await userModel.update(
    { refresh_token: null },
    {
      where: {
        id: userId,
      },
    }
  );

  res.clearCookie("refreshToken");
  res.status(200).json({ msg: "Logout Success" });
};
