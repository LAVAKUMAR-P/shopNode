import express  from "express";
import { Registerproduct } from "../Controllers/Admin.js";
import { Getproducts, Login, Registeruser } from "../Controllers/user.js";

const router=express.Router();

router.post("/register",Registeruser);
router.post("/productregister",Registerproduct);
router.post("/login",Login);
router.get("/allproducts",Getproducts);


export default router;