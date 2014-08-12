import BezierCurve = Bezier.BezierCurve;
module Bezier.UI {
    var drawCanvas: HTMLCanvasElement;
    var drawContext: CanvasRenderingContext2D;
    var draggedPointIndex: number = null;
    var curve = new BezierCurve();

    function drawGrid(): void {
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

    function drawPolyline(points: Point[], strokeStyle: string) {
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

    function canvasDoubleClicked(ev: PointerEvent): void {
        curve.addControlPoint(ev.offsetX, ev.offsetY)
        redraw();
    }

    function canvasMouseDown(ev: MouseEvent): void {
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

    function canvasMouseUp(ev: MouseEvent): void {
        draggedPointIndex = null;
    }

    function canvasMouseMove(ev: MouseEvent): void {
        if (draggedPointIndex != null) {
            curve.moveControlPoint(draggedPointIndex, ev.offsetX, ev.offsetY);
            redraw();
        }
    }

  

    window.onload = () => {
        drawCanvas = <HTMLCanvasElement> document.getElementById('drawCanvas');
        drawContext = drawCanvas.getContext('2d');
        drawGrid();
        drawCanvas.addEventListener('dblclick', canvasDoubleClicked);
        drawCanvas.addEventListener('mousedown', canvasMouseDown);
        drawCanvas.addEventListener('mouseup', canvasMouseUp);
        drawCanvas.addEventListener('mousemove', canvasMouseMove);
        drawCanvas.oncontextmenu = e => e.preventDefault();
    };
}