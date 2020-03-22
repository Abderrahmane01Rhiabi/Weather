const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const verifyToken = require('../../middleware/verifyToken')
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();
const secret = "secret";
//Models
const User = require('../../models/users');
const Token = require('../../models/token');


//prandre tous les donnee des utilisateurs existe dans la base de donnee
router.get('/allDataUser',verifyToken,function(req,res){
    User.find({})
    .then(data =>{
        if(res.adminData.role=='admin' || res.adminData.role=='supperAdmin'){
            console.log(data);
        return res.json(data)
        }else{
            return res.status(404).json({
                message : "I Cant Give You Data You Are Not A Member"
            })
        }
    })
    .catch(err => {
        return res.status(500).json({
            error : err
        });
    }) 
});

//prandre tous les donnee d'un utilisateur 
router.get('/dataOfuser/:userId',verifyToken,(req,res) =>{
    User.find({_id : req.params.userId}).exec()
    .then(result => {
        console.log(res.adminData.email)
        if(res.adminData.role=='admin' || res.adminData.role=='supperAdmin'){
            if(result.length >= 1){
            console.log(result)
            return res.status(200).json({result}) 
        }else{
            console.log(result)
             res.status(404).json({
                message : "User Not Founded"
            })
        }
    }else{
        res.status(404).json({
            message : "I Cant Give You Data You Are Not A Member"
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

//test si le user peut acceder 
router.post('/login', (req,res) => {
    console.log(req.body.email)
    User.findOne({email : req.body.email}).exec()
    .then(user => {
        console.log("hhhh")
        //console.log(user.password)
        if(!user){
             res.status(200).json({
                message : 'Login Failed'
            });
        }
        else{
        console.log("hhhh")
        console.log(user.password)
        bcrypt.compare(req.body.password, user.password,(err,result) => {

            if(err){
                res.status(200).json({
                     message : 'Login Failed'
                 });
            }

            console.log("vvv")
        console.log(user.isVerified)
            if(!user.isVerified){
                return res.status(200).json({
                 message : 'Your account has not been verified' 
                 }); 
            }
            if(result){
                const token = jwt.sign(
                    {
                    email : user.email,
                    _id : user._id,
                    role : user.role
                    }, secret,
                    {
                        expiresIn : "1h"
                    }
                )
                    console.log(result);
                     res.status(200).json({
                    message : 'Login successful',
                    token : token,
                    role : user.role
                });
                // res.json({ 
                //     token: generateToken(user), 
                //     user: user.toJSON() 
                // });
            }
            if(!result){
                console.log(result);
                 res.status(200).json({
                message : 'Login Failed'
            });
        }    
           });
        }
    });
    
});

router.post('/signup', function(req,res){
    User.find({email : req.body.email})
    .exec()
    .then(result => {
        if (result.length >= 1){
            return res.status(409).json({
                message : 'Mail Existe'
            });
        } else {
            if(req.body.firstname && req.body.lastname && req.body.email && req.body.password && req.body.password2){
                if(req.body.password.length > 6){
                    if(req.body.password == req.body.password2){
                var data = {
                    "firstname" : req.body.firstname,
                    "lastname" : req.body.lastname,
                    "email" : req.body.email,
                    "password" : req.body.password
                     }
                var newUser = new User(data);     
                newUser.save()
                .then(user => {
                //verification token pour user 
                    var token = new Token({ 
                        _userId: user._id, 
                        token: crypto.randomBytes(16).toString('hex') 
                });
                console.log(token)
                // Save the verification token
                token.save(function(err){
                    if (err) { 
                        return res.status(500).json({ 
                        error: err.message 
                        }); 
                    }
                    console.log(token.token)
                    console.log(req.headers.host)
                    var transporter = nodemailer.createTransport({ 
                        service: 'Gmail', 
                        auth: { user: process.env.SENDGMAIL_USERNAME, 
                                pass: process.env.SENDGMAIL_PASSWORD
                            } 
                        });
                        var mailOptions = { 
                            from: 'pfe.estessaouira@gmail.com', 
                            to: user.email, 
                            subject: 'Account Verification Token', 
                            text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/user/signup/confirmation\/' + token.token + '\n' 
                            };
            
                            transporter.sendMail(mailOptions, function (err,info) {
                            if (err) { 
                                return res.status(500).send({ 
                                    error: err.message 
                                }); 
                            }
                            console.log('Emaom sent : '+info.response)
                            res.status(200).send('A verification email has been sent to ' + user.email + '.');
                        })
                    });
                    
                    // console.log(result);
                    // res.status(201).json({
                    //     message : "User created"
                    // });
                }).catch(err => {
                    console.log(err);
                    return res.status(500).json({
                        error : err
                    });
                })
                }else{
                    return res.status(200)({
                        message : "Passwords do not match"
                    });
                }
            }else{
                return res.status(200)({
                    message : "Password must be at least 6 characters"
                });
            }
            }else{
                return res.status(200)({
                    message : "Please enter all fields"
                });
            }
        }
       
        });
});

router.get('/signup/confirmation/:tok',(req,res) => {
    console.log('1')
    Token.findOne({ token : req.params.tok }, function (err, token) {
        console.log("2")
        console.log(token)
        if(err){
            res.status(500).json({
                error : err
            })
        }
        console.log("3")
        if(!token){
            console.log("4")
                  res.status(400).json({ 
                type: 'not-verified',
                message: 'Your token is expired.' 
            });
        }
            console.log("5")
            User.findOne({ _id: token._userId}, function (err, user) {

                if (!user){
                    res.status(400).json({ 
                        message: 'We can not find a user for this token.' 
                        });
                }
                if (user.isVerified=='true'){
                    res.status(400).json({ 
                        type: 'already-verified', 
                        message: 'This user has already been verified.' 
                    });
                }
                console.log("6")
                            // Verify and save the user
            user.isVerified = true;
            user.save(function (err) {
                if (err) {  res.status(500).json({ error: err.message }); }
                res.status(200).send("The account has been verified. Please log in.");
            });
            })
        })
    })


router.delete('/delete/:userId',verifyToken,(req,res) => {
    User.remove({_id : req.params.userId}).exec()
    .then(result => {
        //si le id nexiste pas il va affiche le 2em massage car lenght est >1
        if(res.adminData.role=='admin' || res.adminData.role=='supperAdmin'){
            if(result.deletedCount == 1){
             res.status(200).json({
                message : "User Deleted"
            }) 
        }else{
            console.log(result)
             res.status(404).json({
                message : "User Not Founded"
            })
        }
    }else{
         res.status(404).json({
            message : "I Cant Give You Data You Are Not A Member"
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

/*
function verifyToken (req,res,next){
    //format of token => Authorization:  Bearer <token>
    const bearerHeader = req.headers['authorization']
    if(typeof bearerHeader !== 'undefined'){
        //split at the space
        const bearer = bearerHeader.split(' ')
        //get token from array
        const token = bearer[1]
        //set the token
        req.token = token
    }else{
            res.status(403).json({
            message : 'Forbiden'
        })    
    }
}
*/

// router.put('/:userId',(req,res) => {
//     // var data = {
//     //      "email" : req.body.email,
//     //      "password" : bcrypt.hashSync(req.body.password, 10),
//     //      "firstname" : req.body.firstname,
//     //      "lastname" : req.body.lastname
//     // }
//  User.update({_id : req.params.userId},req.body).exec()
//  .then(result => {
//      if(result){
//          res.status(201).json({
//              message : "Data Modifye"
//          });
//      }else{
//          res.status(404).json({
//              message : "User Not Founded"
//          });
//      }
//  }).catch(err => {
//      console.log(err);
//      res.status(500).json({
//          error : err
//      });
//  })

// }) 

//=============================================================
//Code Copier
//pour la verification de token je sais pas###############
router.put('/update/:id',function (req, res, next) {
    // fetch user
    console.log(req.params.id)
    User.findById(req.params.id, function(err, post) {
        if (err) return next(err);
        if(post){
        if(req.body){
        _.assign(post, req.body); // update user
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
        res.status(201).json({
            message : "Not Founded"
        });
    }
    });
});
//=============================================================

module.exports = router;



// //---------------------Password---------------------------------
// router.put('/UpdatePassword/:userId',(req,res) => {
//     if(req.body.password){
//         var hash = bcrypt.hashSync(req.body.password, 10);
//         var data = {"password" : hash}
//             User.updateOne({_id : req.params.userId},data).exec()
//             .then(result => {
//                 res.status(201).json({
//                     message : "Password Modifye"
//                 });
//             }).catch(err => {
//                 res.status(500).json({
//                     error : err
//                 });
//             })
// }else{ res.status(404).json({
// message : "Password Not Modifye => Empty"
// });
// }
// });    
// //---------------------Email---------------------------------   
// router.put('/UpdateEmail/:userId',(req,res) => {
//     if(req.body.email){
//         var data = {"email" : req.body.email}
//         User.updateOne({_id : req.params.userId},data).exec()
//         .then(result => {
//             res.status(201).json({
//                 message : "Email Modifye"
//             });
//         }).catch(err => {
//             res.status(500).json({
//                 error : err
//             });
//         })  
// }else{ res.status(404).json({
// message : " Email Modifye => Empty"
// });
// }
// });
// //---------------------Firstname---------------------------------            
// router.put('/UpdateFirstname/:userId',(req,res) => {
//     if(req.body.firstname){
//         var data = {"firstname" : req.body.firstname}
//         User.updateOne({_id : req.params.userId},data).exec()
//         .then(result => {
//             res.status(201).json({
//                 message : "Firstname Modifye"
//             });
//         }).catch(err => {
//             res.status(500).json({
//                 error : err
//             });
//         })        
// }else{ res.status(404).json({
// message : "Firstname Not Modifye => Empty"
// });
// }
// });
// //---------------------Lastname---------------------------------            
// router.put('/UpdateLastname/:userId',(req,res) => {
//     if(req.body.lastname){
//         var data = {"lastname" : req.body.lastname}
//         User.updateOne({_id : req.params.userId},data).exec()
//         .then(result => {
//             res.status(201).json({
//                 message : "Lastname Modifye"
//             });
//         }).catch(err => {
//             res.status(500).json({
//                 error : err
//             });
//         })
// }else{ res.status(404).json({
// message : "Lastname Not Modifye => Empty"
// });
// }
// });
