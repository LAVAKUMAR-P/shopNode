import express  from "express";
import { Allusersbyadmin, Deleteproduct, Editorder, Editproduct, GetorderByadmin, GetorderByadminid, Getproductsbyadmin, Getproductsbyid, makeadmin, Registerproduct, removeadmin } from "../Controllers/Admin.js";
import { Addtocart, Addtoorder, Decrementcart, Getcartproducts, Getorderproducts, Getproducts, Getsearchproducts, Incrementcart, Login, Registeruser, Removecartproduct } from "../Controllers/user.js";
import admincheck from "../Middleware/admincheck.js";
import authenticate from "../Middleware/check.js";

const router=express.Router();

router.get("/allproducts",Getproducts);
router.get("/searchproduct/:search",Getsearchproducts);
router.get("/allproductsbyadmin",[authenticate],[admincheck],Getproductsbyadmin);
router.post("/register",Registeruser);
router.post("/login",Login);
router.post("/orderproduct",[authenticate],Addtoorder);
router.post("/productregister",[authenticate],[admincheck],Registerproduct);
router.post("/makeadmin",[authenticate],[admincheck],makeadmin);
router.post("/removeadmin",[authenticate],[admincheck],removeadmin);
router.post("/addtocart",[authenticate],Addtocart);
router.get("/cartproducts",[authenticate],Getcartproducts);
router.get("/adminorders",[authenticate],[admincheck],GetorderByadmin);
router.get("/adminusers",[authenticate],[admincheck],Allusersbyadmin); 
router.get("/adminordersbyid/:id",[authenticate],[admincheck],GetorderByadminid);
router.put("/adminorderupdate/:id",[authenticate],[admincheck],Editorder);
router.get("/getorder",[authenticate],Getorderproducts);
router.put("/increasevalue/:id",[authenticate],Incrementcart);
router.put("/decreasevalue/:id",[authenticate],Decrementcart);
router.put("/editproduct/:id",[authenticate],[admincheck],Editproduct);
router.get("/getproductbyid/:id",Getproductsbyid);
router.delete("/productdelete/:id",[authenticate],[admincheck],Deleteproduct);
router.delete("/cartproductdelete/:id",[authenticate],Removecartproduct);


export default router;