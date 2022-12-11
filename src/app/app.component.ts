import { Component, OnInit } from '@angular/core';
import 'p5';


declare let p5;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Project1';
  p5;
  isDrag;
  constructor() {
    // console.log('p5', p5);
  }

  ngOnInit(): void {
    this.createCanvas();
  }
  private createCanvas() {
    this.p5 = new p5(this.sketch);
    console.log(this.p5);
  }

  private calculateFourier(path) { 
    const result = []; 
    for (let k = 0; k < path.length; k++) { 
      result[k] = { re: 0, im: 0 }; 
      for (let n = 0; n < path.length; n++) { 
        const th = 2 * Math.PI * n * k / path.length;
        result[k].re += path[n] * Math.cos(th); 
        result[k].im -= path[n] * Math.sin(th); 
      } 
      result[k].re /= path.length; 
      result[k].im /= path.length; 
      result[k].amp = Math.sqrt(result[k].re * result[k].re + result[k].im * result[k].im); 
      result[k].phase = Math.atan2(result[k].im, result[k].re); 
      result[k].freq = k; 
    } 
    return result;
    // return result.sort((a,b) => a.amp - b.amp); 
  }

  drawWithFseries(p5Ref) {
    const pntArr = [];
    let time = 0;
    ((p) => {
      p.noFill();
      p.background(0);
      p.stroke(255);
      p.translate(200, 200);
      let [x, y] = [0, 0];
      for (let i = 0; i < 10; i++) {
        const n = 2 * i + 1;
        const prevx = x;
        const prevy = y;
        const radius = (4 / (n * p.PI)) * 70;
        x += radius * p.cos(n * time);
        y += radius * p.sin(n * time);

        p.stroke(255);
        p.circle(prevx, prevy, radius * 2);

        p.fill(255);
        p.line(prevx, prevy, x, y);

        p.noFill();
      }
      pntArr.unshift({ x: x, y: y });
      p.translate(200, 0);
      p.noFill();
      p.stroke(255);
      p.line(x - 200, y, 0, y)
      p.beginShape();
      pntArr.forEach((pnt, i) => {
        p.vertex(i * 0.5, pnt.y);
      });
      p.endShape();
      if (pntArr.length > 750) {
        pntArr.pop();
      }
      time += 0.01;
    })(p5Ref)
  }

  private sketch = (p: any) => {
    console.log('sketch', p);
    let pathX;
    let pathY;
    p.setup = () => {
      p.createCanvas(1300, 640);
      p.background(0);
      // p.angleMode(p.RADIANS);
      // tslint:disable-next-line:max-line-length
      [pathX, pathY] = (() => {
        const resX = [];
        const resY = [];
        for (let i = 0; i < 100; i++) {
          const angle = p.map(i, 0, 100, 0, p.TWO_PI);
          resX.push(10 * p.cos(angle));
          resY.push(10 * p.sin(angle));
        }
        return [resX, resY];
      })();
      [pathX, pathY] = [this.calculateFourier(pathX), this.calculateFourier(pathY)];
      // console.log(path);
    };

    let fPath = [];
    let time = 0;
    let count = 100;
    p.draw = () => {
      p.noFill();
      p.stroke(255);
      // p.background(0);
      if(!this.isDrag) {
        p.background(0);
      const pntX = this.createCycles(p, time, pathX, { posX: 900, posY: 100}, 0);
      const pntY = this.createCycles(p, time, pathY, { posX: 100, posY: 500 }, Math.PI / 2);
      // console.log(pntArrY)
      // p.translate(800, 400);
      fPath.unshift({x: pntX.x, y: pntY.y});
      p.noFill();
      p.line(pntX.x, pntY.y, pntX.x, pntX.y);
      p.line(pntX.x, pntY.y, pntY.x, pntY.y);
      p.beginShape();
      fPath.forEach((pnt, i) => {
        p.vertex(pnt.x, pnt.y);
      });
      p.endShape();
      if (fPath.length > pathX.length) {
        fPath = [];
        time = 0;
      }
      time += 2 * Math.PI / pathX.length;
      // time += 0.01;
    } else {
      p.line(mp.x, mp.y, p.mouseX, p.mouseY);
    }
    };
    let mp, mem;
    p.mousePressed = () => {
      pathX = [];
      pathY = [];
      fPath = [];
      mp = {x : p.mouseX, y: p.mouseY};
      mem = {x : p.mouseX, y: p.mouseY};
      this.isDrag = true;

      // p.translate(mp.x, mp.y)
    }

    p.mouseDragged = () => {
      pathX.push((p.mouseX - mem.x)/15);
      pathY.push((p.mouseY - mem.y)/15);
      mp.x = p.mouseX;
      mp.y = p.mouseY;
    }

    p.mouseReleased = () => {
      let skip = 2;
      pathX = pathX.filter((e, i) => !(i%skip));
      pathY = pathY.filter((e, i) => !(i%skip));
      pathX = this.calculateFourier(pathX);
      pathY = this.calculateFourier(pathY);
      fPath = [];
      time = 0;
      count = pathX.length;
      console.log(pathX, pathY);
      this.isDrag = false;
      // p.translate(-mp.x, -mp.y);
    }
  }

  createCycles(p, time, path, pos, rotation) {
    let [x, y] = [pos.posX, pos.posY];
    for (let i = 0; i < path.length; i++) {
      const prevX = x;
      const prevY = y;
      const radius = path[i].amp * 10;
      x += radius * p.cos(path[i].freq * time + path[i].phase + rotation);
      y += radius * p.sin(path[i].freq * time + path[i].phase + rotation);
      p.stroke(255);
      p.noFill();
      p.circle(prevX, prevY, radius * 2);

      p.fill(255);
      p.line(prevX, prevY, x, y);
      p.circle(x, y, 10);
    }
    // pntArr.unshift();
    return { x: x, y: y };
  }
}