/*jshint esversion: 6 */
/* global __dirname */

(() => {
  'use strict';
  
  const express = require('express');
  const bodyParser = require('body-parser');
  const mongoose = require('mongoose');
  const path = require('path');
  const config = require(__dirname + '/config.json');
  const app = express();
  const Score = require(__dirname + '/models/score');
  const Promise = require('bluebird');
  const http = require('http');
  const sprintf = require('sprintf').sprintf;
  const port = config.port || 3000;
   
  mongoose.Promise = Promise;
  mongoose.connect('mongodb://' + config.database.host + '/' + config.database.table);
  
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
      extended : true
  }));
  
  app.set('port', port);
  app.locals.scoreFormat = (value) => {
    return sprintf("%1.1f", value);
  };
  
  const getTopScores = (count) => {
    return Score.find()
      .sort({'score': -1})
      .limit(count)
      .exec();
  };
  
  app.post('/score/:apikey', (req, res) => {
    console.log(req.body);
    const apikey = req.params.apikey;
    if (!apikey || config.authorizedKeys.indexOf(apikey) < 0) {
      res.status(401).send('go away');
    } else {
      const score = new Score();
      score.name = req.body.name;
      score.score = req.body.score;
      score.created = new Date();
      score.save().then((score) => {
        res.send(score);
      }).catch((err) => {
        res.status(500).send(err);
      })
    }
  });
  
  app.get('/scores', (req, res) => {
    getTopScores(10)
      .then((scores) => {
        res.render('scorelist', {
          scores: scores
        });
      }).catch((err) => {
        res.status(500).send(err);
      });
  });
  
  app.get('/scores/json', (req, res) => {
    getTopScores(10)
      .then((scores) => {
        res.send(scores);
      }).catch((err) => {
        res.status(500).send(err);
      });
  });
  
  http.createServer(app).listen(app.get('port'), () => {
    console.log('Express server listening on port ' + app.get('port'));
  });
  
})();