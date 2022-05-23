db.createUser(
	{
		user: "user",
		pwd: "pass",
		roles: [
			{
				role: "readWrite",
				db: "database"
			}
		]
	}
);

db = db.getSiblingDB('BeatSaber')

db.createCollection('Users');
db.createCollection('Servers');
db.createCollection('Leaderboard');