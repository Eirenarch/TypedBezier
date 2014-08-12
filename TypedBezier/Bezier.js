var Bezier;
(function (Bezier) {
    var Point = (function () {
        function Point(x, y) {
            this._x = x;
            this._y = y;
            Object.freeze(this);
        }
        Object.defineProperty(Point.prototype, "x", {
            get: function () {
                return this._x;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Point.prototype, "y", {
            get: function () {
                return this._y;
            },
            enumerable: true,
            configurable: true
        });
        return Point;
    })();
    Bezier.Point = Point;

    var BezierCurve = (function () {
        function BezierCurve(controlPoints) {
            if (typeof controlPoints === "undefined") { controlPoints = null; }
            if (controlPoints) {
                //defensive copy of the array in case the client decides to change it.
                this.controlPoints = controlPoints.map(function (p) {
                    return p;
                });
            } else {
                this.controlPoints = [];
            }
        }
        BezierCurve.prototype.getControlPoints = function () {
            return this.controlPoints.map(function (p) {
                return p;
            });
        };

        BezierCurve.prototype.moveControlPoint = function (index, x, y) {
            this.throwIfInvalidControlPointIndex(index);
            this.controlPoints[index] = new Point(x, y);
        };

        BezierCurve.prototype.removeControlPoint = function (index) {
            this.throwIfInvalidControlPointIndex(index);
            this.controlPoints.splice(index, 1);
        };

        BezierCurve.prototype.addControlPoint = function (x, y) {
            return this.controlPoints.push(new Point(x, y));
        };

        BezierCurve.prototype.generateCurvePoints = function (step) {
            var points = new Array();

            //make sure the curve goes through the first point
            points.push(this.controlPoints[0]);

            for (var t = step; t <= 1; t += step) {
                points.push(lerpCurve(this.controlPoints, t));
            }

            //make sure the curve goes through the last point
            points.push(this.controlPoints[this.controlPoints.length - 1]);

            return points;
        };

        BezierCurve.prototype.selectControlPointIndex = function (x, y, offset) {
            if (typeof offset === "undefined") { offset = 4; }
            for (var i = 0; i < this.controlPoints.length; i++) {
                if (x > this.controlPoints[i].x - 4 && x < this.controlPoints[i].x + 4 && y > this.controlPoints[i].y - 4 && y < this.controlPoints[i].y + 4) {
                    return i;
                }
            }
            return null;
        };

        BezierCurve.prototype.throwIfInvalidControlPointIndex = function (index) {
            if (index < 0 || index >= this.controlPoints.length) {
                throw new RangeError('invalid index');
            }
        };
        return BezierCurve;
    })();
    Bezier.BezierCurve = BezierCurve;

    function lerpCurve(inPoints, t) {
        if (inPoints.length == 1) {
            return inPoints[0];
        }

        var points = new Array();

        for (var i = 0; i < inPoints.length - 1; i++) {
            var pt1 = inPoints[i];
            var pt2 = inPoints[i + 1];

            points[i] = lerpPoint(pt1, pt2, t);
        }

        return lerpCurve(points, t);
    }

    function lerpPoint(fromPoint, toPoint, t) {
        var s = 1.0 - t;

        var x = fromPoint.x * s + toPoint.x * t;
        var y = fromPoint.y * s + toPoint.y * t;

        return new Point(x, y);
    }
})(Bezier || (Bezier = {}));
var BezierCurve = Bezier.BezierCurve;
var Bezier;
(function (Bezier) {
    (function (UI) {
        var drawCanvas;
        var drawContext;
        var draggedPointIndex = null;
        var curve = new Bezier.BezierCurve();

        function drawGrid() {
            var width = drawCanvas.width;
            var height = drawCanvas.height;

            if (width == 0 || height == 0) {
                return;
            }

            drawContext.clearRect(0, 0, width, height);

            //draw X axis
            drawContext.beginPath();
            drawContext.moveTo(0, height / 2);
            drawContext.lineTo(width, height / 2);
            drawContext.lineWidth = 2;
            drawContext.strokeStyle = '#888888';
            drawContext.stroke();
            drawContext.closePath();

            //draw Y axis
            drawContext.beginPath();
            drawContext.moveTo(width / 2, 0);
            drawContext.lineTo(width / 2, height);
            drawContext.lineWidth = 2;
            drawContext.strokeStyle = '#888888';
            drawContext.stroke();
            drawContext.closePath();

            //draw horizontal lines
            var xStep = width / 8;
            for (var i = xStep; i <= width; i += xStep) {
                if (i != width / 2) {
                    drawContext.beginPath();
                    drawContext.moveTo(i, 0);
                    drawContext.lineTo(i, height);
                    drawContext.lineWidth = 1;
                    drawContext.strokeStyle = '#888888';
                    drawContext.stroke();
                    drawContext.closePath();
                }
            }

            //draw vertical lines
            var yStep = height / 8;
            for (var i = yStep; i <= height; i += yStep) {
                if (i != height / 2) {
                    drawContext.beginPath();
                    drawContext.moveTo(0, i);
                    drawContext.lineTo(width, i);
                    drawContext.lineWidth = 1;
                    drawContext.strokeStyle = '#888888';
                    drawContext.stroke();
                    drawContext.closePath();
                }
            }
        }

        function drawControlPoints() {
            var controlPoints = curve.getControlPoints();
            for (var i = 0; i < controlPoints.length; i++) {
                var radius = 4;
                drawContext.beginPath();
                drawContext.arc(controlPoints[i].x, controlPoints[i].y, radius, 0, 2 * Math.PI, false);
                drawContext.fillStyle = 'green';
                drawContext.fill();
                drawContext.lineWidth = 1;
                drawContext.strokeStyle = 'green';
                drawContext.stroke();
            }
        }

        function drawControlPolygon() {
            var controlPoints = curve.getControlPoints();
            drawPolyline(controlPoints, 'blue');
        }

        function drawCurve() {
            var curvePoints = curve.generateCurvePoints(0.01);
            drawPolyline(curvePoints, 'red');
        }

        function drawPolyline(points, strokeStyle) {
            if (points.length > 1) {
                drawContext.beginPath();
                drawContext.moveTo(points[0].x, points[0].y);
                for (var i = 1; i < points.length; i++) {
                    drawContext.lineTo(points[i].x, points[i].y);
                }

                drawContext.lineWidth = 1;
                drawContext.strokeStyle = strokeStyle;
                drawContext.stroke();
                drawContext.closePath();
            }
        }

        function redraw() {
            drawGrid();
            drawControlPolygon();
            drawControlPoints();
            drawCurve();
        }

        function canvasDoubleClicked(ev) {
            normalizeOffset(ev);
            curve.addControlPoint(ev.offsetX, ev.offsetY);
            redraw();
        }

        function canvasMouseDown(ev) {
            normalizeOffset(ev);
            if (ev.button == 0) {
                draggedPointIndex = curve.selectControlPointIndex(ev.offsetX, ev.offsetY);
            } else if (ev.button == 2) {
                var pointToRemoveIndex = curve.selectControlPointIndex(ev.offsetX, ev.offsetY);
                if (pointToRemoveIndex !== null) {
                    curve.removeControlPoint(pointToRemoveIndex);
                }
            }
            redraw();
        }

        function canvasMouseUp(ev) {
            draggedPointIndex = null;
        }

        function canvasMouseMove(ev) {
            normalizeOffset(ev);
            if (draggedPointIndex != null) {
                curve.moveControlPoint(draggedPointIndex, ev.offsetX, ev.offsetY);
                redraw();
            }
        }

        //dirty polyfill I copied from http://www.jacklmoore.com/notes/mouse-position/ because apparently IE is the only browser that follows standards
        function normalizeOffset(e) {
            if (!e.hasOwnProperty('offsetX')) {
                var target = e.target || e.srcElement, style = target.currentStyle || window.getComputedStyle(target, null), borderLeftWidth = parseInt(style['borderLeftWidth'], 10), borderTopWidth = parseInt(style['borderTopWidth'], 10), rect = target.getBoundingClientRect(), offsetX = e.clientX - borderLeftWidth - rect.left, offsetY = e.clientY - borderTopWidth - rect.top;

                e.offsetX = offsetX;
                e.offsetY = offsetY;
            }
        }
        ;

        window.onload = function () {
            drawCanvas = document.getElementById('drawCanvas');
            drawContext = drawCanvas.getContext('2d');
            drawGrid();
            drawCanvas.addEventListener('dblclick', canvasDoubleClicked);
            drawCanvas.addEventListener('mousedown', canvasMouseDown);
            drawCanvas.addEventListener('mouseup', canvasMouseUp);
            drawCanvas.addEventListener('mousemove', canvasMouseMove);
            drawCanvas.oncontextmenu = function (e) {
                return e.preventDefault();
            };
        };
    })(Bezier.UI || (Bezier.UI = {}));
    var UI = Bezier.UI;
})(Bezier || (Bezier = {}));
/// <reference path="Bezier.ts" />
/// <reference path="app.ts" />
//# sourceMappingURL=Bezier.js.map
