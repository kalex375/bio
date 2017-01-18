/**
 * svganimations2.js v1.0.0
 * http://www.codrops.com
 *
 * the svg path animation is based on http://24ways.org/2013/animating-vectors-with-svg/ by Brian Suda (@briansuda)
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2013, Codrops
 * http://www.codrops.com
 */
$(document).ready(function () {

  'use strict';

  window.requestAnimFrame = function(){
    return (
      window.requestAnimationFrame       ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame    ||
      window.oRequestAnimationFrame      ||
      window.msRequestAnimationFrame     ||
      function(/* function */ callback){
        window.setTimeout(callback, 1000 / 60);
      }
    );
  }();

  window.cancelAnimFrame = function(){
    return (
      window.cancelAnimationFrame       ||
      window.webkitCancelAnimationFrame ||
      window.mozCancelAnimationFrame    ||
      window.oCancelAnimationFrame      ||
      window.msCancelAnimationFrame     ||
      function(id){
        window.clearTimeout(id);
      }
    );
  }();

  var svgs = Array.prototype.slice.call( document.querySelectorAll( 'svg' ) ),
    hidden = Array.prototype.slice.call( document.querySelectorAll( '.draw' ) ),
    current_frame = 0,
    total_frames = 100,
    path = new Array(),
    length = new Array(),
    handle = 0;

  function init() {
    [].slice.call( document.querySelectorAll( 'path' ) ).forEach( function( el, i ) {
      path[i] = el;
      var l = path[i].getTotalLength();
      length[i] = l;
      path[i].style.strokeDasharray = l + ' ' + l;
      path[i].style.strokeDashoffset = l;
    } );

  }

  function draw() {
    var progress = current_frame/total_frames;
    if (progress > 1) {
      window.cancelAnimFrame(handle);
      showPage();
    } else {
      current_frame++;
      for(var j=0; j<path.length;j++){
        path[j].style.strokeDashoffset = Math.floor(length[j] * (1 - progress));
      }
      handle = window.requestAnimFrame(draw);
    }
  }

  function showPage() {
    svgs.forEach( function( el, i ) {
      el.setAttribute( 'class', el.getAttribute('class') + ' hide' );
    } );
    hidden.forEach( function( el, i ) {
      classie.remove( el, 'hide' );
      classie.add( el, 'show' );
    } );
  }


  $('.draw').each(function (e,el) {
    var  y  =el.clientHeight;
    var x = el.clientWidth;

    $(el).append('<svg class="d1" viewBox="0 0 '+x+' '+y+'"  preserveAspectRatio="none"><path d="M0 0 L0 '+y+' L'+x+' '+y+' L'+x+' 0 Z" /></svg>')
    }

  ).addClass('draw-ready');
  init();
  draw();

});
