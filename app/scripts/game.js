/**
 * Created by OKravchenko on 19/10/2016.
 */
'use strict';

var colors = [0x000000, 0xFFFFFF, 0x423b43, 0x6b5e68, 0xdce3e9, 0xbeb8b8];

var Game = function (config) {

  this.config = config;
  var me = this;
  var w = this.config.blockHeight;
  var h = this.config.blockWidth;
  var pole = [];
  var score = 0;
  var dx;
  var dy;

  var isAnimPlay = false;

  var textures = [];
  var renderer;
  var stage;

  this.setSize = function (blockWidth, blockHeight) {
    w = blockWidth;
    h = blockHeight;
    init();
    me.reset();
  };

  this.reset = function () {


    var text = stage.getChildByName('endtext');
    if (text) {
      var ind = stage.getChildIndex(text);
      stage.removeChildAt(ind);
    }
    //reset score
    score = 0;
    calcScore(0);

    //reset and randomize blocks
    for (let i = 0; i < w; i++) {
      for (let j = 0; j < h; j++) {
        let color = Math.floor(Math.floor(Math.random() * 40) / 10) + 2;

        pole[i][j].x = i * dx;
        pole[i][j].y = j * dy;
        pole[i][j].alpha = 1;
        pole[i][j].color = color;
        pole[i][j].texture = textures[color]
      }
    }

    renderer.render(stage);
  };

  function init() {

    dx = me.config.width / w;
    dy = me.config.height / h;

    //create container
    stage = new PIXI.Container();


    //create texture
    for (let i in colors) {
      textures[i] = new PIXI.RenderTexture(renderer, dx, dy);
      var grh = new PIXI.Graphics();
      grh.lineStyle(2, 0x000000, 1);
      grh.beginFill(colors[i], 1);
      grh.drawRect(0, 0, dx, dy);
      grh.endFill();
      textures[i].render(grh);
    }
    //Then create a sprite from the texture
    //create blocks
    for (let i = 0; i < w; i++) {
      pole[i] = [];
      for (let j = 0; j < h; j++) {
        pole[i][j] = new PIXI.Sprite();
        pole[i][j].interactive = true;
        pole[i][j].on('mousedown', onClick);
        pole[i][j].on('touchstart', onClick);
        stage.addChild(pole[i][j]);
      }
    }
  }

  function onClick(evt) {
    if (isAnimPlay) {
      return
    }
    // get the shape that was clicked on

    let shape = evt.target;
    let curColor = shape.color;

    if (curColor < 2) return;

    let i = ~~(shape.x / dx);
    let j = ~~(shape.y / dy);
    let score = floodFill(i, j, shape.color, 1);

    if (score > 1) {
      floodFill(i, j, 1, 0);
      moveH();
      moveW();

      calcScore(score);
      isAnimPlay = true;
      requestAnimationFrame(animate);

    } else {
      floodFill(i, j, 1, curColor);
    }
  }

  var fps = 60;
  var now;
  var then = Date.now();
  var interval = 1000 / fps;
  var delta;

  function animate(frame) {

    if (isAnimPlay) requestAnimationFrame(animate); else afterMove();

    now = Date.now();
    delta = now - then;

    if (delta > interval) {
      // update time stuffs
      then = now - (delta % interval);

      var dist = 8;

      let is_anim = false;

      for (let i = 0; i < w; i++) {
        for (let j = 0; j < h; j++) {

          let nx = Math.max(pole[i][j].x - dist, i * dx);
          let ny = Math.min(pole[i][j].y + dist, j * dy);

          if (nx > i * dx || ny < j * dy) {
            is_anim = true;
          }
          pole[i][j].x = nx;
          pole[i][j].y = ny;
        }
      }
      renderer.render(stage);

      if (!is_anim) isAnimPlay = false;
    }
  }

  function floodFill(x, y, c, k) {

    if (x < 0 || x >= w) return 0;
    if (y < 0 || y >= h) return 0;

    let cur = pole[x][y];

    if (cur.color != c) return 0;

    cur.texture = textures[k];

    if (k < 2) cur.alpha = 0; else cur.alpha = 1;

    cur.color = k;

    let res = 1;
    res = res + floodFill(x + 1, y, c, k);
    res = res + floodFill(x - 1, y, c, k);
    res = res + floodFill(x, y + 1, c, k);
    res = res + floodFill(x, y - 1, c, k);

    return res;
  }


  function moveW() {
    for (let z = 0; z < w - 1; z++) {

      for (let i = 0; i < w - 1; i++) {
        let c = 0;
        for (let j = 0; j < h; j++) {
          c = +pole[i][j].color;
        }
        if (c == 0) {
          //swap columns
          pole[i] = [pole[i + 1], pole[i + 1] = pole[i]][0];
        }
      }
    }
  }

  function moveH() {
    for (let i = 0; i < w; i++) {
      for (let j = h - 1; j >= 0; j--) {
        if (pole[i][j].color == 0) {
          for (let k = j - 1; k >= 0; k--) {
            if (pole[i][k].color != 0) {
              pole[i][j] = [pole[i][k], pole[i][k] = pole[i][j]][0];
              break;
            }
          }
        }
      }
    }
  }

  function isGameOver() {
    for (let i = 0; i < w; i++) {
      for (let j = 0; j < h; j++) {
        let curColor = pole[i][j].color;
        if (curColor) {
          let score = floodFill(i, j, curColor, 1);
          floodFill(i, j, 1, curColor);
          if (score > 1) return false;
        }
      }
    }
    return true;
  }

  function isGameWin() {
    for (let i = 0; i < w; i++) {
      for (let j = 0; j < h; j++) {
        if (pole[i][j].color != 0) {
          return false
        }
      }
    }
    return true;
  }

  function drawEnd(text, background, textcolor) {
    var style = {
      font: 'bold 24px Arial',
      fill: textcolor,
      stroke: '#000000',
      strokeThickness: 2,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6
    };

    var richText = new PIXI.Text(text, style);

    richText.x = me.config.width / 2 - richText.width / 2;
    richText.y = me.config.height / 2 - richText.height / 2;
    richText.name = 'endtext';
    stage.addChild(richText);

    renderer.render(stage);
  }

  function afterMove() {

    if (isGameWin()) {
      drawEnd('YOU WON', '#FFF', '#FFF');
    } else if (isGameOver()) {
      drawEnd('GAME OVER', '#FFF', '#FFF');
    }

    isAnimPlay = false;
  }

  function calcScore(s) {
    score += s;
    if (me.config.scoreId) {
      document.getElementById(me.config.scoreId).innerText = score;
    }

  }

  function createRender() {
    renderer = PIXI.autoDetectRenderer(me.config.width, me.config.height, {transparent: true});
    renderer.backgroundColor = 0x061639;
    // add render view to DOM
    document.querySelector('#canva').appendChild(renderer.view);
  }

  createRender();
  init();
  me.reset();
};

document.addEventListener('DOMContentLoaded', function () {

  let container = document.querySelector('#canva');

  //noinspection JSSuspiciousNameCombination
  let game = new Game({
    containerId: 'canva',    
    width: container.clientWidth,
    height: container.clientWidth,
    blockWidth: 8,
    blockHeight: 8
  });


});