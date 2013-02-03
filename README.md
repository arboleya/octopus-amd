# Octopus AMD

Micro AMD Loader.
> Version 0.1.0

# Docs

 - [Usage](#usage)
 - [Tools](#tools)
 - [Example](https://github.com/serpentem/octopus-amd/tree/master/example)
 - [Contributing](#contributing)
  - [Setup](#setup)
  - [Watch](#watch)
  - [Build](#build)
  - [Test](#test)

--
<a name="usage"/>
# Usage

````html
<html>
<head>
  <title>Octopus Micro AMD loader</title>
  <script type="text/javascript" src="js/octupus-amd.min.js"></script>
  <script type="text/javascript">
    OctopusAMD.config({
     base_url: 'js',
     paths: {
      'jquery': 'https://...'
     }
    });
    require(['app/app']);
  </script>
</head>
<body>
</body>
</html>
````

--
<a name="tools"/>
# Tools

If you're into CoffeeScript, you may take look at [Coffee-Toaster](#http://github.com/serpentem/coffee-toaster) which use Octupus-AMD as it's default loader.

Coffee-Toaster also optimize your modules -- OctopusAMD itself doesn't have an embeded optimnization routine.

--
<a name="contributing">
# Contributing

The included `makefile` orchestrates these actions:

<a name="setup">
# Setup

Sets up repository.

````bash
make setup
````

<a name="watch">
# Watch

Keep in watch'n'compile mode.
Note that the minified version is no compiled here, just the pretty one.

````bash
make watch
````

<a name="build">
# Build

Builds both pretty and minified files.

````bash
make build
````

<a name="test">
# Test

There are currently no tests available (TODO).

````bash
make test
````