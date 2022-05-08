> This is merely a bot created for a group of friends, bug is expected.
# Table of Contents
- [Table of Contents](#table-of-contents)
- [About](#about)
	- [What is This?](#what-is-this)
- [Functionalities](#functionalities)
	- [Features](#features)
	- [Commands](#commands)
		- [Link Account](#link-account)
		- [Update Account](#update-account)
		- [Unlink Account](#unlink-account)
		- [Get Leaderboard](#get-leaderboard)
		- [Set Leaderboard](#set-leaderboard)

<!-- About -->
# About
This is a bot created for a group of friends related to beatsaber for Discord.

## What is This?
This is a beatsaber bot that takes advantage of [scoresaber](https://scoresaber.com/) and [beatsaver](https://beatsaver.com/)'s API to create leaderboard, track your progress, and more.

# Functionalities

## Features
- Link up scoresaber account to use for tracking
- User account displaying
- Automatic Weekly or Daily Leaderboard for registered user (WIP)
- Song search (WIP)

## Commands
### Link Account
> Using the ID obtained from [https://scoresaber.com/user/id](https://scoresaber.com/) to register and link up account to the server/
```
/link scoresaber <userid>
```

### Update Account
> Force update user's account information from [scoresaber.com](https://scoresaber.com/)
```
/update scoresaber
```

### Unlink Account
> Unlink the account from the Server
```
/unlink scoresaber
```

### Get Leaderboard
> Get the leaderboard for the server registered user sorting by pp or by global rank.
```
/leaderboard <by-pp/by-ranking>
```

### Set Leaderboard
> Set the leaderboard for the server (Requires mod permission) which will automatically update every week or every day
```
/setleaderboard <weekly/daily>
```