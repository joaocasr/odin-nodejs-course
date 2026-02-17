#! /usr/bin/env node

import { Client } from "pg";
import 'dotenv/config' 

const SQL = `
CREATE TABLE seasons (
    season_id SERIAL PRIMARY KEY,
    season_year VARCHAR(50) NOT NULL
);

CREATE TABLE teams (
    team_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    country VARCHAR(50),
    founded_year INT
);

CREATE TABLE groups (
    group_id SERIAL PRIMARY KEY,
    season_id INT REFERENCES seasons(season_id) ON DELETE CASCADE,
    group_name CHAR(1) NOT NULL
);
CREATE TABLE group_teams (
    group_id INT REFERENCES groups(group_id) ON DELETE CASCADE,
    team_id INT REFERENCES teams(team_id),
    PRIMARY KEY (group_id, team_id)
);

CREATE TABLE group_matches (
    match_id SERIAL PRIMARY KEY,
    group_id INT REFERENCES groups(group_id) ON DELETE CASCADE,
    match_date TIMESTAMP,
    home_team_id INT REFERENCES teams(team_id),
    away_team_id INT REFERENCES teams(team_id),
    home_goals INT,
    away_goals INT
);

CREATE TABLE group_standings (
    standing_id SERIAL PRIMARY KEY,
    group_id INT REFERENCES groups(group_id) ON DELETE CASCADE,
    team_id INT REFERENCES teams(team_id),
    played INT DEFAULT 0,
    wins INT DEFAULT 0,
    draws INT DEFAULT 0,
    losses INT DEFAULT 0,
    goals_for INT DEFAULT 0,
    goals_against INT DEFAULT 0,
    points INT DEFAULT 0,
    UNIQUE(group_id, team_id)
);

CREATE TABLE knockout_rounds (
    round_id SERIAL PRIMARY KEY,
    season_id INT REFERENCES seasons(season_id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    round_order INT NOT NULL
);
CREATE TABLE knockout_ties (
    tie_id SERIAL PRIMARY KEY,
    round_id INT REFERENCES knockout_rounds(round_id) ON DELETE CASCADE,
    team_a_id INT REFERENCES teams(team_id),
    team_b_id INT REFERENCES teams(team_id),
    winner_team_id INT REFERENCES teams(team_id)
);

CREATE TABLE knockout_matches (
    match_id SERIAL PRIMARY KEY,
    tie_id INT REFERENCES knockout_ties(tie_id) ON DELETE CASCADE,
    leg_number INT NOT NULL,
    match_date VARCHAR(100),
    home_team_id INT REFERENCES teams(team_id),
    away_team_id INT REFERENCES teams(team_id),
    home_goals INT,
    away_goals INT
);

CREATE TABLE players (
    player_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    real_name VARCHAR(100),
    country VARCHAR(50),
    position VARCHAR(50),
    goals INT,
    matches INT,
    assists INT,
    yellows INT,
    reds INT
);

CREATE TABLE player_teams (
    player_id INT REFERENCES players(player_id),
    team_id INT REFERENCES teams(team_id),
    season_id INT REFERENCES seasons(season_id),
    PRIMARY KEY (player_id, season_id)
);
`
const population = `
INSERT INTO seasons (season_year)
VALUES ('2018-2019');

INSERT INTO teams (name, country, founded_year) VALUES
('Atlético Madrid','Spain',1903),
('Borussia Dortmund','Germany',1909),
('Club Brugge','Belgium',1891),
('Monaco','France',1924),

('Barcelona','Spain',1899),
('Tottenham Hotspur','England',1882),
('PSV Eindhoven','Netherlands',1913),
('Inter Milan','Italy',1908),

('Paris Saint-Germain','France',1970),
('Napoli','Italy',1926),
('Liverpool','England',1892),
('Red Star Belgrade','Serbia',1945),

('Porto','Portugal',1893),
('Schalke 04','Germany',1904),
('Galatasaray','Turkey',1905),
('Lokomotiv Moscow','Russia',1922),

('Bayern Munich','Germany',1900),
('Ajax','Netherlands',1900),
('Benfica','Portugal',1904),
('AEK Athens','Greece',1924),

('Manchester City','England',1880),
('Lyon','France',1950),
('Shakhtar Donetsk','Ukraine',1936),
('Hoffenheim','Germany',1899),

('Real Madrid','Spain',1902),
('Roma','Italy',1927),
('CSKA Moscow','Russia',1911),
('Viktoria Plzen','Czech Republic',1911),

('Juventus','Italy',1897),
('Manchester United','England',1878),
('Valencia','Spain',1919),
('Young Boys','Switzerland',1898);

INSERT INTO groups (season_id, group_name) VALUES
(1,'A'),(1,'B'),(1,'C'),(1,'D'),
(1,'E'),(1,'F'),(1,'G'),(1,'H');

INSERT INTO group_teams VALUES
-- Group A
(1,1),(1,2),(1,3),(1,4),

-- Group B
(2,5),(2,6),(2,7),(2,8),

-- Group C
(3,9),(3,10),(3,11),(3,12),

-- Group D
(4,13),(4,14),(4,15),(4,16),

-- Group E
(5,17),(5,18),(5,19),(5,20),

-- Group F
(6,21),(6,22),(6,23),(6,24),

-- Group G
(7,25),(7,26),(7,27),(7,28),

-- Group H
(8,29),(8,30),(8,31),(8,32);

INSERT INTO group_standings
(group_id, team_id, played, wins, draws, losses, goals_for, goals_against, points)
VALUES

-- A
(1,1,6,4,1,1,9,6,13),
(1,2,6,4,1,1,10,2,13),
(1,3,6,1,3,2,6,7,6),
(1,4,6,0,1,5,2,12,1),

-- B
(2,5,6,4,2,0,14,5,14),
(2,6,6,2,2,2,9,10,8),
(2,7,6,2,2,2,6,9,8),
(2,8,6,0,0,6,2,7,0),

-- C
(3,9,6,3,2,1,17,9,11),
(3,10,6,3,0,3,7,7,9),
(3,11,6,3,0,3,9,7,9),
(3,12,6,1,2,3,5,15,5),

-- D
(4,13,6,5,1,0,15,6,16),
(4,14,6,3,2,1,5,4,11),
(4,15,6,1,1,4,5,9,4),
(4,16,6,1,0,5,4,10,3),

-- E
(5,17,6,4,2,0,14,2,14),
(5,18,6,3,3,0,11,2,12),
(5,19,6,2,1,3,6,10,7),
(5,20,6,0,0,6,2,19,0),

-- F
(6,21,6,4,1,1,10,6,13),
(6,22,6,2,2,2,11,11,8),
(6,23,6,1,3,2,8,16,6),
(6,24,6,0,4,2,8,12,4),

-- G
(7,25,6,4,0,2,12,11,12),
(7,26,6,3,3,0,12,6,12),
(7,27,6,2,1,3,8,9,7),
(7,28,6,0,2,4,5,11,2),

-- H
(8,29,6,4,0,2,9,7,12),
(8,30,6,3,3,0,12,4,12),
(8,31,6,2,2,2,8,8,8),
(8,32,6,1,1,4,7,17,4);

INSERT INTO knockout_rounds (season_id, name, round_order) VALUES
(1,'Round of 16',1),
(1,'Quarter-finals',2),
(1,'Semi-finals',3),
(1,'Final',4);

INSERT INTO knockout_ties (round_id, team_a_id, team_b_id, winner_team_id) VALUES
(1,17,11,11), -- Bayern vs Liverpool
(1,9,30,30),    -- PSG vs Manchester
(1,25,18,18),  -- Real Madrid vs Ajax
(1,5,22,5),    -- Barcelona vs Lyon
(1,29,1,29), -- Juventus vs Atlético
(1,14,21,21),    -- Man City vs Schalke
(1,13,18,13), -- Porto vs Roma
(1,6,2,6);  -- Dortmund vs totenham

INSERT INTO knockout_matches
(tie_id, leg_number, match_date, home_team_id, away_team_id, home_goals, away_goals)
VALUES
(1,1,'2019-02-19',17,11,0,0),
(1,2,'2019-03-13',11,17,3,1),

(2,1,'2019-02-14',30,9,0,2),
(2,2,'2019-03-06',9,30,1,3),

(3,1,'2019-02-13',18,25,1,2),
(3,2,'2019-03-05',25,18,1,4),

(4,1,'2019-02-13',22,5,0,0),
(4,2,'2019-03-05',5,22,5,0),

(5,1,'2019-02-20',1,29,2,0),
(5,2,'2019-03-12',29,1,3,0),

(6,1,'2019-02-20',14,21,2,3),
(6,2,'2019-03-12',21,14,7,0),

(7,1,'2019-03-06',26,13,2,1),
(7,2,'2019-02-12',13,26,2,1),

(8,1,'2019-02-19',6,2,3,0),
(8,2,'2019-03-13',2,6,0,1);


INSERT INTO knockout_ties (round_id, team_a_id, team_b_id, winner_team_id) VALUES
(2,11,13,11), -- Liverpool vs Porto
(2,18,29,18),   -- Juventus vs Ajax
(2,6,29,6),   -- Man City vs Tottenham
(2,21,5,5);  -- Barcelona vs Man United

INSERT INTO knockout_matches
(tie_id, leg_number, match_date, home_team_id, away_team_id, home_goals, away_goals) VALUES
(9,1,'2019-04-09',11,13,2,0),
(9,2,'2019-04-17',13,11,1,4),

(10,1,'2019-04-10',18,29,1,1),
(10,2,'2019-04-16',29,18,1,2),

(11,1,'2019-04-09',6,21,1,0),
(11,2,'2019-04-17',21,6,4,3),

(12,1,'2019-04-10',30,5,0,1),
(12,2,'2019-04-16',5,30,3,0);

INSERT INTO knockout_ties (round_id, team_a_id, team_b_id, winner_team_id) VALUES
(3,11,5,11), -- Liverpool vs Barcelona
(3,6,18,6);   -- Tottenham vs Ajax

INSERT INTO knockout_matches
(tie_id, leg_number, match_date, home_team_id, away_team_id, home_goals, away_goals) VALUES
(13,1,'2019-05-01',5,11,3,0),
(13,2,'2019-05-07',11,5,4,0),

(14,1,'2019-04-30',6,18,0,1),
(14,2,'2019-05-08',18,6,2,3);

INSERT INTO knockout_ties (round_id, team_a_id, team_b_id, winner_team_id)
VALUES (4,11,6,11);

INSERT INTO knockout_matches
(tie_id, leg_number, match_date, home_team_id, away_team_id, home_goals, away_goals) VALUES
(15,1,'2019-06-01',11,6,2,0);

INSERT INTO players (name, real_name, country, position, goals, matches, assists, yellows, reds) VALUES
-- Atlético Madrid
('Jan Oblak','Jan Oblak','Slovenia','Goalkeeper',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Antoine Griezmann','Antoine Griezmann','France','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Diego Godín','Diego Godín','Uruguay','Defender',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- Borussia Dortmund
('Marco Reus','Marco Reus','Germany','Midfielder',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Jadon Sancho','Jadon Sancho','England','Winger',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Axel Witsel','Axel Witsel','Belgium','Midfielder',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- Club Brugge
('Hans Vanaken','Hans Vanaken','Belgium','Midfielder',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Wesley Moraes','Wesley Moraes','Brazil','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Ruud Vormer','Ruud Vormer','Netherlands','Midfielder',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- Monaco
('Radamel Falcao','Radamel Falcao','Colombia','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Youri Tielemans','Youri Tielemans','Belgium','Midfielder',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Danijel Subašić','Danijel Subašić','Croatia','Goalkeeper',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- Barcelona
('Lionel Messi','Lionel Messi','Argentina','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Luis Suárez','Luis Suárez','Uruguay','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Gerard Piqué','Gerard Piqué','Spain','Defender',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- Tottenham
('Harry Kane','Harry Kane','England','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Heung-min Son','Son Heung-min','South Korea','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Hugo Lloris','Hugo Lloris','France','Goalkeeper',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- PSV
('Hirving Lozano','Hirving Lozano','Mexico','Winger',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Luuk de Jong','Luuk de Jong','Netherlands','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Jeroen Zoet','Jeroen Zoet','Netherlands','Goalkeeper',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- Inter
('Mauro Icardi','Mauro Icardi','Argentina','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Ivan Perišić','Ivan Perišić','Croatia','Winger',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Samir Handanović','Samir Handanović','Slovenia','Goalkeeper',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- PSG
('Kylian Mbappé','Kylian Mbappé','France','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Neymar','Neymar Jr','Brazil','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Edinson Cavani','Edinson Cavani','Uruguay','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- Napoli
('Lorenzo Insigne','Lorenzo Insigne','Italy','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Dries Mertens','Dries Mertens','Belgium','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Kalidou Koulibaly','Kalidou Koulibaly','Senegal','Defender',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- Liverpool
('Mohamed Salah','Mohamed Salah','Egypt','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Virgil van Dijk','Virgil van Dijk','Netherlands','Defender',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Alisson Becker','Alisson Becker','Brazil','Goalkeeper',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- Red Star
('Marko Marin','Marko Marin','Germany','Midfielder',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('El Fardou Ben','El Fardou Ben','Comoros','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Milan Borjan','Milan Borjan','Canada','Goalkeeper',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- Porto
('Iker Casillas','Iker Casillas','Spain','Goalkeeper',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Éder Militão','Éder Militão','Brazil','Defender',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Jesús Corona','Jesús Corona','Mexico','Winger',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- Schalke
('Weston McKennie','Weston McKennie','USA','Midfielder',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Naldo','Ronaldo Aparecido Rodrigues','Brazil','Defender',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Alexander Nübel','Alexander Nübel','Germany','Goalkeeper',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- Galatasaray
('Fernando Muslera','Fernando Muslera','Uruguay','Goalkeeper',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Younès Belhanda','Younès Belhanda','Morocco','Midfielder',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Sofiane Feghouli','Sofiane Feghouli','Algeria','Winger',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- Lokomotiv Moscow
('Manuel Fernandes','Manuel Fernandes','Portugal','Midfielder',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Fyodor Smolov','Fyodor Smolov','Russia','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Guilherme Marinato','Guilherme Marinato','Brazil','Goalkeeper',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- Bayern
('Robert Lewandowski','Robert Lewandowski','Poland','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Thomas Müller','Thomas Müller','Germany','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Manuel Neuer','Manuel Neuer','Germany','Goalkeeper',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- Ajax
('Frenkie de Jong','Frenkie de Jong','Netherlands','Midfielder',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Matthijs de Ligt','Matthijs de Ligt','Netherlands','Defender',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Dušan Tadić','Dušan Tadić','Serbia','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- Benfica
('João Félix','João Félix','Portugal','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Rúben Dias','Rúben Dias','Portugal','Defender',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Odysseas Vlachodimos','Odysseas Vlachodimos','Greece','Goalkeeper',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- AEK Athens
('Petros Mantalos','Petros Mantalos','Greece','Midfielder',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Ezequiel Ponce','Ezequiel Ponce','Argentina','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Vasilis Barkas','Vasilis Barkas','Greece','Goalkeeper',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- Man City
('Kevin De Bruyne','Kevin De Bruyne','Belgium','Midfielder',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Sergio Agüero','Sergio Agüero','Argentina','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Ederson','Ederson Moraes','Brazil','Goalkeeper',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- Lyon
('Memphis Depay','Memphis Depay','Netherlands','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Nabil Fekir','Nabil Fekir','France','Midfielder',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Anthony Lopes','Anthony Lopes','Portugal','Goalkeeper',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- Shakhtar
('Taison','Taison Barcellos','Brazil','Winger',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Marlos','Marlos Romero','Ukraine','Midfielder',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Andriy Pyatov','Andriy Pyatov','Ukraine','Goalkeeper',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- Hoffenheim
('Andrej Kramarić','Andrej Kramarić','Croatia','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Kerem Demirbay','Kerem Demirbay','Germany','Midfielder',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Oliver Baumann','Oliver Baumann','Germany','Goalkeeper',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- Real Madrid
('Cristiano Ronaldo','Cristiano Ronaldo','Portugal','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Luka Modrić','Luka Modrić','Croatia','Midfielder',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Sergio Ramos','Sergio Ramos','Spain','Defender',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- Roma
('Edin Džeko','Edin Džeko','Bosnia','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Daniele De Rossi','Daniele De Rossi','Italy','Midfielder',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Alisson','Alisson Becker','Brazil','Goalkeeper',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- CSKA
('Alan Dzagoev','Alan Dzagoev','Russia','Midfielder',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Fedor Chalov','Fedor Chalov','Russia','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Igor Akinfeev','Igor Akinfeev','Russia','Goalkeeper',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- Plzen
('Patrik Hrošovský','Patrik Hrošovský','Slovakia','Midfielder',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Michael Krmenčík','Michael Krmenčík','Czech Republic','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Aleš Hruška','Aleš Hruška','Czech Republic','Goalkeeper',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- Juventus
('Cristiano Ronaldo Juve','Cristiano Ronaldo','Portugal','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Paulo Dybala','Paulo Dybala','Argentina','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Gianluigi Buffon','Gianluigi Buffon','Italy','Goalkeeper',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- Man United
('Paul Pogba','Paul Pogba','France','Midfielder',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Marcus Rashford','Marcus Rashford','England','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('David De Gea','David De Gea','Spain','Goalkeeper',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- Valencia
('Rodrigo Moreno','Rodrigo Moreno','Spain','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Dani Parejo','Dani Parejo','Spain','Midfielder',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Neto','Norberto Neto','Brazil','Goalkeeper',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),

-- Young Boys
('Guillaume Hoarau','Guillaume Hoarau','France','Forward',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('Christian Fassnacht','Christian Fassnacht','Switzerland','Midfielder',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1)),
('David von Ballmoos','David von Ballmoos','Switzerland','Goalkeeper',floor(random()*3),floor(random()*13)+1,floor(random()*2),floor(random()*3),floor(random()*1));

INSERT INTO player_teams (player_id,team_id,season_id) VALUES
(1,1,1),
(2,1,1),
(3,1,1),
(4,2,1),
(5,2,1),
(6,2,1),
(7,3,1),
(8,3,1),
(9,3,1),
(10,4,1),
(11,4,1),
(12,4,1),
(13,5,1),
(14,5,1),
(15,5,1),
(16,6,1),
(17,6,1),
(18,6,1),
(19,7,1),
(20,7,1),
(21,7,1),
(22,8,1),
(23,8,1),
(24,8,1),
(25,9,1),
(26,9,1),
(27,9,1),
(28,10,1),
(29,10,1),
(30,10,1),
(31,11,1),
(32,11,1),
(33,11,1),
(34,12,1),
(35,12,1),
(36,12,1),
(37,13,1),
(38,13,1),
(39,13,1),
(40,14,1),
(41,14,1),
(42,14,1),
(43,15,1),
(44,15,1),
(45,15,1),
(46,16,1),
(47,16,1),
(48,16,1),
(49,17,1),
(50,17,1),
(51,17,1),
(52,18,1),
(53,18,1),
(54,18,1),
(55,19,1),
(56,19,1),
(57,19,1),
(58,20,1),
(59,20,1),
(60,20,1),
(61,21,1),
(62,21,1),
(63,21,1),
(64,22,1),
(65,22,1),
(66,22,1),
(67,23,1),
(68,23,1),
(69,23,1),
(70,24,1),
(71,24,1),
(72,24,1),
(73,25,1),
(74,25,1),
(75,25,1),
(76,26,1),
(77,26,1),
(78,26,1),
(79,27,1),
(80,27,1),
(81,27,1),
(82,28,1),
(83,28,1),
(84,28,1),
(85,29,1),
(86,29,1),
(87,29,1),
(88,30,1),
(89,30,1),
(90,30,1),
(91,31,1),
(92,31,1),
(93,31,1),
(94,32,1),
(95,32,1),
(96,32,1);
`

async function main() {
  console.log("seeding...");
  const client = new Client({
    connectionString: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`,
  });
  await client.connect();
  await client.query(SQL);
  console.log("created tables");

  await client.query(population);
  console.log("population done");

  await client.end();
  console.log("done");
}

main();
