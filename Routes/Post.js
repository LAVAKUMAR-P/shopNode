import express  from "express";
import { Deleteproduct, Editproduct, Getproductsbyid, Registerproduct } from "../Controllers/Admin.js";
import { Addtocart, Addtoorder, Decrementcart, Getcartproducts, Getproducts, Incrementcart, Login, Registeruser, Removecartproduct } from "../Controllers/user.js";
import admincheck from "../Middleware/admincheck.js";
import authenticate from "../Middleware/check.js";

const router=express.Router();

router.get("/allproducts",Getproducts);
router.post("/register",Registeruser);
router.post("/login",Login);
router.post("/orderproduct",[authenticate],Addtoorder);
router.post("/productregister",[authenticate],[admincheck],Registerproduct);
router.post("/addtocart",[authenticate],Addtocart);
router.get("/cartproducts",[authenticate],Getcartproducts);
router.put("/increasevalue/:id",[authenticate],Incrementcart);
router.put("/decreasevalue/:id",[authenticate],Decrementcart);
router.put("/editproduct/:id",[authenticate],[admincheck],Editproduct);
router.get("/getproductbyid/:id",Getproductsbyid);
router.delete("/productdelete/:id",[authenticate],[admincheck],Deleteproduct);
router.delete("/cartproductdelete/:id",[authenticate],Removecartproduct);


export default router;