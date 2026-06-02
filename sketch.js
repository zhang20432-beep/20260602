let stars = [];
let missiles = [];
let explosions = [];
let score = 0;
let timeLeft = 60; // 遊戲時間 60 秒
let gameState = 'playing'; // 'playing' 或 'gameOver'
let timerInterval;
let lastSpawnTime = 0; // 用於追蹤上次產生物件的時間

const colors = ['#fbf8cc', '#fde4cf', '#ffcfd2', '#f1c0e8', '#cfbaf0', '#a3c4f3', '#90dbf4', '#8eecf5', '#98f5e1', '#b9fbc0'];
const MAX_STARS = 50; // 設定星星數量的上限

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0); // 初始化畫布為黑色
  // 初始產生 20 個隨機星星
  for (let i = 0; i < 20; i++) {
    stars.push(new Star());
  }
  startTimer();
  lastSpawnTime = millis();
  noStroke();
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timeLeft = 60;
  timerInterval = setInterval(() => {
    if (gameState === 'playing') {
      timeLeft--;
      if (timeLeft <= 0) {
        gameState = 'gameOver';
      }
    }
  }, 1000);
}

function draw() {
  if (gameState === 'playing') {
    // 建立淡淡的拖影效果：用半透明黑色覆蓋
    fill(0, 40); 
    rect(0, 0, width, height);

    // 計算時間接近結束時的倍率 (最後 5 秒從 1.0 增加到 3.0)
    let speedMult = (timeLeft <= 5) ? map(timeLeft, 5, 0, 1, 3) : 1;
    // 計算生成間隔 (從 3000ms 縮短到 500ms)
    let spawnInterval = (timeLeft <= 5) ? map(timeLeft, 5, 0, 3000, 500) : 3000;

    // 動態產生物件
    if (millis() - lastSpawnTime > spawnInterval) {
      if (stars.length < MAX_STARS) {
        stars.push(new Star());
      }
      lastSpawnTime = millis();
    }

    // 最後 5 秒紅色閃爍警告
    if (timeLeft <= 5 && timeLeft > 0) {
      push();
      let alpha = map(sin(frameCount * 0.3), -1, 1, 0, 80);
      fill(255, 0, 0, alpha);
      rect(0, 0, width, height);
      pop();

      // 狂熱模式：最後 5 秒自動連續發射飛彈 (不需要點擊)
      if (frameCount % 6 === 0) { // 每 6 幀自動發射一顆
        let origin = createVector(width / 2, height / 2);
        let target = createVector(mouseX, mouseY);
        let dir = p5.Vector.sub(target, origin).normalize();
        missiles.push(new Missile(origin, dir));
      }
    }

    for (let star of stars) {
      star.update(stars, speedMult);
      star.display();
    }

    // 處理飛彈
    for (let i = missiles.length - 1; i >= 0; i--) {
      missiles[i].update();
      missiles[i].display();
      if (missiles[i].checkCollision(stars) || missiles[i].isOffScreen()) {
        missiles.splice(i, 1);
      }
    }

    // 處理爆炸效果
    for (let i = explosions.length - 1; i >= 0; i--) {
      explosions[i].update();
      explosions[i].display();
      if (explosions[i].isDead()) {
        explosions.splice(i, 1);
      }
    }

    // 繪製中央箭頭
    drawCenterArrow();
    
    // 顯示計分板與時間
    drawHUD();
  } else {
    drawGameOver();
  }
}

function drawHUD() {
  push();
  fill(255);
  textSize(24);
  textAlign(LEFT, TOP);
  text(`Score: ${score}`, 20, 20);
  text(`Time: ${timeLeft}s`, 20, 50);
  pop();
}

function drawGameOver() {
  background(0, 150);
  push();
  fill(255);
  textAlign(CENTER, CENTER);
  
  textSize(48);
  text("GAME OVER", width / 2, height / 2 - 100);
  
  textSize(32);
  text(`Final Score: ${score}`, width / 2, height / 2 - 40);
  
  // 繼續按鈕
  fill(100, 255, 100);
  rectMode(CENTER);
  rect(width / 2 - 100, height / 2 + 50, 150, 50, 10);
  fill(0);
  textSize(20);
  text("CONTINUE", width / 2 - 100, height / 2 + 50);
  
  // 結束按鈕
  fill(255, 100, 100);
  rect(width / 2 + 100, height / 2 + 50, 150, 50, 10);
  fill(0);
  text("END GAME", width / 2 + 100, height / 2 + 50);
  pop();
}

function resetGame() {
  score = 0;
  stars = [];
  missiles = [];
  explosions = [];
  for (let i = 0; i < 20; i++) {
    stars.push(new Star());
  }
  gameState = 'playing';
  lastSpawnTime = millis();
  startTimer();
}

function drawCenterArrow() {
  push();
  translate(width / 2, height / 2);
  let angle = atan2(mouseY - height / 2, mouseX - width / 2);
  rotate(angle);
  
  fill(255, 200);
  noStroke();
  // 畫一個簡潔的箭頭
  rectMode(CENTER);
  rect(0, 0, 40, 10); // 箭身
  triangle(20, -15, 20, 15, 45, 0); // 箭頭
  pop();
}

function mousePressed() {
  if (gameState === 'playing') {
    if (mouseButton === LEFT) {
      // 從中心向滑鼠方向發射飛彈
      let origin = createVector(width / 2, height / 2);
      let target = createVector(mouseX, mouseY);
      let dir = p5.Vector.sub(target, origin).normalize();
      missiles.push(new Missile(origin, dir));
    }
  } else if (gameState === 'gameOver') {
    // 檢查 Continue 按鈕點擊
    if (mouseX > width/2 - 175 && mouseX < width/2 - 25 && 
        mouseY > height/2 + 25 && mouseY < height/2 + 75) {
      resetGame();
    }
    // 檢查 End Game 按鈕點擊
    if (mouseX > width/2 + 25 && mouseX < width/2 + 175 && 
        mouseY > height/2 + 25 && mouseY < height/2 + 75) {
      remove(); // 停止 p5 並移除畫布
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

class Star {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(random(-1, 1), random(-1, 1));
    this.size = random(40, 80);
    this.color = color(random(colors));
    this.angle = 0;
    this.isScared = false;
    this.eyeSizeMult = 1;
  }

  update(others, speedMult) {
    let mouseVec = createVector(mouseX, mouseY);
    let distToMouse = p5.Vector.dist(this.pos, mouseVec);

    // 檢測滑鼠距離
    if (distToMouse < 150) {
      this.isScared = true;
      this.eyeSizeMult = lerp(this.eyeSizeMult, 1.8, 0.2);
      
      // 往外跳動離開滑鼠 (Fleeing behavior)
      let flee = p5.Vector.sub(this.pos, mouseVec);
      flee.setMag(3 * speedMult); // 逃跑速度也隨倍率增加
      this.pos.add(flee);
    } else {
      this.isScared = false;
      this.eyeSizeMult = lerp(this.eyeSizeMult, 1.0, 0.1);
      this.pos.add(p5.Vector.mult(this.vel, speedMult));
    }

    // 粒子間碰撞檢查
    this.checkCollision(others);

    // 邊界碰撞處理
    if (this.pos.x < 0 || this.pos.x > width) this.vel.x *= -1;
    if (this.pos.y < 0 || this.pos.y > height) this.vel.y *= -1;
    
    // 稍微旋轉增加動感
    this.angle += 0.01;
  }

  // 新增碰撞反彈邏輯
  checkCollision(others) {
    for (let other of others) {
      if (other === this) continue;
      
      let d = p5.Vector.dist(this.pos, other.pos);
      let minDist = (this.size + other.size) * 0.45; // 碰撞半徑

      if (d < minDist) {
        // 計算碰撞後的反彈方向 (簡單的彈性碰撞模擬)
        let angle = atan2(this.pos.y - other.pos.y, this.pos.x - other.pos.x);
        let targetX = other.pos.x + cos(angle) * minDist;
        let targetY = other.pos.y + sin(angle) * minDist;
        
        // 推開彼此以防卡住
        let ax = (targetX - this.pos.x) * 0.05;
        let ay = (targetY - this.pos.y) * 0.05;
        this.vel.x += ax;
        this.vel.y += ay;
        other.vel.x -= ax;
        other.vel.y -= ay;
      }
    }
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);

    // 1. 繪製圓弧星星主體
    fill(this.color);
    this.drawRoundedStar(0, 0, this.size, this.size / 2.2, 5);

    // 計算眼球旋轉（對應滑鼠位置）
    // 因為父層旋轉了，所以滑鼠位置需要反向旋轉計算
    let dx = mouseX - this.pos.x;
    let dy = mouseY - this.pos.y;
    let angleToMouse = atan2(dy, dx) - this.angle;

    // 2. 繪製兩隻眼睛
    let eyeSpacing = this.size * 0.25;
    let eyeY = -this.size * 0.1;
    this.drawEye(-eyeSpacing, eyeY, angleToMouse);
    this.drawEye(eyeSpacing, eyeY, angleToMouse);

    // 3. 繪製嘴巴
    fill(0);
    if (this.isScared) {
      // 驚嚇的圓形嘴巴
      ellipse(0, this.size * 0.25, this.size * 0.2, this.size * 0.25);
    } else {
      // 平時的微笑弧線
      noFill();
      stroke(0);
      strokeWeight(2);
      arc(0, this.size * 0.15, this.size * 0.3, this.size * 0.2, 0, PI);
      noStroke();
    }

    pop();
  }

  // 繪製圓弧星星的自定義函數
  drawRoundedStar(x, y, radius1, radius2, npoints) {
    let angle = TWO_PI / npoints;
    let halfAngle = angle / 2.0;
    beginShape();
    // 使用 curveVertex 製作圓弧感，頭尾需多加點以閉合曲線
    for (let a = -angle; a < TWO_PI + angle; a += angle) {
      let sx = x + cos(a) * radius1;
      let sy = y + sin(a) * radius1;
      curveVertex(sx, sy);
      let cx = x + cos(a + halfAngle) * radius2;
      let cy = y + sin(a + halfAngle) * radius2;
      curveVertex(cx, cy);
    }
    endShape(CLOSE);
  }

  // 繪製眼睛與連動眼球
  drawEye(x, y, angle) {
    let baseEyeSize = this.size * 0.25 * this.eyeSizeMult;
    
    // 眼白
    fill(255);
    ellipse(x, y, baseEyeSize, baseEyeSize);
    
    // 眼球 (跟隨滑鼠)
    push();
    translate(x, y);
    rotate(angle);
    fill(0);
    let pupilSize = baseEyeSize * 0.5;
    ellipse(baseEyeSize * 0.15, 0, pupilSize, pupilSize);
    pop();
  }
}

class Missile {
  constructor(pos, dir) {
    this.pos = pos.copy();
    this.vel = dir.mult(8); // 飛彈速度
    this.size = 8;
  }

  update() {
    this.pos.add(this.vel);
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    // 螢光黃色效果
    fill(255, 255, 0);
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = 'yellow';
    ellipse(0, 0, this.size, this.size);
    pop();
  }

  isOffScreen() {
    return (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height);
  }

  checkCollision(stars) {
    for (let i = stars.length - 1; i >= 0; i--) {
      let d = p5.Vector.dist(this.pos, stars[i].pos);
      if (d < stars[i].size / 2) {
        // 產生爆炸碎片
        for (let j = 0; j < 15; j++) {
          explosions.push(new ExplosionParticle(stars[i].pos, stars[i].color));
        }
        score += 10; // 每打爆一個星星加10分
        // 移除星星並在三秒後會自動遞補（透過 setInterval）
        stars.splice(i, 1);
        return true;
      }
    }
    return false;
  }
}

class ExplosionParticle {
  constructor(pos, col) {
    this.pos = pos.copy();
    this.vel = p5.Vector.random2D().mult(random(2, 6));
    this.acc = createVector(0, 0.1); // 微弱重力
    this.lifespan = 255;
    this.color = col;
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.lifespan -= 5;
  }

  display() {
    push();
    noStroke();
    let c = color(this.color);
    fill(red(c), green(c), blue(c), this.lifespan);
    ellipse(this.pos.x, this.pos.y, 4, 4);
    pop();
  }

  isDead() {
    return this.lifespan < 0;
  }
}
