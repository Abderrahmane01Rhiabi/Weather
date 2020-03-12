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
    Capteur.find({_id : req.body._id})
    .exec()
    .then(capt => {
        if (capt.length >= 1){
            return res.status(409).json({
                message : 'Capteur existe exists'
            });
        } else {

            var data = {
                    "name" : req.body.name,
                    "place" : req.body.place,
                    "macAddr" : req.body.macAddr
                     }
                var newCapt = new Capteur(data);     
                newCapt.save()
                .then(result => {
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

router.delete('/deleteCapteur/:macAddr',verifyToken,(req,res) => {
    Capteur.remove({_id : req.params.macAddr}).exec()
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

router.put('/updateCapteur/:macAddr',verifyToken,function (req, res, next) {

    Capteur.findById(req.params.macAddr, function(err, post) {
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
    });
});

router.post('/weatherData/:macAddCapt',(req,res) =>{
    var data = {
        "macAddCapt" : req.params.macAddCapt,
        "temp" : "12",
        "humidite" : "32" 
    }
    var newData = new Weather(data)
    newData.save()
    .then(data => {
        res.status(200).send({
            message : "data arrive"
        })
    })
})

router.get('/temp&humi/:macAddCapt/day',(req,res) => {
    var date = new Date()
    console.log(date)
    //console.log(date - 24*60*60*1000)
    var datee = new Date(date - (24*60*60*1000))
    console.log(datee)
     
    Weather.find({macAddCapt : req.params.macAddCapt , dateOfcomming : {$gte : datee , $lte : date}},{_id : 0,temp : 1,humidite : 1}).exec()
    .then(data => {
        if(data){
            res.status(200).json(data)
        }else{
            res.status(200).json({
                message : "no data found"
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