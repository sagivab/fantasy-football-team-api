const app = require('../../app');
const mongoose = require('mongoose');
const request = require('supertest');
const setCookie = require('set-cookie-parser');

const users = [{ email: 'user1@test.com', password: 'A0ksdn87230!w' },
                  { email: 'user2@test.com', password: 'A0ksdn87230!w' },
                  { email: 'user3@test.com', password: 'A0ksdn87230!w' }];

beforeAll((done) => {
  mongoose.connection.dropDatabase(done);
});

let cookie, teamIdForLoggedUser, playersForLoggedUser, playerFromTransferList;
const marketPrice = 50000;
const initialBudget = 5000000;
const initialPlayerValue = 1000000;

describe('POST /user/register', () => {

    users.forEach((user) =>
      describe('given an email and password for register', () => {
        test('Create new user(team and 20 players)', async () => {
          const response = await request(app).post('/user/register').send({
            email: user.email,
            password: user.password
          })
          expect(response.statusCode).toBe(201)
        })
      })
    );

    describe('given an email and password for register', () => {
      test('register with existing email in DB', async () => {
        const response = await request(app).post('/user/register').send({
          email: users[0].email,
          password: users[0].password
        })
        expect(response.statusCode).toBe(409);
      })
    });
});

describe('POST /user/login', () => {
  describe('given an email and password for login', () => {
    test('Should response with a cookie and login for user1', async () => {
      const response = await request(app).post('/user/login').send({
        email: users[0].email,
        password: users[0].password
      })
      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
      const cookieParsed = setCookie.parse(response.headers['set-cookie']);
      cookie = cookieParsed[0].name + '=' + cookieParsed[0].value;
      teamIdForLoggedUser = response.body.user.teamOwn;
    })
  })  
});

describe('GET /player/transferlist', () => {
  describe('Get transferlist', () => {
    test('Should provide an empty list of players', async () => {
      const response = await request(app).get('/player/transferlist').set('cookie', cookie).send();
      expect(response.statusCode).toBe(200);
      expect(response.body.players).toBeDefined();
      expect(response.body.players).toEqual([]);
    }) 
  })
});

describe('GET /team/:id', () => {
  describe('Should provide team details for user1', () => {
    test('Should provide team details', async () => {
        const response = await request(app).get('/team/'+teamIdForLoggedUser).set('cookie', cookie).send();
        expect(response.statusCode).toBe(200);
        expect(response.body.team).toBeDefined();
        expect(response.body.team.players).toBeDefined();
        playersForLoggedUser = response.body.team.players;
        expect(playersForLoggedUser.length).toBe(20);
    })
  })
});

describe('PATCH /player/sell/:id', () => {
    test('Should sell the first player in the array', async () => {
      const response = await request(app).patch('/player/sell/'+playersForLoggedUser[0]).set('cookie', cookie).send({ marketPrice });
      expect(response.statusCode).toBe(200);
      expect(response.body.player.isOnMarket).toBeDefined();
      expect(response.body.player.isOnMarket).toBe(true);
      expect(response.body.player.marketPrice).toBeDefined();
      expect(response.body.player.marketPrice).toBe(marketPrice);
    })
});

describe('GET /player/transferlist', () => {
  describe('Get transferlist', () => {
    test('Should provide an empty list of players', async () => {
      const response = await request(app).get('/player/transferlist').set('cookie', cookie).send();
      expect(response.statusCode).toBe(200);
      expect(response.body.players).toBeDefined();
      expect(response.body.players.length).toBe(1);
      playerFromTransferList = response.body.players[0]._id;
    }) 
  })
});

describe('POST /user/login', () => {
  describe('given an email and password for login', () => {
    test('Should response with a cookie and login for user2', async () => {
      const response = await request(app).post('/user/login').send({
        email: users[1].email,
        password: users[1].password
      })
      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
      const cookieParsed = setCookie.parse(response.headers['set-cookie']);
      cookie = cookieParsed[0].name + '=' + cookieParsed[0].value;
      teamIdForLoggedUser = response.body.user.teamOwn;
    })
  })  
});

describe('PATCH /player/buy/:id', () => {
  test('Should sell the first player in the array', async () => {
    const response = await request(app).patch('/player/buy/'+playerFromTransferList).set('cookie', cookie).send();
    expect(response.statusCode).toBe(200);
    expect(response.body.player.isOnMarket).toBeDefined();
    expect(response.body.player.isOnMarket).toBe(false);
    expect(response.body.player.marketValue).not.toBe(initialPlayerValue);
  })
});

describe('GET /team/:id', () => {
  describe('Should provide team details for user2', () => {
    test('Should provide team details and check that players list and budget has been updated', async () => {
        const response = await request(app).get('/team/'+teamIdForLoggedUser).set('cookie', cookie).send();
        expect(response.statusCode).toBe(200);
        expect(response.body.team).toBeDefined();
        expect(response.body.team.players).toBeDefined();
        playersForLoggedUser = response.body.team.players;
        expect(playersForLoggedUser.length).toBe(21);
        expect(response.body.team.budget).toBeDefined();
        expect(response.body.team.budget).toBe(initialBudget - marketPrice);
    })
  })
});

describe('POST /user/login', () => {
  describe('given an email and password for login', () => {
    test('Should response with a cookie and login for user1', async () => {
      const response = await request(app).post('/user/login').send({
        email: users[0].email,
        password: users[0].password
      })
      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
      const cookieParsed = setCookie.parse(response.headers['set-cookie']);
      cookie = cookieParsed[0].name + '=' + cookieParsed[0].value;
      teamIdForLoggedUser = response.body.user.teamOwn;
    })
  })  
});

describe('GET /team/:id', () => {
  describe('Should provide team details for user1', () => {
    test('Should provide team details and check that players list and budget has been updated', async () => {
        const response = await request(app).get('/team/'+teamIdForLoggedUser).set('cookie', cookie).send();
        expect(response.statusCode).toBe(200);
        expect(response.body.team).toBeDefined();
        expect(response.body.team.players).toBeDefined();
        playersForLoggedUser = response.body.team.players;
        expect(playersForLoggedUser.length).toBe(19);
        expect(response.body.team.budget).toBeDefined();
        expect(response.body.team.budget).toBe(initialBudget + marketPrice);
    })
  })
});

afterAll(async () => await mongoose.connection.close() );
