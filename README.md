 **Soccer Online Manager Game**

 **Description**

A simple application where soccer fans will create fantasy teams and will be able to sell or buy players.

**Prerequisite**

- nodejs installed
- mongodb instance running and set url to db via DATABASE_URL as environment variable.

**Installation**

- git clone git@github.com:sagivab/fantasy-football-team-api.git
- cd fantasy-football-team-api
- run "npm install"
- change the SECRET_KEY enviroment variable(could be done over the .env file).
- run "npm start"

**Testing**

- inside the directory run "npm test"

**How to use**

Anyone can create a user via http://127.0.0.1:5000/user/register
when user registered it assigned a new team and generate 20 players under that team.
request body: must contain email(username) and password.
password must contain at least 1 number, 1 uppercase, 1 lowercase, 1 non-alpha numeric number with lengeth 8-16 characters.

request body should be in json format.

1. User:

    - Login, a registered user may login via  http://127.0.0.1:5000/user/login
        request body: must contain email(username) and password.
		response will contain the user information if login was successful.

2. Authenticated users:

	**TEAM**
		- Get owned team details via http://127.0.0.1:5000/team/:id
			teamOwn id is part of user information provided in response body while login is successful.

		- Update owned team via http://127.0.0.1:5000/team/update/:id
			request body may contain the follwing properties in JSON format:
				name, country
				for ex: { "name": "Tryme", "country": "Country try" }

	**PLAYER**
		- Get owned player information via http://127.0.0.1:5000/player/:id
			players id provided in the team information.

		- Get players on transfer list via http://127.0.0.1:5000/player/transferlist
			list of all players listed for sell.
			can filter with the following properties:
				firstName, lastName are sub str of player values.
				country and teamName aqual to player values.
				minPrice, maxPrice to filter by marketPrice.

		- Update owned player via http://127.0.0.1:5000/player/update/:id
			request body may contatin the following properties in JSON format:
				firstName, lastName, country
				for ex: { "firstName": "Anon", "lastName": "ymous", "country": "None" }

		- Sell owned player via http://127.0.0.1:5000/player/sell/:id
			request body must contain the following properties in JSON format:
				marketPrice - Price asked.

		- Buy player on transfer list http://127.0.0.1:5000/player/buy/:id
