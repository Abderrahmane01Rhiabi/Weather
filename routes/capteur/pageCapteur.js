const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const verifyToken = require('../../middleware/verifyToken')
var _ = require('lodash');
var mqtt = require('mqtt');
const thingsboardHost = "demo.thingsboard.io";
// Reads the access token from arguments
const accessToken = "WHWNzii8l9CdXUhAdVAO";

const secret = "secret";

//Models
const Capteur = require('../../models/capteurs');
const Weather = require('../../models/weather');

router.get('/allDataCapteur',(req,res)=>{
    // if(res.adminData.role=='admin' || res.adminData.role=='supperAdmin' || res.adminData.role=='user'){
            Capteur.find({}).exec()
            .then(data =>{
                res.status(200).json(data)
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    error : err
                });
            })    
    // }else{
    //     res.status(404).json({
    //         message : "I Cant Give You Data You Are Not A Member"
    //     }) 
    // }
})

router.get('/dataCapteur/:macAddr',(req,res)=>{
    // if(res.adminData.role=='admin' || res.adminData.role=='supperAdmin' || res.adminData.role=='user'){
            Capteur.findOne({macAddr: req.params.macAddr}).exec()
            .then(data =>{
                if(data){
                res.status(200).json(data)
                }else{
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
            })    
    // }else{
    //     res.status(404).json({
    //         message : "I Cant Give You Data You Are Not A Member"
    //     }) 
    // }
})


router.post('/addCapteur',verifyToken, function(req,res){
    if(res.adminData.role=='admin' || res.adminData.role=='supperAdmin'){
    console.log('1')
    console.log(req.body.macAddr)

    Capteur.findOne({macAddr : req.body.macAddr})
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
                console.log(req.body.name)
                console.log(req.body.place)
                console.log(req.body.macAddr)
                var data = {
                        "name" : req.body.name,
                        "place_x" : req.body.place_x,
                        "place_y" : req.body.place_y,
                        "macAddr" : req.body.macAddr
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
        
        })    
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error : err
            });
        });
    }else{
        res.status(404).json({
            message : "I Cant Give You Data You Are Not A Member"
        }) 
    }
});

// router.post('/deleteCapteur',verifyToken,(req,res) => {
//     if(res.adminData.role=='admin' || res.adminData.role=='supperAdmin'){
//     Capteur.remove({macAddr : req.body.macAddr}).exec()
//     .then(result => {
//         //si le id nexiste pas il va affiche le 2em massage car lenght est >1
//         if(result.deletedCount >= 1){
//             console.log(result)
//             res.status(200).json({
//                 message : "Capteur Deleted"
//             }) 
//         }else{
//             console.log(result)
//             res.status(404).json({
//                 message : "Capteur Not Founded"
//             })
//         }
//     })
//     .catch(err => {
//         console.log(err);
//         res.status(500).json({
//             error : err
//         });
//     });
//     }else{
//         res.status(404).json({
//         message : "I Cant Give You Data You Are Not A Member"
//     })    
//     }  
// });

router.post('/deleteCapteur/:macAddr',verifyToken,(req,res) => {
    if(res.adminData.role=='admin' || res.adminData.role=='supperAdmin'){
    Capteur.remove({macAddr : req.params.macAddr}).exec()
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
    }else{
        res.status(404).json({
        message : "I Cant Give You Data You Are Not A Member"
    })    
    }  
});
// router.delete('/deleteCapteur',(req,res) => {
//     // if(res.adminData.role=='admin' || res.adminData.role=='supperAdmin'){
//     Capteur.remove({macAddr : req.body.macAddr}).exec()
//     .then(result => {
//         //si le id nexiste pas il va affiche le 2em massage car lenght est >1
//         if(result.deletedCount >= 1){
//             console.log(result)
//             res.status(200).json({
//                 message : "Capteur Deleted"
//             }) 
//         }else{
//             console.log(result)
//             res.status(404).json({
//                 message : "Capteur Not Founded"
//             })
//         }
//     })
//     .catch(err => {
//         console.log(err);
//         res.status(500).json({
//             error : err
//         });
//     });
//     // }else{
//     //     res.status(404).json({
//     //     message : "I Cant Give You Data You Are Not A Member"
//     // })    
//     // }  
// });


// router.put('/updateCapteur',function (req, res, next) {
//     // if(res.adminData.role=='admin' || res.adminData.role=='supperAdmin'){
//     Capteur.findOne({macAddr : req.body.macAddr}, function(err, post) {
//         if(post){
//         if (err) return next(err);
//         if(req.body){
//         _.assign(post, req.body); 
//         post.save(function(err) {
//             if (err) return next(err);
//          res.status(201).json({
//              message : "Data Modifye"
//          });
//                 // return res.json(200, post);
//         })
//         }else{
//             res.status(404).json({
//                 message : "No Data Modifye"
//             });
//         }
//     }else{
//         res.status(404).json({
//             message : "Capteur Not Founded"
//         });
//     }
//     });
//     // }else{
//     //     res.status(404).json({
//     //         message : "I Cant Give You Data You Are Not A Member"
//     //     })  
//     // }
// });

router.post('/updateCapteur',verifyToken,function (req, res, next) {
    if(res.adminData.role=='admin' || res.adminData.role=='supperAdmin'){
    Capteur.findOne({macAddr : req.body.macAddr}, function(err, post) {
        if(post){
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
    }else{
        res.status(404).json({
            message : "Capteur Not Founded"
        });
    }
    });
    }else{
        res.status(404).json({
            message : "I Cant Give You Data You Are Not A Member"
        })  
    }
});

router.post('/weatherData',(req,res) =>{
    Capteur.find({}).exec()
    .then(result => {
            if(!result){
                return res.status(409).json({
                    message : 'Capteur Is Not Existe'
                });
            }
            else{
                console.log(result)
                console.log(result.length)


                    const minTemperature = 17.5, maxTemperature = 30, minHumidity = 12, maxHumidity = 90;

                    // Initialization of temperature and humidity data with random values
                    var data = {
                        temperature: minTemperature + (maxTemperature - minTemperature) * Math.random() ,
                        humidity: minHumidity + (maxHumidity - minHumidity) * Math.random()
                    };

                    // Initialization of mqtt client using Thingsboard host and device access token
                    console.log('Connecting to: %s using access token: %s', thingsboardHost, accessToken);
                    var client  = mqtt.connect('mqtt://'+ thingsboardHost, { username: accessToken });
                    console.log('mqtt://'+ thingsboardHost, { username: accessToken })

                    // Triggers when client is successfully connected to the Thingsboard server

                    client.on('connect', function () {
                        console.log('Client connected!');
                        client.publish('v1/devices/me/attributes', JSON.stringify({"firmware_version":"1.0.1"}));
                        console.log('Uploading temperature and humidity data evry 5 second...');
                        setInterval(publishTelemetry, 10*1000);
                    });
                    // client.off('disconnect',function(){
                    //     console.log('Stop sending data');
                    // })
                    // Uploads telemetry data using 'v1/devices/me/telemetry' MQTT topic
                    function publishTelemetry() {
                        for(var i=0;i<result.length;i++)    {

                        data.temperature = genNextValue(data.temperature, minTemperature, maxTemperature);
                        data.humidity = genNextValue(data.humidity, minHumidity, maxHumidity);
                        client.publish('v1/devices/me/telemetry', JSON.stringify(data));
                        console.log('v1/devices/me/telemetry', JSON.stringify(data))
                        var d = {
                            "temp" : data.temperature,
                            "humidite" : data.humidity,
                            "macAddCapt" : result[i].macAddr
                        }
                        console.log(result[i].macAddr)
                         var newData = new Weather(d)
                         newData.save()
                         .then(err => {
                            if(err) return err; 
                             res.status(200).json({
                                 message : "data arrive"
                             })
                        })
                        .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error : err
                                });
                            })

                    }

                    // Generates new random value that is within 3% range from previous value
                    function genNextValue(prevValue, min, max) {
                        var value = prevValue + ((max - min) * (Math.random() - 0.5)) * 0.03;
                        value = Math.max(min, Math.min(max, value));
                        return Math.round(value * 10) / 10;
                    }

                    //Catches ctrl+c event
                    process.on('SIGINT', function () {
                        console.log();
                        console.log('Disconnecting...');
                        client.end();
                        // res.status(200).json({
                        //     message : "data arrive"
                        // })
                        console.log('Exited!');
                        process.exit(2);
                    });

                    //Catches uncaught exceptions
                    process.on('uncaughtException', function(e) {
                        console.log('Uncaught Exception...');
                        console.log(e.stack);
                        process.exit(99);
                    });
                // var data = {
                //     "macAddCapt" : req.params.macAddCapt,
                //     "temp" : req.params.temp,
                //     "humidite" : req.params.humi 
                // }
                // var newData = new Weather(data)
            }
        
        }
    }).catch(err =>{
         res.status(500).json({
            error : err
        });
     })
 })

router.get('/temp&humi/:macAddCapt/day',(req,res) => {
    // if(res.adminData.role=='admin' || res.adminData.role=='supperAdmin' || res.adminData.role=='user'){
    var d = new Date()
    var date = new Date(d.getFullYear(),d.getMonth(),d.getDate(),00,59,59)
    console.log(date)
    var dd = new Date(d - (24*60*60*1000))
    var datee = new Date(dd.getFullYear(),dd.getMonth(),dd.getDate(),00,59,59)
    console.log(datee)
    Capteur.findOne({macAddr :  req.params.macAddCapt }).exec()
    .then(result => {
        if(result){
            Weather.find({macAddCapt : req.params.macAddCapt , dateOfcomming : {$gte : datee , $lte : date}},{_id : 0,temp : 1,humidite : 1}).exec()
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
                            message : "No Data Existe"
                        })
                    }
                })    
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error : err
                    });
                });        
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
    // }else{
    //     res.status(404).json({
    //         message : "I Cant Give You Data You Are Not A Member"
    //     }) 
    // }
})




router.get('/temp&humi/:macAddCapt/week',(req,res) => {
    // if(res.adminData.role=='admin' || res.adminData.role=='supperAdmin' || res.adminData.role=='user'){

    var d = new Date()
    var date = new Date(d.getFullYear(),d.getMonth(),d.getDate(),00,59,59)
    console.log(date)
    var dd = new Date(d - (7*24*60*60*1000))
    var datee = new Date(dd.getFullYear(),dd.getMonth(),dd.getDate(),00,59,59)
    console.log(datee)
    Capteur.findOne({macAddr :  req.params.macAddCapt }).exec()
    .then(result => {
        if(result){
            Weather.find({macAddCapt : req.params.macAddCapt , dateOfcomming : {$gte : datee , $lte : date}},{_id : 0,temp : 1,humidite : 1}).exec()
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
                            message : "No Data Existe"
                        })
                    }
                })    
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error : err
                    });
                });        
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
    // }else{
    //     res.status(404).json({
    //         message : "I Cant Give You Data You Are Not A Member"
    //     })    
    // }
})




router.get('/temp&humi/:macAddCapt/month',(req,res) => {
    // if(res.adminData.role=='admin' || res.adminData.role=='supperAdmin' || res.adminData.role=='user'){ 
    var d = new Date()
    var date = new Date(d.getFullYear(),d.getMonth(),d.getDate(),00,59,59)
    console.log(date)
    var dd = new Date(d - (30*24*60*60*1000))
    var datee = new Date(dd.getFullYear(),dd.getMonth(),dd.getDate(),00,59,59)
    console.log(datee)
    Capteur.findOne({macAddr :  req.params.macAddCapt }).exec()
    .then(result => {
        if(result){
            console.log("111")
            Weather.find({macAddCapt : req.params.macAddCapt , dateOfcomming : {$gte : datee , $lte : date}}).exec()
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
                            message : "No Data Existe"
                        })
                    }
                })    
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error : err
                    });
                });        
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
    // }else{
    //     res.status(404).json({
    //         message : "I Cant Give You Data You Are Not A Member"
    //     })   
    // }
})




router.get('/temp&humi/:macAddCapt/moyThisDay',(req,res) => {
    // if(res.adminData.role=='admin' || res.adminData.role=='supperAdmin' || res.adminData.role=='user'){
        var d = new Date()
    var date = new Date(d.getFullYear(),d.getMonth(),d.getDate(),00,59,59)
    console.log(date)
    var datee = new Date()
    console.log(datee)

    Capteur.findOne({macAddr :  req.params.macAddCapt }).exec()
    .then(result => {
        if(result){
            Weather.find({macAddCapt : req.params.macAddCapt , dateOfcomming : {$gte : date , $lte : datee}},{_id : 0,temp : 1,humidite : 1}).exec()
            .then(data => {
                var nbr = data.length;
                var sum_temp = 0,
                    sum_humi = 0;
                for(var i = 0;i < data.length ; i++){   
                    sum_temp = sum_temp + data[i].temp;
                    sum_humi = sum_humi + data[i].humidite;    
            }
            var moy_temp = sum_temp/nbr;
            var moy_humi = sum_humi/nbr

                if(data){
                                    console.log(data.length)
                    console.log("222")

                    res.status(200).json({
                        moy_temp,
                        moy_humi
                            })
                }else{
                    res.status(404).json({
                        message : "No Data Existe"
                    })
                }
            })    
            .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error : err
                    });
                });        
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
    // }else{
    //     res.status(404).json({
    //     message : "I Cant Give You Data You Are Not A Member"
    // })        
    // }
})

router.get('/temp&humi/:macAddCapt/lastData',(req,res) => {
    // if(res.adminData.role=='admin' || res.adminData.role=='supperAdmin' || res.adminData.role=='user'){
        // var date = new Date()
        // console.log(date)
        // var datee = new Date(date - (10*60*1000))
        // console.log(datee)
    Capteur.findOne({macAddr :  req.params.macAddCapt }).exec()
    .then(result => {
        if(result){
            Weather.find({macAddCapt : req.params.macAddCapt}).sort({"dateOfcomming" : -1}).limit(1).exec()
            .then(data => {
                if(data){
                    console.log(data.length)
                    console.log("222")

                    res.status(200).json(data)
                }else{
                    res.status(404).json({
                        message : "No Data existe"
                    })
                }
            })    
            .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error : err
                    });
                });        
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
    // }else{
    //     res.status(404).json({
    //     message : "I Cant Give You Data You Are Not A Member"
    // })        
    // }
})


router.get("/allDataWeathers/:macAddr", function(req,res) {
    // if(res.adminData.role=='admin' || res.adminData.role=='supperAdmin' || res.adminData.role=='user'){
    Capteur.findOne({macAddr : req.params.macAddr}).exec()
    .then(result => {
    if(result){
        Weather.aggregate([
            { $match : {"macAddCapt" : req.params.macAddr}}, 
            {$lookup: {
                    from: "capteurs", // collection name in db
                    localField: "macAddCapt",
                    foreignField: "macAddr",
                    as: "Capteur"
                }
            }])
            .exec(function(err, data) {
                if (err) return err;
                res.json(data);
        
            });
    }else{
        res.status(404).json({
            message : "Capteur Is Not Existe"
        })
    }
    })
    // }else{
    //     res.status(404).json({
    //     message : "I Cant Give You Data You Are Not A Member"
    // })        
    // }
});

router.get('/temp&humi/:macAddCapt/maxTemp',(req,res) => {
    // if(res.adminData.role=='admin' || res.adminData.role=='supperAdmin' || res.adminData.role=='user'){
    Capteur.findOne({macAddr :  req.params.macAddCapt }).exec()
    .then(result => {
        if(result){
            Weather.find({macAddCapt : req.params.macAddCapt}).sort({temp : -1}).limit(1).exec()
            .then(data => {
                if(data){
                                    console.log(data.length)

                    console.log("222")

                    res.status(200).json(data)
                }else{
                    res.status(404).json({
                        message : "No Data Existe"
                    })
                }
            })    
            .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error : err
                    });
                });        
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
    // }else{
    //     res.status(404).json({
    //     message : "I Cant Give You Data You Are Not A Member"
    // })        
    // }
})

router.get('/temp&humi/:macAddCapt/minTemp',(req,res) => {
    // if(res.adminData.role=='admin' || res.adminData.role=='supperAdmin' || res.adminData.role=='user'){
    Capteur.findOne({macAddr :  req.params.macAddCapt }).exec()
    .then(result => {
        if(result){
            Weather.find({macAddCapt : req.params.macAddCapt}).sort({temp : +1}).limit(1).exec()
            .then(data => {
                console.log(data.length)
                if(data){
                    console.log("222")

                    res.status(200).json(data)
                }else{
                    res.status(404).json({
                        message : "No Data Existe"
                    })
                }
            })    
            .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error : err
                    });
                });        
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
    // }else{
    //     res.status(404).json({
    //     message : "I Cant Give You Data You Are Not A Member"
    // })        
    // }
})



router.get('/temp&humi/:macAddCapt/minHumi',(req,res) => {
    // if(res.adminData.role=='admin' || res.adminData.role=='supperAdmin' || res.adminData.role=='user'){
    Capteur.findOne({macAddr :  req.params.macAddCapt }).exec()
    .then(result => {
        if(result){
            Weather.find({macAddCapt : req.params.macAddCapt}).sort({humidite : +1}).limit(1).exec()
            .then(data => {
                if(data){   
                                 console.log(data.length)
                    console.log("222")

                    res.status(200).json(data)
                }else{
                    res.status(404).json({
                        message : "No Data Existe"
                    })
                }
            })    
            .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error : err
                    });
                });        
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
    // }else{
    //     res.status(404).json({
    //     message : "I Cant Give You Data You Are Not A Member"
    // })        
    // }
})


router.get('/temp&humi/:macAddCapt/maxHumi',(req,res) => {
    // if(res.adminData.role=='admin' || res.adminData.role=='supperAdmin' || res.adminData.role=='user'){
    Capteur.findOne({macAddr :  req.params.macAddCapt }).exec()
    .then(result => {
        if(result){
            Weather.find({macAddCapt : req.params.macAddCapt}).sort({humidite : -1}).limit(1).exec()
            .then(data => {
                if(data){
                    console.log(data.length)
                    console.log("222")

                    res.status(200).json(data)
                }else{
                    res.status(404).json({
                        message : "No Data Existe"
                    })
                }
            })    
            .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error : err
                    });
                });        
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
    // }else{
    //     res.status(404).json({
    //     message : "I Cant Give You Data You Are Not A Member"
    // })        
    // }
})


router.get("/xxx"  ,(req,res) =>{
    // var date = new Date()
    // console.log(date)
    // var datee = new Date(date - (24*60*60*1000))
    // console.log(datee)
    // var START = new Date()
    // var END = new Date(new Date() - (8*24*60*60*1000))
    // var date = new Date(new Date(START).setHours(00,00,00,00))
    // var datee = new Date(new Date(END).setHours(23,59,59,999))
    // console.log(date)
    // console.log(datee)
    var d = new Date()
    var date = new Date(d.getFullYear(),d.getMonth(),d.getDate(),00,59,59)
    console.log(date)
    var dd = new Date(d - (7*24*60*60*1000))
    var datee = new Date(dd.getFullYear(),dd.getMonth(),dd.getDate(),00,59,59)
    console.log(datee)
    
})
module.exports = router;
