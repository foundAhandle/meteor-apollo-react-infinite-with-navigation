// node insert.js

const settings = require('../settings-development.json');
const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: settings.private.root_pwd,
  multipleStatements: true,
});
const faker = require('faker');

connection.connect();

// sql
const dbSql = 'CREATE DATABASE IF NOT EXISTS apollo_test; USE apollo_test;';

const tableSql =
'CREATE TABLE `docs` (' +
  '`id` int(11) unsigned NOT NULL AUTO_INCREMENT,' +
  '`name` varchar(100) NOT NULL,' +
  'PRIMARY KEY (`id`)' +
');';

const userSql = "CREATE USER 'test_user'@'localhost' IDENTIFIED BY 'test'; " +
                "GRANT SELECT ON apollo_test.docs TO 'test_user'@'localhost';";

const insertSql = 'INSERT INTO docs (name) VALUES ?';
const insertVals = Array.from({ length: 2000 }, () => [faker.name.findName()]);

// db
const db = function() {
  const promise = new Promise(function(resolve, reject){
    connection.query(dbSql, function(err) {
      if (err) reject(err);
      console.log('db created');
      resolve();
    });
  });
  return promise;
};

// table
const table = function() {
  const promise = new Promise(function(resolve, reject){
    connection.query(tableSql, function(err) {
      if (err) reject(err);
      console.log('table created');
      resolve();
    });
  });
  return promise;
};

// user
const user = function() {
  const promise = new Promise(function(resolve, reject){
    connection.query(userSql, function(err) {
      if (err) reject(err);
      console.log('user created');
      resolve();
    });
  });
  return promise;
};

// insert
const insert = function() {
  const promise = new Promise(function(resolve, reject){
    connection.query(insertSql, [insertVals], function(err) {
      if (err) reject(err);
      console.log('inserted '+insertVals.length+' rows');
      resolve();
    });
  });
  return promise;
};

// end
const end = function() {
  const promise = new Promise(function(resolve, reject){
    connection.end();
  });
  return promise;
};

db()
  .then(table)
  .then(user)
  .then(insert)
  .then(end)
  .catch(function(err){
    console.log('err', err);
    connection.end();
  });
