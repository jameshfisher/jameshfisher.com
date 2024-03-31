---
title: Cloning Spaceteam
tags:
  - web-apps
  - pusher
  - webrtc
  - javascript
taggedAt: '2024-03-26'
summary: >-
  A multiplayer web-based version of the cooperative game Spaceteam, using
  Pusher for real-time communication between players.
---

Spaceteam is a multiplayer cooperative game which simulates a team of people operating a spaceship by manipulating the widgets on its deck. Each player uses their mobile. Their screen shows their individual piece of the spaceship's deck. Each player always has an instruction at the top of the screen. The instructions may be for other players; thus the team have to communicate by shouting out instructions. Hilarity ensues from the stupid names of the widgets and the ineffectiveness of the team's communication.

The game works over WiFi. The apps discover each other if they are on the same WiFi network. I thought it would be fun to recreate the game as a web app using WebRTC. But before this, let's recreate it using Pusher. This would have a "channel" per game. So each player communicates with every other player by publishing to the channel. From here, we can convert the game to WebRTC with the same model: each client, instead of publishing to the channel, will send to every other player in the game using a DataChannel.

Let's first strip the game down to its bare essentials:

* The game does not have multiple "sectors". It continues, getting gradually harder, until the team dies.
* The game does not have so many widget types. It just has buttons, e.g. "Spank the Spacewidget".
* There's a global channel plus a channel per game.
* Each player is either in the state IN_WAITING_ROOM, or IN_GAME, or GAME_FINISHED. Player begins IN_WAITING_ROOM, transitions to IN_GAME, then to GAME_FINISHED, then back to IN_WAITING_ROOM.
* If a player is IN_WAITING_ROOM, he can press a "start game" button. This generates a random game id, publishes it to the global channel, and transitions to being IN_GAME.
* If a player is IN_WAITING_ROOM and receives a "start game" message, he transitions to being IN_GAME with that game id.
* When a player joins a game, he generates a random set of buttons for his dashboard. This is part of his presence data when joining the channel.
* Players generate instructions for themselves based on their knowledge of every player's dashboard.
* Each player has a success count, a failure count, and a button-press count.
* The instruction timeout is `30/log(button_presses)` seconds, so the game gradually gets harder.
* All button presses increment the local player's button-press count, and cause a publish to the channel.
* If a player's instruction is not satisfied in time, he increments his failure count. If an instruction is satisfied, he increments his success count. In both cases, he publishes his new counts to the channel.
* The team's health is defined as: `100 + 5*successes - 20*failures - button_presses`.
* When a player sees `team_health <= 0`, he publishes "game over".
* The "game over" message includes the team's score, which is the total successes.
* When a player receives a "game over" message, he goes to GAME_FINISHED. The screen shows the score.
* When a player is in GAME_FINISHED, he can click a "back to waiting room" button. This moves him back to IN_WAITING_ROOM.
