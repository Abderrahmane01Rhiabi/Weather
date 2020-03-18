const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const verifyToken = require('../../middleware/verifyToken')
var _ = require('lodash');

const secret = "secret";

//Models
const Capteur = require('../../models/capteurs');
const Weather = require('../../models/weather');

router.post('/ajouteCapteur', function(req,res){
    console.log('1')
    console.log(req.body._macAddr)

    Capteur.findOne({_macAddr : req.body._macAddr})
    .exec()
    .then(capt => {
        console.log('2')
        if (capt){
            console.log('0')
            return res.status(409).json({
                message : 'Capteur Existe'
            });
        } else {
            console.log('3')
            var data = {
                    "name" : req.body.name,
                    "place" : req.body.place,
                    "_macAddr" : req.body._macAddr
                     }
                var newCapt = new Capteur(data);  
                console.log('4')   
                newCapt.save()
                .then(result => {
                    console.log('5')   
                    console.log(result);
                    res.status(201).json({
                        message : "Capteur added"
                    });
                }).catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error : err
                    });
                })
            }
       
        });
});

router.delete('/deleteCapteur/:_macAddr',(req,res) => {
    Capteur.remove({_macAddr : req.params._macAddr}).exec()
    .then(result => {
        //si le id nexiste pas il va affiche le 2em massage car lenght est >1
        if(result.deletedCount >= 1){
            console.log(result)
            res.status(200).json({
                message : "Capteur Deleted"
            }) 
        }else{
            console.log(result)
            res.status(404).json({
                message : "Capteur Not Founded"
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

router.put('/updateCapteur/:_macAddr',function (req, res, next) {

    Capteur.findById(req.params._macAddr, function(err, post) {
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
        res.status(404).json({
            message : "No Data Modifye"
        });
    }
    });
});

router.post('/weatherData/:_macAddCapt/:temp/:humi',(req,res) =>{
    Weather.find({_macAddCapt : req.params._macAddCapt }).exec()
    .then(result => {
            if(!result){
                return res.status(409).json({
                    message : 'Capteur Is Not Existe'
                });
            }
            else{
                var data = {
                    "_macAddCapt" : req.params._macAddCapt,
                    "temp" : req.params.temp,
                    "humidite" : req.params.humi 
                }
                var newData = new Weather(data)
                newData.save()
                .then(data => {
                    res.status(200).json({
                        message : "data arrive"
                    })
                })
            }
    }).catch(err =>{
        return res.status(500).json({
            error : err
        });
    })
})

router.get('/temp&humi/:_macAddCapt/day',(req,res) => {
    var date = new Date()
    console.log(date)
    var datee = new Date(date - (24*60*60*1000))
    console.log(datee) 
    Weather.find({_macAddCapt : req.params._macAddCapt , dateOfcomming : {$gte : datee , $lte : date}},{_id : 0,temp : 1,humidite : 1}).exec()
    .then(data => {
        if(data){
            console.log(data.length)
            var nbr = data.length;
            var sum_temp = 0,
                sum_humi = 0;
            for(var i = 0;i < data.length ; i++){   
                sum_temp = sum_temp + data[i].temp;
                sum_humi = sum_humi + data[i].humidite;    
        }
        var moy_temp = sum_temp/nbr;
        var moy_humi = sum_humi/nbr

            res.status(200).json({
                      moy_temp,moy_humi
                    })
        }else{
            res.status(404).json({
                message : "Capteur Is Not Existe"
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error : err
        });
    });
})

router.get('/temp&humi/:_macAddCapt/week',(req,res) => {
    var date = new Date()
    console.log(date)
    var datee = new Date(date - (7*24*60*60*1000))
    console.log(datee) 
    Weather.find({_macAddCapt : req.params._macAddCapt , dateOfcomming : {$gte : datee , $lte : date}},{_id : 0,temp : 1,humidite : 1}).exec()
    .then(data => {
        console.log(data.length)
        if(data){
            var nbr = data.length;
            var sum_temp = 0,
                sum_humi = 0;
            for(var i = 0;i < data.length ; i++){   
                sum_temp = sum_temp + data[i].temp;
                sum_humi = sum_humi + data[i].humidite;    
        }
        var moy_temp = sum_temp/nbr;
        var moy_humi = sum_humi/nbr

            res.status(200).json({
                      moy_temp,moy_humi
                    })
        }else{
            res.status(404).json({
                message : "Capteur Is Not Existe"
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error : err
        });
    });
})

router.get('/temp&humi/:_macAddCapt/month',(req,res) => {
    var date = new Date()
    console.log(date)
    var datee = new Date(date - (30*24*60*60*1000))
    console.log(datee) 
    Weather.find({_macAddCapt : req.params._macAddCapt , dateOfcomming : {$gte : datee , $lte : date}},{_id : 0,temp : 1,humidite : 1,dateOfcomming : 1}).sort('dateOfcomming').exec()
    .then(data => {
        console.log(data.length)
        if(data){
            var nbr = data.length;
            var sum_temp = 0,
                sum_humi = 0;
            for(var i = 0;i < data.length ; i++){   
                sum_temp = sum_temp + data[i].temp;
                sum_humi = sum_humi + data[i].humidite;    
        }
        var moy_temp = sum_temp/nbr;
        var moy_humi = sum_humi/nbr

            res.status(200).json({
                      moy_temp,moy_humi
                    })
        }else{
            res.status(404).json({
                message : "Capteur Is Not Existe"
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error : err
        });
    });
})


module.exports = router;
