siha
===

[![Build Status](https://travis-ci.com/dt-rush/siha.svg?branch=master)](https://travis-ci.com/dt-rush/siha) 
[![codecov](https://codecov.io/gh/dt-rush/siha/branch/master/graph/badge.svg)](https://codecov.io/gh/dt-rush/siha)

( **si**mple **ha**bit )

<img src="https://cdn.rawgit.com/dt-rush/siha/master/images/update.svg" with="100%" height="200"> \*

There are several habit tracker / productivity apps out there which do each a
subset of what I'd like. So I'll just write my own.

## Development

1. Make changes
2. Before commit, ensure `gulp test` passes.
3. Commit changes, with `Change-Type: (major|minor|patch)` in the commit footer.
4. Run `gulp release` (generates jsdoc and updates changelog, version, tags, pushes)

## TODO:

1. determine statistics that the user would find useful
2. implement statistics
3. build a front-end in a web-app (separate repo)

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
