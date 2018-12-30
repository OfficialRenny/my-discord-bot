const Discord = require('discord.js');
const client = new Discord.Client();
const SQLite = require("better-sqlite3");
const fs = require('fs');
const log4js = require('log4js');
const seedrandom = require('seedrandom');
const config = require('./data/config.json');
const sql = new SQLite('./data/db.sqlite');
const ytSearch = require('youtube-search');
const Kahoot = require('kahoot.js-republished');
const cheerio = require('cheerio');
const tabletojson = require('tabletojson');
const _ = require('underscore');
var storage = JSON.parse(fs.readFileSync('./data/storage.json', 'utf8'));
const usedActionRecently = new Set();
const usedKahootNuke = new Set();
const adminID = ['197376829408018432'];
var adminMode = false;
var userThatIsOnlyReferencedOnce;

const defaultdanceascii = [
	"\n⠀⠀⠀⠀⣀⣤\n⠀⠀⠀⠀⣿⠿⣶\n⠀⠀⠀⠀⣿⣿⣀\n⠀⠀⠀⣶⣶⣿⠿⠛⣶\n⠤⣀⠛⣿⣿⣿⣿⣿⣿⣭⣿⣤\n⠒⠀⠀⠀⠉⣿⣿⣿⣿⠀⠀⠉⣀\n⠀⠤⣤⣤⣀⣿⣿⣿⣿⣀⠀⠀⣿\n⠀⠀⠛⣿⣿⣿⣿⣿⣿⣿⣭⣶⠉\n⠀⠀⠀⠤⣿⣿⣿⣿⣿⣿⣿\n⠀⠀⠀⣭⣿⣿⣿⠀⣿⣿⣿\n⠀⠀⠀⣉⣿⣿⠿⠀⠿⣿⣿\n⠀⠀⠀⠀⣿⣿⠀⠀⠀⣿⣿⣤\n⠀⠀⠀⣀⣿⠀⠀⠀⣿⣿⣿\n⠀⠀⠀⣿⣿⣿⠀⠀⠀⣿⣿⣿\n⠀⠀⠀⣿⣿⠛⠀⠀⠀⠉⣿⣿\n⠀⠀⠀⠉⣿⠀⠀⠀⠀⠀⠛⣿\n⠀⠀⠀⠀⣿⠀⠀⠀⠀⠀⠀⣿⣿\n⠀⠀⠀⠀⣛⠀⠀⠀⠀⠀⠀⠛⠿⠿⠿\n⠀⠀⠀⠛⠛",
	"\n⠀⠀⠀⣀⣶⣀\n⠀⠀⠀⠒⣛⣭\n⠀⠀⠀⣀⠿⣿⣶\n⠀⣤⣿⠤⣭⣿⣿\n⣤⣿⣿⣿⠛⣿⣿⠀⣀\n⠀⣀⠤⣿⣿⣶⣤⣒⣛\n⠉⠀⣀⣿⣿⣿⣿⣭⠉\n⠀⠀⣭⣿⣿⠿⠿⣿\n⠀⣶⣿⣿⠛⠀⣿⣿\n⣤⣿⣿⠉⠤⣿⣿⠿\n⣿⣿⠛⠀⠿⣿⣿\n⣿⣿⣤⠀⣿⣿⠿\n⠀⣿⣿⣶⠀⣿⣿⣶\n⠀⠀⠛⣿⠀⠿⣿⣿\n⠀⠀⠀⣉⣿⠀⣿⣿\n⠀⠶⣶⠿⠛⠀⠉\n⠀⠀⠀⠀⠀⠀⣀⣿\n⠀⠀⠀⠀⠀⣶⣿⠿",
	"\n⠀⠀⠀⠀⠀⠀⠀⠀⣤⣿⣿⠶⠀⠀⣀⣀\n⠀⠀⠀⠀⠀⠀⣀⣀⣤⣤⣶⣿⣿⣿⣿⣿⣿\n⠀⠀⣀⣶⣤⣤⠿⠶⠿⠿⠿⣿⣿⣿⣉⣿⣿\n⠿⣉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠛⣤⣿⣿⣿⣀\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⣿⣿⣿⣿⣶⣤\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⣿⣿⣿⣿⠿⣛⣿\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⠛⣿⣿⣿⣿\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣶⣿⠿⠀⣿⣿⣿⠛\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⠀⠀⣿⣿⣿\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠿⠿⣿⠀⠀⣿⣶\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠛⠀⠀⣿⣿⣶\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⣿⣿⠤\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠿⣿\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣀\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣶⣿",
	"\n⠀⠀⣀\n⠀⠿⣿⣿⣀\n⠀⠉⣿⣿⣀\n⠀⠀⠛⣿⣭⣀⣀⣤\n⠀⠀⣿⣿⣿⣿⣿⠛⠿⣶⣀\n⠀⣿⣿⣿⣿⣿⣿⠀⠀⠀⣉⣶\n⠀⠀⠉⣿⣿⣿⣿⣀⠀⠀⣿⠉\n⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿\n⠀⣀⣿⣿⣿⣿⣿⣿⣿⣿⠿\n⠀⣿⣿⣿⠿⠉⣿⣿⣿⣿\n⠀⣿⣿⠿⠀⠀⣿⣿⣿⣿\n⣶⣿⣿⠀⠀⠀⠀⣿⣿⣿\n⠛⣿⣿⣀⠀⠀⠀⣿⣿⣿⣿⣶⣀\n⠀⣿⣿⠉⠀⠀⠉⠉⠉⠛⠛⠿⣿⣶\n⠀⠀⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣿\n⠀⠀⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉\n⣀⣶⣿⠛",
	"\n⠀⠀⠀⠀⠀⠀⠀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⠀⠀⠀⠀⠀⣿⣿⣿⣤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⣤⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⠀⠀⠀⠀⠀⠉⣿⣿⣿⣶⣿⣿⣿⣶⣶⣤⣶⣶⠶⠛⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⠀⠀⠀⠀⠀⣤⣿⠿⣿⣿⣿⣿⣿⠀⠀⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠛⣿⣤⣤⣤⠿⠉⠀⠉⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⠉⠉⠉⠉⠉⠀⠀⠀⠀⠉⣿⣿⣿⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣶⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⠛⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣛⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⠀⠀⠀⠀⠀⠀⣶⣿⣿⠛⠿⣿⣿⣿⣶⣤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⠀⠀⠀⠀⠀⠀⣿⠛⠉⠀⠀⠀⠛⠿⣿⣿⣶⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⠀⠀⠀⠀⣿⣀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⠿⣶⣤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⠀⠀⠀⠀⠛⠿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣿⣿⠿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠛⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
	"\n⠀⠀⠀⠀⠀⠀⣤⣶⣶\n⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣀⣀\n⠀⠀⠀⠀⠀⣀⣶⣿⣿⣿⣿⣿⣿\n⣤⣶⣀⠿⠶⣿⣿⣿⠿⣿⣿⣿⣿\n⠉⠿⣿⣿⠿⠛⠉⠀⣿⣿⣿⣿⣿\n⠀⠀⠉⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣤⣤\n⠀⠀⠀⠀⠀⠀⠀⣤⣶⣿⣿⣿⣿⣿⣿\n⠀⠀⠀⠀⠀⣀⣿⣿⣿⣿⣿⠿⣿⣿⣿⣿\n⠀⠀⠀⠀⣀⣿⣿⣿⠿⠉⠀⠀⣿⣿⣿⣿\n⠀⠀⠀⠀⣿⣿⠿⠉⠀⠀⠀⠀⠿⣿⠛\n⠀⠀⠀⠀⠛⣿⣿⣀⠀⠀⠀⠀⠀⣿⣿⣀\n⠀⠀⠀⠀⠀⣿⣿⣿⠀⠀⠀⠀⠀⠿⣿⣿\n⠀⠀⠀⠀⠀⠉⣿⣿⠀⠀⠀⠀⠀⠀⠉⣿\n⠀⠀⠀⠀⠀⠀⠀⣿⠀⠀⠀⠀⠀⠀⣀⣿\n⠀⠀⠀⠀⠀⠀⣀⣿⣿\n⠀⠀⠀⠀⠤⣿⠿⠿⠿",
	"\n⠀⠀⠀⠀⣀\n⠀⠀⣶⣿⠿⠀⠀⠀⣀⠀⣤⣤\n⠀⣶⣿⠀⠀⠀⠀⣿⣿⣿⠛⠛⠿⣤⣀\n⣶⣿⣤⣤⣤⣤⣤⣿⣿⣿⣀⣤⣶⣭⣿⣶⣀\n⠉⠉⠉⠛⠛⠿⣿⣿⣿⣿⣿⣿⣿⠛⠛⠿⠿\n⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⠿\n⠀⠀⠀⠀⠀⠀⠀⠿⣿⣿⣿⣿\n⠀⠀⠀⠀⠀⠀⠀⠀⣭⣿⣿⣿⣿⣿\n⠀⠀⠀⠀⠀⠀⠀⣤⣿⣿⣿⣿⣿⣿\n⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⠿\⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⠿\n⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿\n⠀⠀⠀⠀⠀⠀⠀⠉⣿⣿⣿⣿\n⠀⠀⠀⠀⠀⠀⠀⠀⠉⣿⣿⣿⣿\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⣿⠛⠿⣿⣤\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣿⠀⠀⠀⣿⣿⣤\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠀⠀⠀⣶⣿⠛⠉\n⠀⠀⠀⠀⠀⠀⠀⠀⣤⣿⣿⠀⠀⠉\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉",
	"\n⠀⠀⠀⠀⠀⠀⣶⣿⣶\n⠀⠀⠀⣤⣤⣤⣿⣿⣿\n⠀⠀⣶⣿⣿⣿⣿⣿⣿⣿⣶\n⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿\n⠀⠀⣿⣉⣿⣿⣿⣿⣉⠉⣿⣶\n⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⠿⣿\n⠀⣤⣿⣿⣿⣿⣿⣿⣿⠿⠀⣿⣶\n⣤⣿⠿⣿⣿⣿⣿⣿⠿⠀⠀⣿⣿⣤\n⠉⠉⠀⣿⣿⣿⣿⣿⠀⠀⠒⠛⠿⠿⠿\n⠀⠀⠀⠉⣿⣿⣿⠀⠀⠀⠀⠀⠀⠉\n⠀⠀⠀⣿⣿⣿⣿⣿⣶\n⠀⠀⠀⣿⠉⠿⣿⣿\n⠀⠀⠀⠀⣿⣤⠀⠛⣿⣿\n⠀⠀⠀⠀⣶⣿⠀⠀⠀⣿⣶\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⣭⣿⣿\n⠀⠀⠀⠀⠀⠀⠀⠀⣤⣿⣿⠉",
	"\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⣶\n⠀⠀⠀⠀⠀⣀⣀⠀⣶⣿⣿⠶\n⣶⣿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣤⣤\n⠀⠉⠶⣶⣀⣿⣿⣿⣿⣿⣿⣿⠿⣿⣤⣀\n⠀⠀⠀⣿⣿⠿⠉⣿⣿⣿⣿⣭⠀⠶⠿⠿\n⠀⠀⠛⠛⠿⠀⠀⣿⣿⣿⣉⠿⣿⠶\n⠀⠀⠀⠀⠀⣤⣶⣿⣿⣿⣿⣿\n⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⠒\n⠀⠀⠀⠀⣀⣿⣿⣿⣿⣿⣿⣿\n⠀⠀⠀⠀⠀⣿⣿⣿⠛⣭⣭⠉\n⠀⠀⠀⠀⣿⣿⣭⣤⣿⠛\n⠀⠀⠀⠀⠀⠛⠿⣿⣿⣿⣭\n⠀⠀⠀⠀⠀⠀⠀⣿⣿⠉⠛⠿⣶⣤\n⠀⠀⠀⠀⠀⠀⣀⣿⠀⠀⣶⣶⠿⠿⠿\n⠀⠀⠀⠀⠀⠀⣿⠛\n⠀⠀⠀⠀⠀⠀⣭⣶",
	"\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⣤\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿\n⠀⠀⣶⠀⠀⣀⣤⣶⣤⣉⣿⣿⣤⣀\n⠤⣤⣿⣤⣿⠿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣀\n⠀⠛⠿⠀⠀⠀⠀⠉⣿⣿⣿⣿⣿⠉⠛⠿⣿⣤\n⠀⠀⠀⠀⠀⠀⠀⠀⠿⣿⣿⣿⠛⠀⠀⠀⣶⠿\n⠀⠀⠀⠀⠀⠀⠀⠀⣀⣿⣿⣿⣿⣤⠀⣿⠿\n⠀⠀⠀⠀⠀⠀⠀⣶⣿⣿⣿⣿⣿⣿⣿⣿\n⠀⠀⠀⠀⠀⠀⠀⠿⣿⣿⣿⣿⣿⠿⠉⠉\n⠀⠀⠀⠀⠀⠀⠀⠉⣿⣿⣿⣿⠿\n⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⠉\n⠀⠀⠀⠀⠀⠀⠀⠀⣛⣿⣭⣶⣀\n⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⣿⣿⣿\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⠉⠛⣿\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⠀⠀⣿⣿\n⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣉⠀⣶⠿\n⠀⠀⠀⠀⠀⠀⠀⠀⣶⣿⠿\n⠀⠀⠀⠀⠀⠀⠀⠛⠿⠛",
	"\n⠀⠀⠀⣶⣿⣶\n⠀⠀⠀⣿⣿⣿⣀\n⠀⣀⣿⣿⣿⣿⣿⣿\n⣶⣿⠛⣭⣿⣿⣿⣿\n⠛⠛⠛⣿⣿⣿⣿⠿\n⠀⠀⠀⠀⣿⣿⣿\n⠀⠀⣀⣭⣿⣿⣿⣿⣀\n⠀⠤⣿⣿⣿⣿⣿⣿⠉\n⠀⣿⣿⣿⣿⣿⣿⠉\n⣿⣿⣿⣿⣿⣿\n⣿⣿⣶⣿⣿\n⠉⠛⣿⣿⣶⣤\n⠀⠀⠉⠿⣿⣿⣤\n⠀⠀⣀⣤⣿⣿⣿\n⠀⠒⠿⠛⠉⠿⣿\n⠀⠀⠀⠀⠀⣀⣿⣿\n⠀⠀⠀⠀⣶⠿⠿⠛"
];

log4js.configure({
	appenders: {
		consoleLogs: {
			type: 'file',
			filename: './data/logs/console.log',
			maxLogSize: 256000
		},
		console: {
			type: 'console'
		}
	},
	categories: {
	default: {
			appenders: ['console', 'consoleLogs'],
			level: 'trace'
		}
	}
});

var opts = {
	maxResults: 10,
	key: config.GoogleApiKey
};

var logger = log4js.getLogger('default');

var listOfStoreItems = [
	["discord_silver", "silver", "Discord Silver", 500, "https://i.imgur.com/Vt7NLdA.png"],
	["discord_gold", "gold", "Discord Gold", 1000, "https://i.imgur.com/ODufnWD.png"],
	["rick_roll", "rick", "Rick Roll", 250, "https://media.giphy.com/media/Vuw9m5wXviFIQ/giphy.gif"],
	["manning_face", "manning", "ManningFace", 100, "https://i.imgur.com/ENPyFSU.jpg"]
];

var eightBallAnswers = [
	"It is decidedly so.",
	"Reply hazy, try again.",
	"Ask again later.",
	"Better not tell you now.",
	"Don't count on it.",
	"Yes.",
	"My sources say no.",
	"Concentrate and ask again.",
	"Most likely.",
	"As I see it, yes.",
	"You may rely on it.",
	"Without a doubt.",
	"Yes - definitely.",
	"Signs point to yes.",
	"My reply is no.",
	"Cannot predict now.",
	"It is certain.",
	"Very doubtful.",
	"Outlook good.",
	"Outlook not so good."];

var listOfActions =
	["mine", "chop", "fish", "hunt", "dig"];
	
client.on('ready', async() => {
	var table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'mainDb';").get();
	if (!table['count(*)']) {
		sql.prepare("CREATE TABLE mainDb (id TEXT PRIMARY KEY, user TEXT, last_known_displayName TEXT, points INTEGER, level INTEGER, currency INTEGER, total_messages_sent INTEGER, discord_silver INTEGER);").run();
		sql.prepare("CREATE UNIQUE INDEX idx_mainDb_id ON mainDb (id);").run();
		sql.pragma("synchronous = 1");
	}
	
	var table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'prefixDb';").get();
	if (!table['count(*)']) {
		sql.prepare("CREATE TABLE prefixDb (id TEXT PRIMARY KEY, prefix TEXT);").run();
		sql.prepare("CREATE UNIQUE INDEX idx_prefixDb_id ON prefixDb (id);").run();
		sql.pragma("synchronous = 1");
	}

	var arrayOfDBColumns = sql.prepare("PRAGMA table_info(mainDb);").all();
	var allColumns = [];
	var allColumnsValues = [];

	for (i = 0; i < arrayOfDBColumns.length; i++) {
		allColumns.push(arrayOfDBColumns[i].name);
	}

	for (i = 0; i < listOfStoreItems.length; i++) {
		if (!allColumns.includes(listOfStoreItems[i][0])) {
			logger.info(`${listOfStoreItems[i][0]} does not yet exist in the database. Creating...`);
			sql.prepare(`ALTER TABLE mainDb ADD COLUMN ${listOfStoreItems[i][0]} INTEGER DEFAULT 0;`).run();
		}
	}

	for (i = 0; i < allColumns.length; i++) {
		allColumnsValues.push(`@${allColumns[i]}`);
	}

	client.getScore = sql.prepare("SELECT * FROM mainDb WHERE user = ?");
	client.setScore = sql.prepare(`INSERT OR REPLACE INTO mainDb (${allColumns.toString()}) VALUES (${allColumnsValues.toString()});`);

	client.getPrefix = sql.prepare("SELECT * FROM prefixDb WHERE id = ?");
	client.setPrefix = sql.prepare("INSERT OR REPLACE INTO prefixDb (id, prefix) VALUES (@id, @prefix);");
	userThatIsOnlyReferencedOnce = await client.fetchUser(adminID[0]);
	logger.info('Ready and logged in as ' + client.user.username + '!');
	client.user.setPresence({
		game: {
			name: 'commands. Prefix: ~',
			type: 2
		}
	})

});

client.on('message', async(message) => {
	if (message.author.bot)
		return;
	var chatChannel;
	var chatName;
	if (!message.guild) {
		logger.trace(`DM from ${message.author.username} - "${message.content}"`);
		chatChannel = message.author;
		chatName = message.author.username;
		if (message.author.id != userThatIsOnlyReferencedOnce.id) userThatIsOnlyReferencedOnce.send(`DM from ${chatName} - "${message.content}"`);
	} else {
		logger.trace(`${message.author.username} in "${message.guild.name} - #${message.channel.name}" said - "${message.content}"`);
		chatChannel = message.guild;
		chatName = message.guild.name;
	}
	var alreadyLevelledUp = false;
	var prefixGet = client.getPrefix.get(chatChannel.id);
	if (!prefixGet) {
		logger.info(`${chatName} does not yet have a prefix, defaulting to ~.`);
		message.channel.send(`${chatName} does not yet have a prefix, defaulting to ~.`);
		prefixGet = {
			id: `${chatChannel.id}`,
			prefix: "~"
		}
		client.setPrefix.run(prefixGet);
		logger.info("Done.");
	}
	var lonePrefix = prefixGet.prefix;
	
	var wordsInMessage = message.content.split(" ");
	if (message.guild) {
	var lul = message.guild.emojis.find(emoji => emoji.name.toLowerCase() == "lul");
	var pogchamp = message.guild.emojis.find(emoji => emoji.name.toLowerCase() == "pogchamp");
	var listOfCounters = [
		["lul", lul, storage.counters.luls],
		["pogchamp", pogchamp, storage.counters.pogs]
	];
	
	for (var word in wordsInMessage) {
		for (var i = 0; i < listOfCounters.length; i++) {
			if (wordsInMessage[word] == listOfCounters[i][0]) {
				listOfCounters[i][2]++;
			}
		}
	}
	}
	var cachedStorage = JSON.parse(JSON.stringify(storage));
	var dbGet = client.getScore.get(message.author.id);
	var currentTime = Date.now();
	if (!dbGet) {
		dbGet = generateDbEntry(message.author);
	}

	const args = message.content.split(/\s+/g);
	var command;
	if (message.content.indexOf("<@423980168671920138>") == 0) {
		removeMention = args.shift();
		command = args.shift().toLowerCase();
	} else {
		command = args.shift().slice(prefixGet.prefix.length).toLowerCase();
	}
	const quotedStrings = message.content.split(/(["'])(\\?.)*?\1/);
	
	
	if (message.content.indexOf(prefixGet.prefix) !== 0) {
		let randNum = Math.floor((Math.random() * 10) + 1);
		dbGet.points++;
		dbGet.currency += randNum;
		dbGet.total_messages_sent++;
		dbGet.last_known_displayName = message.author.username;
		client.setScore.run(dbGet);
	} else {	
		if (command == "uptime") {
			return message.channel.send(`Current Uptime: ${timeConversion(client.uptime)}`);
		}
		
		if (command == "ping") {
			savedTime = currentTime;
			message.channel.send("Pong!").then((msg) => {
			var pingTime = Date.now();
			msg.edit(`Pong! Latency: ${pingTime - savedTime}ms.`);
			});
		}
		
		if (command == "help") {
			return message.channel.send(`\`\`\`this \n is \n a \n WIP \n\`\`\``);
		}
		
		if (command == "action" || command == "." || command == "act") {
			if (args[0] == "help") return message.channel.send("Available actions are: " + stringifyArray(listOfActions) + ". `SYNTAX: " + prefixGet.prefix + "action [action]`");
			var usedActions = [];
			var reusedActions = [];
			for (var word in args) {
				if (listOfActions.includes(args[word])) {
					if (usedActions.includes(args[word]) && !reusedActions.includes(args[word])) {
						reusedActions.push(args[word]);
						continue;
					}
					usedActions.push(args[word]);
					var authorIDandAction = `${message.author.id}-${args[word]}`;
					var rnd = seedrandom((message.author.id * chatChannel.id * new Date().getTime()).toString());
					var randNum = Math.floor(rnd() * 101);
					if (!usedActionRecently.has(authorIDandAction)) {
						dbGet.points += 2;
						dbGet.currency += randNum;
						message.channel.send(`You used '${args[word]}' and gained ${randNum}:money_with_wings:!`);
						usedActionRecently.add(authorIDandAction);
						setTimeout(() => {
							if (usedActionRecently.has(authorIDandAction)) {
							usedActionRecently.delete(authorIDandAction);
							}
						}, 60000 * 2);
						logger.info(`${message.author.username} used ${args[word]} and got a score of ${randNum}`);
					} else if (usedActionRecently.has(authorIDandAction)) {
						reusedActions.push(args[word]);
					}
				}
			}
			
			if (reusedActions.length > 0) {
				return message.channel.send(`You need to wait 2 minutes before using actions ${stringifyArray(reusedActions)} again.`);
			}
		}
		if (command == 'stats') {
			var usableId;
			if (!message.mentions.users.first()) {
				usableId = message.author;
			} else {
				usableId = message.mentions.users.first();
			}
			dbGet = client.getScore.get(usableId.id);
			if (!dbGet) {
				dbGet = generateDbEntry(usableId);
			}

			dbGet.level = Math.floor(calculateLevel(dbGet.points));
			alreadyLevelledUp = true;
			const pointsForCurrentLevel = calculatePoints(dbGet.level);
			const pointsForNextLevel = calculatePoints(parseInt(dbGet.level) + 1);
			const embed = new Discord.RichEmbed()
				.setTimestamp()
				.setAuthor(usableId.username)
				.setThumbnail(usableId.displayAvatarURL)
				.setDescription(`Here are your stats, ${usableId.username}`)
				.setTitle(`Stats for ${usableId.username}`)
				.addField("Level", Math.floor(dbGet.level), true)
				.addField("XP", dbGet.points, true)
				.addField("Points To Next Level", `${Math.ceil(pointsForNextLevel - pointsForCurrentLevel)}`, true)
				.addField("Currency", dbGet.currency)
				.addField("Inventory", `To see your inventory, please use ${prefixGet.prefix}inv`);
			message.channel.send({
				embed
			});

		}

		if (command == 'count') {
			var wordsInMessage = message.content.split(" ");
			var listOfCountersAsString = "";
			for (var i = 0; i < listOfCounters.length; i++) {
				var counter = listOfCounters[i][0];
				if (i != listOfCounters.length - 1) {
					listOfCountersAsString += counter.toString() + ", ";
				} else {
					listOfCountersAsString += counter.toString();
				}
			}
			if (args[0].toLowerCase() == null || "help") {
				return message.channel.send(`The current available counters are: ${listOfCountersAsString}`);
			} else {
				for (var i = 0; i < listOfCounters.length; i++) {
					var counterString = listOfCounters[i][0];
					var counterEmoji = listOfCounters[i][1];
					var counterStorage = listOfCounters[i][2];
					if (wordsInMessage[1] == counterString || wordsInMessage[1] == counterEmoji) {
						if (counterEmoji == null) {
							message.channel.send("This guild does not have an emoji with the name of \"" + counterString + "\", therefore you cannot view the counts of it here.");
						} else {
							message.channel.send("There have been a total number of " + counterStorage + " " + counterEmoji + "'s sent since the creation of this feature was implemented.");
							break;
						}
					}
				}
			}
		}

		if (command == 'setprefix') {
			prefixGet.prefix = args[0];
			client.setPrefix.run(prefixGet);
			message.channel.send(`Successfully changed the prefix to \`${prefixGet.prefix}\``);
		}

		if (command == 'getprefix') {
			message.channel.send(`The prefix for this server is \`${prefixGet.prefix}\``);
		}

		if (command == 'defaultdance') {
			message.channel.send('*pulls both arms outwards in front of his chest and pumps them behind his back, then repeats this motion in a smaller range of motion down to his hips two times once more all while sliding his legs in a faux walking motion, claps his hands together in front of him while both his knees knock together, pumps his arms downward, pronating his wrists and abducting his fingers outward while crossing his legs back and forth, then repeats this motion again two times while keeping his shoulders low and hunching over, then does a finger gun with right hand with left hand bent on his hip while looking directly forward and putting his left leg forward then crossing his arms and leaning back a little while bending his knees at an angle.*');
		}
		
		if (command == 'defaultdance2') {
			message.channel.send("Preparing the default dance...").then((msg) => defaultdance(msg));
		}

		if (command == 'buy') {
			var k;

			if (args[0] == 'store') {
				const embed = new Discord.RichEmbed()
					.setTitle("Store")
					.setThumbnail(message.author.displayAvatarURL)
					.setDescription("Welcome to the store, spend your :money_with_wings: here!")
					.setFooter(`Your balance is ${dbGet.currency}`)
					.setColor(0x406DA2);
				for (k = 0; k < listOfStoreItems.length; k++) {
					embed.addField(`${listOfStoreItems[k][2]} - ${prefixGet.prefix}buy ${listOfStoreItems[k][1]}`, `${listOfStoreItems[k][3]}:money_with_wings:`);
				}
				return message.channel.send({
					embed
				});
			} else {
				for (var item in listOfStoreItems) {
					if (args[0] == listOfStoreItems[item][1]) {
						if (listOfStoreItems[item][3] <= dbGet.currency) {
							dbGet.points += listOfStoreItems[item][3] / 100;
							dbGet.currency -= listOfStoreItems[item][3];
							dbGet[listOfStoreItems[item][0]]++;
							client.setScore.run(dbGet);
							return message.reply(`thank you for buying a ${listOfStoreItems[item][2]}, your balance is now ${dbGet.currency}:money_with_wings:`);
							break;
						} else {
							return message.reply(`you do not have enough :money_with_wings: to purchase a ${listOfStoreItems[item][2]}.`);
						}
						break;
					}
				}
				return message.reply(`${args[0]} is not a valid item, please check \`${prefixGet.prefix}buy store\` for a list of all items.`);
			}
		}

		if (command == 'give' && message.guild) {
			if (args[0] == 'help') {
				return message.channel.send(`\`SYNTAX: ${prefixGet.prefix}give [item] [user(s)] [amount]\``);
			}
			var channelMembers = message.channel.members.array();
			var channelMembersNoBots = [];
			var channelMembersNoBotsToString = "";
			var mentionedUsers = [];
			var mentionedUsersToString = "";
			var invalidMembers = [];
			var itemsToGive = 0;
			var usersToGiveTo = [];
			var isAnItem = false;

			if (!(message.mentions.users.array() || message.mentions.everyone || message.content.indexOf("@someone") != -1 || quotedStrings)) {
				return message.reply("you need to mention a user, use their ID in quotes, or use `@someone`!");
			}
			for (var member in message.mentions.users.array()) {
				if (message.mentions.users.array()[member].id == client.user.id) {
					message.channel.send("Oh.... no thanks, you can keep it! Continuing with the gifting....");
					break;
				}
			}

			for (i = 0; i < listOfStoreItems.length; i++) {
				if (args[0] == listOfStoreItems[i][1]) {
					isAnItem = true;
					break;
				} else {
					isAnItem = false;
				}
			}

			if (!isAnItem)
				return message.reply("this item does not exist or is not able to be given as a gift.");

			for (var member in channelMembers) {
				if (channelMembers[member].user.bot)
					continue;
				if (channelMembers[member].user.id == message.author.id)
					continue;
				channelMembersNoBots.push(channelMembers[member]);
			}
			for (var member in channelMembersNoBots) {
				if (member != channelMembersNoBots.length - 1) {
					channelMembersNoBotsToString += channelMembers[member].username + ", ";
				} else {
					channelMembersNoBotsToString += "and " + channelMembers[member].username;
				}
			}

			for (var member in message.mentions.users.array()) {
				if (message.mentions.users.array()[member].bot)
					continue;
				mentionedUsers.push(message.mentions.users.array()[member]);
			}

			for (var member in mentionedUsers) {
				if (member != mentionedUsers.length - 1) {
					mentionedUsersToString += mentionedUsers[member].username + ", ";
				} else {
					mentionedUsersToString += "and " + mentionedUsers[member].username;
				}
			}

			var randomMember = channelMembersNoBots[Math.floor(Math.random() * channelMembersNoBots.length)].user;

			if (message.mentions.everyone) {
				for (var member in channelMembersNoBots) {
					usersToGiveTo.push(channelMembersNoBots[member].user);
				}
				itemsToGive = usersToGiveTo.length;
			} else if (args[1] == "@someone") {
				usersToGiveTo.push(randomMember);
				itemsToGive = 1;
			} else if (mentionedUsers.length > -1) {
				for (var member in mentionedUsers) {
					if (mentionedUsers[member].bot)
						continue;
					usersToGiveTo.push(mentionedUsers[member]);
				}
				itemsToGive = usersToGiveTo.length;
			} else if (quotedStrings.length > 0) {
				logger.info(quotedStrings);
				for (var member in quotedStrings) {
					const splicedID = TryParseInt(quotedStrings[member].splice(1, -1), 0);
					if (splicedID == 0) invalidMembers.push(quotedStrings[member]);
					var user = await client.fetchUser(splicedID);
					logger.info(user);
				}
			}
			if (invalidMembers.length > 0) {
				return message.channel.send(`${stringifyArray} is/are not valid ID(s).`);
			}
			
			var usersToGiveToString = "";
			for (var member in usersToGiveTo) {
				if (usersToGiveTo.length == 1) {
					usersToGiveToString += usersToGiveTo[member].username;
					break;
				}
				if (member != usersToGiveTo.length - 1) {
					usersToGiveToString += usersToGiveTo[member].username + ", ";
				} else {
					usersToGiveToString += "and " + usersToGiveTo[member].username;
				}
			}

			if (usersToGiveTo.length == 0)
				return message.channel.send("No users specified!");

			var itemsToReceive = Math.floor(itemsToGive / (usersToGiveTo.length)) * TryParseInt(wordsInMessage[wordsInMessage.length - 1], 1);
			itemsToGive *= TryParseInt(wordsInMessage[wordsInMessage.length - 1], 1);

			if (adminMode && adminID.includes(message.author.id)) {
				itemsToGive = 0;
			}

			for (i = 0; i < listOfStoreItems.length; i++) {
				if (args[0] == listOfStoreItems[i][1]) {
					if (dbGet[listOfStoreItems[i][0]] >= itemsToGive) {
						dbGet[listOfStoreItems[i][0]] -= itemsToGive;
						client.setScore.run(dbGet);
						for (var member in usersToGiveTo) {
							var someoneDBget = client.getScore.get(usersToGiveTo[member].id);
							if (!someoneDBget) {
								someoneDBget = generateDbEntry(usersToGiveTo[member]);
							}
							someoneDBget[listOfStoreItems[i][0]] += itemsToReceive;
							client.setScore.run(someoneDBget);
							logger.info(`User ${message.author.username} gave ${usersToGiveTo[member].username} ${itemsToReceive}x ${listOfStoreItems[i][2]}!`);
						}
						const embed = new Discord.RichEmbed()
							.setTimestamp()
							.setDescription(`${message.author.username} has just gifted ${usersToGiveToString} ${itemsToReceive}x ${listOfStoreItems[i][2]}!`)
							.setTitle(`You have a gift!`)
							.setImage(`${listOfStoreItems[i][4]}`);
						return message.channel.send({
							embed
						});
					} else {
						return message.channel.send(`You do not have enough ${listOfStoreItems[i][2]} to give, why not buy some from the store?`);
					}
				}
			}
			return message.channel.send("You should never be able to see this message....");
		}

		if (command == 'inv') {
			const embed = new Discord.RichEmbed()
				.setTitle(message.author.username)
				.setThumbnail(message.author.displayAvatarURL)
				.setDescription("This is a list of all of your current items.")
				.setFooter(`Your balance is ${dbGet.currency}`)
				.setColor(0x406DA2);
			for (k = 0; k < listOfStoreItems.length; k++) {
				embed.addField(`${listOfStoreItems[k][2]}`, `${dbGet[listOfStoreItems[k][0]]}`, true);
			}
			message.channel.send({
				embed
			});
		}
		
		if (command == "id") {
			if (!message.mentions.users.first()) return message.channel.send("Please mention a user.");
			const taggedUser = message.mentions.users.first();
			return message.channel.send(`${taggedUser.username} has the ID of \`${taggedUser.id}\`.`);
		}
		
		if (command == 'initialise' && message.author.id == adminID && message.guild) {
			const arrayOfMembers = message.guild.members.array();
			var membersString = "";
			for (var guildMemberId in arrayOfMembers) {
				if (arrayOfMembers[guildMemberId].user.bot)
					continue;

				var dbGet = client.getScore.get(arrayOfMembers[guildMemberId].user.id);
				if (!dbGet) {
					dbGet = generateDbEntry(arrayOfMembers[guildMemberId].user);
					client.setScore.run(dbGet);
					membersString += arrayOfMembers[guildMemberId].user.username + '\n';
				}
			}
			if (membersString == "") {
				message.channel.send(`Everyone in ${message.guild.name} already has an entry in the DB!`);
				logger.info(`Everyone in ${message.guild.name} already has an entry in the DB. Skipping....`);
				return;
			}
			return message.channel.send(`Created database entries for users: \`\`\`${membersString}\`\`\``);
		}

		if (command == "godmode") {
			adminMode = !adminMode;
			if (adminMode == true) {
				message.channel.send("Godmode mode has been enabled, enjoy the free items!");
			} else {
				message.channel.send("Godmode mode has been disabled!");
			}
		}
		
		if (command == "roll") {
			if (!args[0]) return message.channel.send(`Please choose a number. \`SYNTAX: ${prefixGet.prefix}roll 1d20\`.`);
			const dice = args[0].toLowerCase().split('d');
			
			var timesToRoll = Math.ceil(parseInt(dice[0]));
			var diceNumber = Math.ceil(parseInt(dice[1]));
			var rolledNumbers = [];
			
			if (dice.length == 1) {
				diceNumber = timesToRoll;
				timesToRoll = 1;
			}
			if (diceNumber > 99999999999999) return message.channel.send("That number is wayyy too high.");
			
			if (timesToRoll > 1000) return message.channel.send("I cannot send that many numbers.");
			if (timesToRoll < 1 || diceNumber < 1) return message.channel.send("Please choose numbers larger than 0.");
			if (!timesToRoll || !diceNumber) return message.channel.send(`Please choose a number of dice to roll. \`SYNTAX: ${prefixGet.prefix}roll 1d20\`.`);
			var time = new Date().getTime();
			for (i = 0; i < timesToRoll; i++) {
				var seed = (message.author.id * chatChannel.id * time * (i + 1)).toString();
				var rng = seedrandom(seed);
				rolledNumbers.push(Math.ceil(rng() * diceNumber));
			}
			
			messageToSend = `${message.author.username} rolled ${stringifyArray(rolledNumbers)}.`;
			
			if (messageToSend.length  > 2000) {
				message.channel.send("The message would be too long...");
			} else {
				message.channel.send(messageToSend);
			}
		}
		
		if (command == "chance") {
			const num = Math.ceil(parseInt(args[0], 10));
			if (!num) return message.channel.send(`Please choose a number. \`SYNTAX: ${prefixGet.prefix}chance [integer]\`.`);
			if (num < 1 || num > 100) return message.channel.send("Please choose a number between 1 and 100.");

			var time = new Date().getTime();
			var seed = (message.author.id * chatChannel.id * time).toString();
			var rng = seedrandom(seed);
			
			if (Math.floor((rng() * 100 + 1)) > num) {
				message.channel.send(`Your ${num}% chance has failed.`);
			} else {
				message.channel.send(`Your ${num}% chance has succeeded.`);
			}
			
		}
		
		if (command == "coinflip") {
			var time = new Date().getTime();
			var seed = (message.author.id * chatChannel.id * time).toString();
			var rng = seedrandom(seed);
			
			if (rng() < 0.5) {
				message.channel.send(`You flipped a coin and it landed on Heads.`);
			} else {
				message.channel.send(`You flipped a coin and it landed on Tails.`);
			}
		}
		
		if (command == "8ball") {
			if (args.length == 0) return message.channel.send("Please ask a question.");
			const answer = eightBallAnswers[Math.floor(Math.random() * eightBallAnswers.length)];
			message.channel.send(answer);
		}
		
		if (command == "yt") {
			ytSearch(args.join(' '), opts, function (err, results) {
				if (err)
					return logger.error(err);
				if (results.length == 0)
					return message.channel.send("No results found.");
				message.channel.send(results[0].link);
				logger.info(`User ${message.author.username} requested a video with the URL of ${results[0].link}`);
			});
		}

		if (command == "rp2yt") {
			var mentionedUser = message.mentions.users.first();
			if (!mentionedUser)
				mentionedUser = message.author;
			if (mentionedUser.bot)
				return message.channel.send("That is a bot...");
			if (!mentionedUser.presence.game)
				return message.channel.send("This user is not listening to anything.");
			if (!mentionedUser.presence.game.details || !mentionedUser.presence.game.state)
				return message.channel.send(`Unable to find music for User ${mentionedUser.username}.`);
			ytSearch(`${mentionedUser.presence.game.details} - ${mentionedUser.presence.game.state}`, opts, function (err, results) {
				if (err)
					return logger.error(err);
				if (results.length == 0)
					return message.channel.send("No results found for user.");
				message.channel.send(results[0].link);
				logger.info(`User ${message.author.username} requested ${mentionedUser.username}'s song which has the URL of ${results[0].link}`);
			});
		}
		if (command == "kahoot_nuke") {
			if (!usedKahootNuke.has(`${message.author.id}-kahoot`)) {
				if (args.length < 2) return message.channel.send("Please provide the number of bots for the kahoot and the kahoot ID number. `SYNTAX: [number of bots] [room number]`.");
				var numOfBots = TryParseInt(args[0], 0);
				var roomID = TryParseInt(args[1], 0);
				if (roomID < 1) return message.channel.send("Invalid Room ID.");
				if ((numOfBots < 1) || (numOfBots > 50)) return message.channel.send("Please choose a number between 1 and 50.");
				var num = 0;
				if (!adminID.includes(message.author.id)) usedKahootNuke.add(`${message.author.id}-kahoot`);
				setTimeout(() => {
							if (usedKahootNuke.has(`${message.author.id}-kahoot`)) {
							usedKahootNuke.delete(`${message.author.id}-kahoot`);
							}
						}, 60000 * 10);
				var num = 0;
				for (i = 0; i < numOfBots; i++) {
					num++;
					var kahootClient = new Kahoot;
					var kahootName = randomString();
					kahootClient.join(roomID, kahootName).then(logger.info(`Bot ${kahootName} joined Room ${roomID}. Bot ${num} of ${numOfBots}.`));
				}
			} else {
				return message.channel.send("You must wait 10 minutes before using the kahoot nuke again.");
			}
		}
		if (command == "d3") {
			message.channel.startTyping();
			const item = args.join('+');
			const url = `https://www.diablonut.com/armory/items.php?search&name=${item}&order=name&direction=ASC`;
			var embed = new Discord.RichEmbed().setTitle(`Diablo 3 Item Search Results for: ${args.join(' ')}`);
			tabletojson.convertUrl(url, function(tablesAsJson) {
				var mainList = tablesAsJson[0];
				if (!mainList) {
					message.channel.stopTyping();
					return message.channel.send(`Could not find an item with the name of "${args.join(' ')}".`);
				}
				if (_.size(mainList) > 10) {
					var limit = 10;
				} else {
					var limit = _.size(mainList);
				}
				for (i = 0; i < limit; i++) {
					embed.addField(`${mainList[i].Name} - ${mainList[i].Type} - ${mainList[i].Slot} - ${mainList[i].Rarity}`, `[More Details](https://www.diablonut.com/item/${mainList[i].Name.replace(/\'/g, '').replace(/\ /g, '-')})`);
				}
				if (_.size(mainList) > 10) 	embed.addField(`Items shown are limited to 10 to reduce spam`, `[Click here to view all items.](${url})`); 
				message.channel.stopTyping();
				return message.channel.send({embed});
				});
		}
	}

	if (message.guild && message.guild.id == 275388903547076610 || 256139176225931264) {
		for (var i = 0; i < wordsInMessage.length; i++) {
			if (wordsInMessage[i].toLowerCase() == "tra") {
				message.channel.startTyping();
				message.channel.send("tra");
				message.channel.stopTyping();
				return;
			}

			if (wordsInMessage[i].toLowerCase() == "ariana") {
				message.channel.startTyping();
				fileName = ariana4mogs(0, chatChannel, message.author, chatChannel);
				message.channel.send({
					file: fileName
				});
				message.channel.stopTyping();
				return;
			}
			if (wordsInMessage[i].toLowerCase() == "monky") {
				message.channel.startTyping();
				fileName = ariana4mogs(1, chatChannel, message.author, chatChannel);
				message.channel.send({
					file: fileName
				});
				message.channel.stopTyping();
				return;
			}
		}
	}

	if (message.content.toLowerCase().startsWith('>tfw') || message.content.toLowerCase().startsWith('tfw')) {
		message.channel.send('feels bad man :(')
	}

	if (alreadyLevelledUp == false) {
		dbGet.level = Math.floor(calculateLevel(dbGet.points));
	}

	client.setScore.run(dbGet);

	if (JSON.stringify(cachedStorage) != JSON.stringify(storage)) {
		fs.writeFile('./data/storage.json', JSON.stringify(storage), (err) => {
			if (err)
				logger.error(err)
		});
	}

});

function generateDbEntry(usableId) {
	var currentTime = Math.floor(Date.now() / 1000);
	logger.info(`User ${usableId.username} does not currently have an entry in the DB. Making one now`);
	var returnedDb;
	returnedDb = {
		id: `${usableId.id}_${currentTime}`,
		user: usableId.id,
		last_known_displayName: usableId.username,
		points: 0,
		level: 1,
		currency: 0,
		total_messages_sent: 0,
		discord_silver: 0,
		rick_roll: 0,
		manning_face: 0,
		discord_gold: 0
	}
	logger.info("Should have created a DB entry for user " + usableId.username);
	return returnedDb;
}

function calculateLevel(points) {
	const currentLevel = 2 * (Math.pow(points, 2 / 3)) - 1;
	return currentLevel;
}
function calculatePoints(level) {
	const currentPoints = Math.pow((level + 1) / 2, 1 / (2 / 3));
	return currentPoints;
}

function TryParseInt(str, defaultValue) {
	var retValue = defaultValue;
	if (str !== null) {
		if (str.length > 0) {
			if (!isNaN(str)) {
				retValue = parseInt(str);
			}
		}
	}
	return retValue;
}

function stringifyArray(array) {
	arrayAsString = "";
	for (var i = 0; i < array.length; i++) {
		var entry = array[i];
		if (i != array.length - 1) {
			arrayAsString += entry + ", ";
		} else {
			arrayAsString += entry;
		}
	}
	return arrayAsString;
}

function stringify2DArray(array, index) {
	arrayAsString = "";
	for (var i = 0; i < array.length; i++) {
		var entry = array[i];
		if (i != array.length - 1) {
			arrayAsString += entry + ", ";
		} else {
			arrayAsString += entry;
		}
	}
	return arrayAsString;
}

function ariana4mogs(type, channel, author, guild) {
	var time = new Date().getTime();
	var seed = (author.id * guild.id * time).toString();
	var rng = seedrandom(seed);

	if (type == 0) {
		var path = './data/server-specifics/4mogs/';
		var files = fs.readdirSync(path)
			ranFile = files[Math.floor(rng() * files.length)]
	}
	if (type == 1) {
		var path = './data/server-specifics/bumpics/';
		var files = fs.readdirSync(path)
			ranFile = files[Math.floor(rng() * files.length)]
	}
	logger.info(`Sending a file with the name of ${path + ranFile} to ${channel.name} in ${guild.name}, requested by ${author.username}. Seed: '${seed}'.`);
	return path + ranFile;
}

function defaultdance(message) {
  var update = function(index) {
    message.edit('```' + defaultdanceascii[index] + '```')
      .then(setTimeout(function() {
        if (index + 1 < defaultdanceascii.length) {
          update(index + 1);
        } else {
			message.edit("Default Dance over.");
		}
      }, 1000));
  };

  update(0);
}

function timeConversion(duration) {
	var milliseconds = parseInt((duration % 1000) / 100),
		seconds = parseInt((duration / 1000) % 60),
		minutes = parseInt((duration / (1000 * 60)) % 60),
		hours = parseInt((duration / (1000 * 60 * 60)) % 24);

	hours = (hours < 10) ? "0" + hours : hours;
	minutes = (minutes < 10) ? "0" + minutes : minutes;
	seconds = (seconds < 10) ? "0" + seconds : seconds;

	return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}

function randomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 12; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function codeBlokkit(message, lang) {
	var result = "";
	if (lang == 0) {
		result += "```\n";
	} else {
		result += `\`\`\`${lang}\n`;
	}
	result += message;
	result += "\n```";
	return result;
	}

client.login(config.token);
