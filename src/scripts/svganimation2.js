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

window.requestAnimFrame = function () {
    return (
        window.requestAnimationFrame ||
        function (/* function */ callback) {
            window.setTimeout(callback, 1000 / 60);
        }
    );
}();

window.cancelAnimFrame = function () {
    return (
        window.cancelAnimationFrame ||
        function (id) {
            window.clearTimeout(id);
        }
    );
}();

let svgs = Array.prototype.slice.call(document.querySelectorAll('svg.d1')),
    hidden = Array.prototype.slice.call(document.querySelectorAll('.draw')),
    current_frame = 0,
    total_frames = 100,
    path = [],
    length = [],
    handle = 0;


const draws = Array.prototype.slice.call(document.querySelectorAll('.draw'))
draws.forEach(function (el) {
        const y = el.clientHeight;
        const x = el.clientWidth;

        if (el.classList.contains('circle')) {
            const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svgEl.classList.add("d1");
            svgEl.setAttribute("viewBox", `0 0 ${x} ${y}`);
            svgEl.setAttribute("preserveAspectRatio", "none");

            const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
            pathEl.setAttribute("d", circlePath(x / 2, y / 2, (x / 2) - 1));

            svgEl.appendChild(pathEl);
            el.appendChild(svgEl);

        } else {
            const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svgEl.classList.add("d1");
            svgEl.setAttribute("viewBox", `0 0 ${x} ${y}`);
            svgEl.setAttribute("preserveAspectRatio", "none");

            const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
            pathEl.setAttribute("d", `M0 0 L0 ${y} L${x} ${y} L${x} 0 Z`);

            svgEl.appendChild(pathEl);
            el.appendChild(svgEl);
        }
        el.classList.add('draw-ready')
    }
)

init();
draw();


function init() {
    [].slice.call(document.querySelectorAll('.d1 path')).forEach(function (el, i) {
        path[i] = el;
        const l = path[i].getTotalLength();
        length[i] = l;
        path[i].style.strokeDasharray = l + ' ' + l;
        path[i].style.strokeDashoffset = l;
    });

}

function draw() {
    const progress = current_frame / total_frames;
    if (progress > 1) {
        window.cancelAnimFrame(handle);
        showPage();
    } else {
        current_frame++;
        for (let j = 0; j < path.length; j++) {
            path[j].style.strokeDashoffset = Math.floor(length[j] * (1 - progress));
        }
        handle = window.requestAnimFrame(draw);
    }
}

function showPage() {
    svgs.forEach(function (el) {
        el.classList.add('hide');
    });
    hidden.forEach(function (el) {
        el.classList.remove('hide')
        el.classList.add('show')
    });
}

function circlePath(cx, cy, r) {
    return 'M ' + cx + ' ' + cy + ' m -' + r + ', 0 a ' + r + ',' + r + ' 0 1,0 ' + (r * 2) + ',0 a ' + r + ',' + r + ' 0 1,0 -' + (r * 2) + ',0';
}


