const express = require('express');
const socketIO = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIO.listen(server);

io.on('connection', (socket) => {
    console.log('Nuevo socket conectado');
});


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

// Solicitando ingresar puerto COM

const inquirer = require("inquirer");
let pregunta = [];
let opciones = [];

SerialPort.list()
    .then((ports) => {
        console.log(`Opciones`);
        console.log(`=========`);
            ports.forEach((port) => {
                console.log(`${port.path}: ${port.manufacturer}`);
                opciones.push({
                    name: port.path
                }                      
                ); 
                }
            )            
            
            
            // console.log(opciones);

            pregunta = [{
                type: 'list',
                name: 'portOn',
                message: 'Ingrese puerto COM',
                choices: opciones
            }];

            // console.log(pregunta);

            inquirer.prompt(pregunta)
                .then ((portOn) => {
                let {portOn: portCom} = portOn;
                // console.log(portCom);
                const port = new SerialPort(portCom, (err) => {
                    if (err) {
                      return console.log('Error: ', err.message)
                    }
                    console.log(`Iniciando puerto serial ${portCom}`);
                });
                
                const parser = new Readline()
                port.pipe(parser)
                
                parser.on('data', (data) => {
                    // console.log(`${data.toString()}`);
                    
                    let cadena = data.toString();
                    let inicio = 0;
                    let fin = 0;
                    inicio = cadena.indexOf(' ');
                    fin = cadena.indexOf(',kg\r');
                    valor = cadena.slice(inicio, fin);
                
                    io.emit('data', {
                        value: valor                
                    });
                });

            });

        },
        err => console.error(err)
      )

server.listen(5000, () => {
    console.log('Servidor en puerto', 5000);
});

