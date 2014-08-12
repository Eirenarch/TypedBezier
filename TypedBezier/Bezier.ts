module Bezier {

    export class Point {
        private _x: number;
        private _y: number;

        constructor(x: number, y: number) {
            this._x = x;
            this._y = y;
            Object.freeze(this);
        }
        get x(): number {
            return this._x;
        }

        get y(): number {
            return this._y;
        }
    }

    export class BezierCurve {
        private controlPoints: Array<Point>;

        constructor(controlPoints: Array<Point> = null) {
            if (controlPoints) {
                //defensive copy of the array in case the client decides to change it.
                this.controlPoints = controlPoints.map(p => p);
            } else {
                this.controlPoints = [];
            }
        }

        getControlPoints(): Array<Point> {
            return this.controlPoints.map(p=> p);
        }

        moveControlPoint(index: number, x: number, y: number) {
            this.throwIfInvalidControlPointIndex(index);
            this.controlPoints[index] = new Point(x, y);
        }

        removeControlPoint(index: number) {
            this.throwIfInvalidControlPointIndex(index);
            this.controlPoints.splice(index, 1);
        }

        addControlPoint(x: number, y: number) {
            return this.controlPoints.push(new Point(x, y));
        }

        generateCurvePoints(step: number): Array<Point> {
            var points = new Array<Point>();
            //make sure the curve goes through the first point
            points.push(this.controlPoints[0])

            for (var t = step; t <= 1; t += step) {
                points.push(lerpCurve(this.controlPoints, t));
            }

            //make sure the curve goes through the last point
            points.push(this.controlPoints[this.controlPoints.length - 1]);

            return points;
        }

        selectControlPointIndex(x: number, y: number, offset: number = 4): number {
            for (var i = 0; i < this.controlPoints.length; i++) {
                if (x > this.controlPoints[i].x - 4
                    && x < this.controlPoints[i].x + 4
                    && y > this.controlPoints[i].y - 4
                    && y < this.controlPoints[i].y + 4) {
                    return i;
                }
            }
            return null;
        }

        private throwIfInvalidControlPointIndex(index: number) {
            if (index < 0 || index >= this.controlPoints.length) {
                throw new RangeError('invalid index');
            }
        }
    }

    function lerpCurve(inPoints: Array<Point>, t: number): Point {
        if (inPoints.length == 1) {
            return inPoints[0];
        }

        var points = new Array<Point>();

        for (var i = 0; i < inPoints.length - 1; i++) {
            var pt1 = inPoints[i];
            var pt2 = inPoints[i + 1];

            points[i] = lerpPoint(pt1, pt2, t);
        }

        return lerpCurve(points, t);
    }

    function lerpPoint(fromPoint: Point, toPoint: Point, t: number): Point {
        var s = 1.0 - t;

        var x = fromPoint.x * s + toPoint.x * t;
        var y = fromPoint.y * s + toPoint.y * t;

        return new Point(x, y);
    }
}


