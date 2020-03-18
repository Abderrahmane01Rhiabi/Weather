const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
var _ = require('lodash');
const jwt = require('jsonwebtoken');
const verifyToken = require('../../middleware/verifyToken')

const secret = "secret";

//Models
const User = require('../../models/users');


router.get('/allDataAdmin',verifyToken,function(req,res){
    User.find({$or :[{role : 'admin'},{role : 'supperAdmin'}]})
    .then(data =>{
        if(res.adminData.role=='admin' || res.adminData.role=='supperAdmin'){
            if(data){
            console.log(data);
        res.status(200).json(data)
        }else{
            res.status(404).json({
                message : "No data a Give You"
            })
        }
    }else{
        res.status(404).json({
            message : "I Cant Give You Data You Are Note A Member"
        })
    }
    })
    
    .catch(err => {
        res.status(500).json({
            error : err
        });
    }) 
});

router.get('/dataOfAdmin/:adminId',verifyToken,(req,res) =>{
    User.find({_id : req.params.adminId}).exec()
    .then(result => {
        if(res.adminData.role=='admin' || res.adminData.role=='supperAdmin'){
            if(result.length >= 1){
            console.log(result)
            res.status(200).json({result}) 
        }else{
            console.log(result)
            res.status(404).json({
                message : "Admin Not Founded"
            })
        }   
        }else{
                res.status(404).json({
                    message : "I Cant Give You Data You Are Note A Member"
                })
            }        
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error : err
        });
    });
});

router.post('/login',(req,res) => {
    User.findOne({email: req.body.email}).exec()
    .then(admin => {
        console.log(admin)
        if(!admin){
            res.status(401).json({
                message : 'Login Failde'
            });
        }
        else{
        console.log(req.body.password);
        console.log(admin.password)
        console.log(req.body.email);
        
        bcrypt.compare(req.body.password, admin.password,(err,result) => {
            console.log(admin.password)
            console.log(req.body.password);
            console.log(result);

            if(err){
                    res.status(401).json({
                    message : 'Login Failde'
                });
            }
            if(result){
                const token = jwt.sign(
                    {
                    email : admin.email,
                    _id : admin._id,
                    role : admin.role
                    }, secret,
                    {
                        expiresIn : "1h"
                    }
                )
           
                    console.log(result);
                    console.log(result);

                    res.status(200).json({
                    message : 'Login successful',
                    token
                });
            }
            if(!result){
                console.log(result);
                res.status(400).json({
                message : 'Login Failde'
            });
        }    
        });
        }
    });
    
});

router.delete('/delete/:adminId',verifyToken,(req,res) => {
    User.remove({_id : req.params.adminId}).exec()
    .then(result => {
        //si le id nexiste pas il va affiche le 2em massage car lenght est >1
        if(res.adminData.role=='supperAdmin'){
        if(result.deletedCount >= 1){
            console.log(result)
            res.status(200).json({
                message : "Admin Deleted"
            }) 
        }else{
            console.log(result)
            res.status(404).json({
                message : "Admin Not Founded"
            })
        }
    }else{
        res.status(404).json({
            message : "I Cant Give You Data You Are Note A Member"
        })
    }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error : err
        });
    });
});


//=============================================================
//Code Copier
router.put('/update/:id',verifyToken,function (req, res, next) {
    // fetch admin
    User.findById(req.params.id, function(err, post) {
        if(res.adminData.role=='admin' || res.adminData.role=='supperAdmin'){
        if (err) return next(err);
        if(req.body){
        _.assign(post, req.body); 
        post.save(function(err) {
            if (err) return next(err);
         res.status(201).json({
             message : "Data Modifye"
         });
                // return res.json(200, post);
        })
    }else{
        res.status(201).json({
            message : "No Data Modifye"
        });
    }
    }else{
        res.status(404).json({
            message : "I Cant Give You Data You Are Note A Member"
        })
    }
    });
});
//=============================================================
    
router.post('/addAdmin/:email',verifyToken,(req,res) => {
    User.findOne({email : req.params.email}).exec()
    .then(result => {
        if(res.adminData.role=='supperAdmin'){
            if(result){
                console.log(req.body.num)
                var x =req.body.num;
                console.log(x)
                if(x=="1"){ 
                        result.isVerified = true
                        result.role = 'admin'
                        result.save(function (err) {
                            if (err) {  res.status(500).json({ msg: err.message }); }
                            res.status(200).json("Be An Admin Now");
                        });
                        console.log(result)

                    }
                else if(x=="0"){
                    result.role = 'user'
                    result.save(function (err) {
                        if (err) {  res.status(500).json({ msg: err.message }); }
                        res.status(200).json("Be An User Now");
                    });
                        console.log(result)

                }else{
                    res.status(400).json({
                        message : "it s not a 0 or 1"
                    })
                }
            }else{
                res.status(404).json({
                    message : "User Not Founded"
                })
            }
        }else{
            res.status(404).json({
                message : "I Cant Give You Data You Are Note A Member"
            })
        }
        console.log("-----------")
        console.log(result)
    })
})
module.exports = router;
