siha
===

( **si**mple **ha**bit )

<img src="https://cdn.rawgit.com/dt-rush/siha/master/images/update.svg" with="100%" height="200"> \*

There are several habit tracker / productivity apps out there which do each a
subset of what I'd like. So I'll just write my own.

## TODO:

1. document build instructions
2. make Dockerfile
3. figure out how to use versionist automatically on commit
4. set up basic badges (codecov, travis build)
5. determine what types of tasks / projects / habits to represent, and how
6. determine statistics that the user would find useful
7. implement tasks / projects / habits model
8. implement statistics
9. build a front-end in a web-app (separate repo)

## Future directions

The intention is that it would be run in a self-hosted manner, inside a Docker
container. Perhaps later, a more robust DB backend (we use sqlite) and a 
multi-user mode / credentials could be implemented to make it a regular web
service (after building the UI). But for now it's a personal project, self-hosted.

Ultimately I'd like to use [resinOS](https://resinos.io/) to deploy
it to a raspberry pi in my apartment, while another container on the same device
queries the DB to update an LED display with physical buttons so I can check off
my daily tasks.

Credit to [arman](https://github.com/armanorama) for physical interface idea.

---

\* Icon made by [Freepik](https://www.freepik.com/) from www.flaticon.com 
