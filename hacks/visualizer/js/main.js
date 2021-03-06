(function() {
  var $, analyser, canvas, color, ctx, hideEnableAudioMessage, rainbow, scale, screenSize, setupStream, showEnableAudioMessage, showingHelp, xScale, yScale, _;

  color = require('./color');

  scale = require('./scale');

  _ = require('underscore');

  analyser = require('./analyser');

  $ = require('jquery-browserify');

  showingHelp = false;

  showEnableAudioMessage = _.once(function() {
    $('.instructions').show();
    return showingHelp = true;
  });

  hideEnableAudioMessage = _.once(function() {
    $('.instructions').hide();
    return showingHelp = false;
  });

  screenSize = (function() {
    var d, e, g, w, x, y;
    w = window;
    d = document;
    e = d.documentElement;
    g = d.getElementsByTagName('body')[0];
    x = w.innerWidth || e.clientWidth || g.clientWidth;
    y = w.innerHeight || e.clientHeight || g.clientHeight;
    return {
      x: x,
      y: y
    };
  })();

  canvas = document.getElementById('canvas');

  canvas.width = screenSize.x;

  canvas.height = screenSize.y;

  ctx = canvas.getContext('2d');

  yScale = scale.linear().domain([0, 255]).range([canvas.height * 1.25, canvas.height * -0.25]);

  xScale = scale.linear().domain([0, 1024]).range([0, canvas.width]);

  rainbow = color.genRainbow();

  setupStream = function(stream) {
    var a, context, micNode, startupTimeout;
    context = new webkitAudioContext();
    micNode = context.createMediaStreamSource(stream);
    a = analyser.setup(context, micNode);
    startupTimeout = setTimeout(showEnableAudioMessage, 3000);
    return a.on('time', function(timeData) {
      var fill, max;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(0.01);
      ctx.translate(-1 * canvas.width / 2, -1 * canvas.height / 2);
      ctx.beginPath();
      ctx.strokeStyle = "rgb(" + (rainbow().join(',')) + ")";
      ctx.moveTo(xScale(0), yScale(timeData[0]));
      _.each(timeData, function(v, i) {
        if (i !== 0) {
          return ctx.lineTo(xScale(i), yScale(v));
        }
      });
      ctx.stroke();
      max = _.max(timeData) - 127;
      if (showingHelp && max > 1) {
        hideEnableAudioMessage();
      }
      if (max !== 1 && startupTimeout) {
        clearTimeout(startupTimeout);
      }
      fill = "rgb(" + max + "," + (Math.floor(Math.random() * 255)) + ",255)";
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, max, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      return ctx.fillRect(-canvas.width, -canvas.height, 2 * canvas.width, 2 * canvas.height);
    });
  };

  navigator.webkitGetUserMedia({
    audio: true
  }, setupStream);

}).call(this);
