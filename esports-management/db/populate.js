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
    position VARCHAR(50)
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

INSERT INTO players (name, real_name, country, position) VALUES

-- Atlético Madrid
('Jan Oblak','Jan Oblak','Slovenia','Goalkeeper'),
('Antoine Griezmann','Antoine Griezmann','France','Forward'),
('Diego Godín','Diego Godín','Uruguay','Defender'),

-- Borussia Dortmund
('Marco Reus','Marco Reus','Germany','Midfielder'),
('Jadon Sancho','Jadon Sancho','England','Winger'),
('Axel Witsel','Axel Witsel','Belgium','Midfielder'),

-- Club Brugge
('Hans Vanaken','Hans Vanaken','Belgium','Midfielder'),
('Wesley Moraes','Wesley Moraes','Brazil','Forward'),
('Ruud Vormer','Ruud Vormer','Netherlands','Midfielder'),

-- Monaco
('Radamel Falcao','Radamel Falcao','Colombia','Forward'),
('Youri Tielemans','Youri Tielemans','Belgium','Midfielder'),
('Danijel Subašić','Danijel Subašić','Croatia','Goalkeeper'),

-- Barcelona
('Lionel Messi','Lionel Messi','Argentina','Forward'),
('Luis Suárez','Luis Suárez','Uruguay','Forward'),
('Gerard Piqué','Gerard Piqué','Spain','Defender'),

-- Tottenham
('Harry Kane','Harry Kane','England','Forward'),
('Heung-min Son','Son Heung-min','South Korea','Forward'),
('Hugo Lloris','Hugo Lloris','France','Goalkeeper'),

-- PSV
('Hirving Lozano','Hirving Lozano','Mexico','Winger'),
('Luuk de Jong','Luuk de Jong','Netherlands','Forward'),
('Jeroen Zoet','Jeroen Zoet','Netherlands','Goalkeeper'),

-- Inter
('Mauro Icardi','Mauro Icardi','Argentina','Forward'),
('Ivan Perišić','Ivan Perišić','Croatia','Winger'),
('Samir Handanović','Samir Handanović','Slovenia','Goalkeeper'),

-- PSG
('Kylian Mbappé','Kylian Mbappé','France','Forward'),
('Neymar','Neymar Jr','Brazil','Forward'),
('Edinson Cavani','Edinson Cavani','Uruguay','Forward'),

-- Napoli
('Lorenzo Insigne','Lorenzo Insigne','Italy','Forward'),
('Dries Mertens','Dries Mertens','Belgium','Forward'),
('Kalidou Koulibaly','Kalidou Koulibaly','Senegal','Defender'),

-- Liverpool
('Mohamed Salah','Mohamed Salah','Egypt','Forward'),
('Virgil van Dijk','Virgil van Dijk','Netherlands','Defender'),
('Alisson Becker','Alisson Becker','Brazil','Goalkeeper'),

-- Red Star
('Marko Marin','Marko Marin','Germany','Midfielder'),
('El Fardou Ben','El Fardou Ben','Comoros','Forward'),
('Milan Borjan','Milan Borjan','Canada','Goalkeeper'),

-- Porto
('Iker Casillas','Iker Casillas','Spain','Goalkeeper'),
('Éder Militão','Éder Militão','Brazil','Defender'),
('Jesús Corona','Jesús Corona','Mexico','Winger'),

-- Schalke
('Weston McKennie','Weston McKennie','USA','Midfielder'),
('Naldo','Ronaldo Aparecido Rodrigues','Brazil','Defender'),
('Alexander Nübel','Alexander Nübel','Germany','Goalkeeper'),

-- Galatasaray
('Fernando Muslera','Fernando Muslera','Uruguay','Goalkeeper'),
('Younès Belhanda','Younès Belhanda','Morocco','Midfielder'),
('Sofiane Feghouli','Sofiane Feghouli','Algeria','Winger'),

-- Lokomotiv Moscow
('Manuel Fernandes','Manuel Fernandes','Portugal','Midfielder'),
('Fyodor Smolov','Fyodor Smolov','Russia','Forward'),
('Guilherme Marinato','Guilherme Marinato','Brazil','Goalkeeper'),

-- Bayern
('Robert Lewandowski','Robert Lewandowski','Poland','Forward'),
('Thomas Müller','Thomas Müller','Germany','Forward'),
('Manuel Neuer','Manuel Neuer','Germany','Goalkeeper'),

-- Ajax
('Frenkie de Jong','Frenkie de Jong','Netherlands','Midfielder'),
('Matthijs de Ligt','Matthijs de Ligt','Netherlands','Defender'),
('Dušan Tadić','Dušan Tadić','Serbia','Forward'),

-- Benfica
('João Félix','João Félix','Portugal','Forward'),
('Rúben Dias','Rúben Dias','Portugal','Defender'),
('Odysseas Vlachodimos','Odysseas Vlachodimos','Greece','Goalkeeper'),

-- AEK Athens
('Petros Mantalos','Petros Mantalos','Greece','Midfielder'),
('Ezequiel Ponce','Ezequiel Ponce','Argentina','Forward'),
('Vasilis Barkas','Vasilis Barkas','Greece','Goalkeeper'),

-- Man City
('Kevin De Bruyne','Kevin De Bruyne','Belgium','Midfielder'),
('Sergio Agüero','Sergio Agüero','Argentina','Forward'),
('Ederson','Ederson Moraes','Brazil','Goalkeeper'),

-- Lyon
('Memphis Depay','Memphis Depay','Netherlands','Forward'),
('Nabil Fekir','Nabil Fekir','France','Midfielder'),
('Anthony Lopes','Anthony Lopes','Portugal','Goalkeeper'),

-- Shakhtar
('Taison','Taison Barcellos','Brazil','Winger'),
('Marlos','Marlos Romero','Ukraine','Midfielder'),
('Andriy Pyatov','Andriy Pyatov','Ukraine','Goalkeeper'),

-- Hoffenheim
('Andrej Kramarić','Andrej Kramarić','Croatia','Forward'),
('Kerem Demirbay','Kerem Demirbay','Germany','Midfielder'),
('Oliver Baumann','Oliver Baumann','Germany','Goalkeeper'),

-- Real Madrid
('Cristiano Ronaldo','Cristiano Ronaldo','Portugal','Forward'),
('Luka Modrić','Luka Modrić','Croatia','Midfielder'),
('Sergio Ramos','Sergio Ramos','Spain','Defender'),

-- Roma
('Edin Džeko','Edin Džeko','Bosnia','Forward'),
('Daniele De Rossi','Daniele De Rossi','Italy','Midfielder'),
('Alisson','Alisson Becker','Brazil','Goalkeeper'),

-- CSKA
('Alan Dzagoev','Alan Dzagoev','Russia','Midfielder'),
('Fedor Chalov','Fedor Chalov','Russia','Forward'),
('Igor Akinfeev','Igor Akinfeev','Russia','Goalkeeper'),

-- Plzen
('Patrik Hrošovský','Patrik Hrošovský','Slovakia','Midfielder'),
('Michael Krmenčík','Michael Krmenčík','Czech Republic','Forward'),
('Aleš Hruška','Aleš Hruška','Czech Republic','Goalkeeper'),

-- Juventus
('Cristiano Ronaldo Juve','Cristiano Ronaldo','Portugal','Forward'),
('Paulo Dybala','Paulo Dybala','Argentina','Forward'),
('Gianluigi Buffon','Gianluigi Buffon','Italy','Goalkeeper'),

-- Man United
('Paul Pogba','Paul Pogba','France','Midfielder'),
('Marcus Rashford','Marcus Rashford','England','Forward'),
('David De Gea','David De Gea','Spain','Goalkeeper'),

-- Valencia
('Rodrigo Moreno','Rodrigo Moreno','Spain','Forward'),
('Dani Parejo','Dani Parejo','Spain','Midfielder'),
('Neto','Norberto Neto','Brazil','Goalkeeper'),

-- Young Boys
('Guillaume Hoarau','Guillaume Hoarau','France','Forward'),
('Christian Fassnacht','Christian Fassnacht','Switzerland','Midfielder'),
('David von Ballmoos','David von Ballmoos','Switzerland','Goalkeeper');
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
