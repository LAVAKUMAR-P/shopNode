import express  from "express";
import { Registerproduct } from "../Controllers/Admin.js";
import { Registeruser } from "../Controllers/user.js";

const router=express.Router();

router.post("/register",Registeruser);
router.post("/productregister",Registerproduct);


export default router;