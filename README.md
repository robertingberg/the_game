# "The Game"

A small JS-based game, where the goal is to drive your car to your house.

## Browser-based Game

The Game can be played through the browser, by opening the index.html file in your browser.

On the Welcome-screen, you will be asked if you want to play "Programmatic" or "Easy".

### Programmatic game-play

With programmatic game-play, you enter a set of command with your keyboard (see commands below). When you are happy with your set, you can start drive the card with ENTER.

The car will move according to your commands. If you have not yet reached the house, you can continue with a new set of commands, until you reach your house, or if you hit a tree.

### Easy game-play

Just drive your car around until you get home. Be careful to avoic the trees!

### Game-controls

```
Arrow up: Drive forward
Arrow down: Drive backward
Arrow right: Rotate clockwise
Arrow left: Rotate counter-clockwise
```

## Run with commandline

You can also "play" directly in your terminal. Just run the Node.js followed by a set of commands. 

* The size of the table as two integers [width, height]
* The objects starting position as two integers [x, y]
* This is followed by an arbitrarily long stream of commands of integers.

```
node Node.js 4,4,2,2,1,2,1,3,4
```
The commands are:
```
0 = quit simulation and print results
1 = move forward one step
2 = move backwards one step
3 = rotate clockwise 90 degrees (eg north to east)
4 = rotate counterclockwise 90 degrees (eg west to south)
```