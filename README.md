# Octopus AMD

Micro AMD Loader.
> Version 0.1.0

# Docs

 - [Usage](#usage)
 - [Tools](#tools)
 - [Example](https://github.com/serpentem/octopus-amd/tree/master/example)

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
* If your into CoffeeScript, you may take look at [Coffee-Toaster](#http://github.com/serpentem/coffee-toaster) which use Octupus-AMD as it's default loader.