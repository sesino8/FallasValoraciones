const Puntuacion = require('../models/puntuacion.model.js');

// Obtener todos los puntuaciones
 

exports.findAll = (req,res) => {

    console.log(req.body)
    Puntuacion.find().then(puntuaciones=>{
        res.status(200).send(puntuaciones);
    }).catch(err=>{
        res.status(500).send({
            message: err.message || " Algo fue mal mientras los capturabamos a todos"
        });
    });
};

exports.findOne = (req,res) => {
    console.log(req.params.puntuacionId);

    Puntuacion.find({ "_id" : req.params.puntuacionId }).then(puntuaciones=>{
        res.status(200).send(puntuaciones);
    }).catch(err=>{
        res.status(500).send({
            message: err.message || " Algo fue mal mientras los capturabamos a todos"
        });
    });

};

exports.findFalla = (req,res) => {
    console.log(req.body)
    Puntuacion.find().then(puntuaciones=>{
        res.status(200).send(puntuaciones);
    }).catch(err=>{
        res.status(500).send({
            message: err.message || " Algo fue mal mientras los capturabamos a todos"
        });
    });

};


// Crear y salvar
exports.create = (req,res)=>{
    
    // Validamos el puntuacion
    if (!req.body){
        return res.status(400).send({
           message:"puntuacion Vacio..." 
        });
    }

    const puntuacion = new Puntuacion({
        idFalla: req.params.idfalla || "idFallaVacio",
        ip: req.params.ip || "127.0.0.1",
        puntuacion: req.params.puntuacion|| 42
    })

    puntuacion.save().then(data =>{
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message|| "Something was wrong creating puntuacion"
        });
    });
};