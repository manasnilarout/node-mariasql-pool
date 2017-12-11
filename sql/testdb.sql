-- Run these queries before you start testing project
DROP DATABASE IF EXISTS test_db;

CREATE DATABASE test_db;

USE test_db;

CREATE TABLE users(
   id int auto_increment primary key,
   email varchar(25),
   user_name varchar(75)
);

INSERT INTO users (email, user_name) VALUES ('testuser@gmail.com', 'Test user');