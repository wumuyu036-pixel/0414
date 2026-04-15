// ================= p5.js 动态花朵引擎 =================
let p5FlowerType = 'Sunflower'; 
let p5Mood = 1.0;                
let targetP5Mood = 1.0;
let myP5Flower;

// 💡 初始能量 95 用于快速测试阶段进化
let flowerEnergy = 95; 
let flowerStage = 0;   
let totalEnergyHistory = 95; 

class FallingParticle {
    constructor(x, y, type, baseColor) {
        this.x = x; this.y = y; this.type = type; this.col = baseColor;
        this.vx = random(-1.5, 1.5); this.vy = random(0.5, 2);
        this.rot = random(TWO_PI); this.rotSpeed = random(-0.05, 0.05);
        this.life = 255; this.scale = random(0.6, 1);
    }
    update() {
        this.x += this.vx; this.y += this.vy; this.vy += 0.02; 
        this.vx += sin(frameCount * 0.05) * 0.05; 
        this.rot += this.rotSpeed; this.life -= 2.5; 
    }
    display() {
        push(); translate(this.x, this.y); rotate(this.rot); scale(this.scale);
        let c = color(this.col.levels[0], this.col.levels[1], this.col.levels[2], this.life);
        fill(c); noStroke();
        if (this.type === 'leaf') ellipse(0, 0, 20, 8);
        else ellipse(0, 0, 12, 6); 
        pop();
    }
}

class RealFlower2D {
    constructor(type, initialHealth) {
        this.type = type; this.health = initialHealth; this.energy = 0; this.stage = 0; 
        this.lerpHeight = 0; this.lerpPetal = 0; this.particles = [];
        this.leafNodes = []; this.flowerNode = {x: 0, y: 0};
    }
    update() {
        let targetH = 0;
        if(this.stage == 1) targetH = 25;
        if(this.stage == 2) targetH = 60;
        if(this.stage >= 3) targetH = 100; 
        
        this.lerpHeight = lerp(this.lerpHeight, targetH, 0.05);
        if(this.stage >= 4) this.lerpPetal = lerp(this.lerpPetal, 1.0, 0.05);
        this.health = lerp(this.health, targetP5Mood, 0.02);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i]; p.update();
            if (p.life <= 0 || p.y > 50) this.particles.splice(i, 1);
        }

        if (this.health < 0.6 && frameCount % 60 === 0) {
            if (this.stage >= 2 && this.stage < 4) {
                if (random() < 0.3 && this.leafNodes.length > 0) {
                    let node = random(this.leafNodes);
                    let deadLeafCol = lerpColor(color(200, 110, 40), color(34, 139, 34), this.health);
                    this.particles.push(new FallingParticle(node.x, node.y, 'leaf', deadLeafCol));
                }
            } else if (this.stage >= 4) {
                if (random() < 0.5) {
                    let petalCol = this.getPetalColor();
                    this.particles.push(new FallingParticle(this.flowerNode.x, this.flowerNode.y, 'petal', petalCol));
                }
                if (random() < 0.1 && this.leafNodes.length > 0) {
                    let node = random(this.leafNodes);
                    let deadLeafCol = lerpColor(color(200, 110, 40), color(34, 139, 34), this.health);
                    this.particles.push(new FallingParticle(node.x, node.y, 'leaf', deadLeafCol));
                }
            }
        }
    }
    getPetalColor() {
        let deadTint = color(150, 140, 130);
        if (this.type === 'Sunflower') return lerpColor(deadTint, color(255, 210, 0), this.health);
        if (this.type === 'Rose') return lerpColor(deadTint, color(220, 20, 60), this.health);
        if (this.type === 'Carnation') return lerpColor(deadTint, color(255, 182, 193), this.health);
        if (this.type === 'Daisy') return lerpColor(deadTint, color(255, 255, 255), this.health);
        if (this.type === 'Lily') return lerpColor(deadTint, color(255, 240, 245), this.health);
        if (this.type === 'Jasmine') return lerpColor(deadTint, color(255, 255, 240), this.health);
        if (this.type === 'Iris') return lerpColor(deadTint, color(138, 43, 226), this.health);
        if (this.type === 'Orchid') return lerpColor(deadTint, color(218, 112, 214), this.health);
        if (this.type === 'BabysBreath') return lerpColor(deadTint, color(224, 255, 255), this.health);
        return lerpColor(deadTint, color(255, 210, 0), this.health);
    }
    display() {
        for (let p of this.particles) p.display();
        if (this.stage === 0) {
            fill(80, 50, 30); noStroke();
            ellipse(0, 0, 10 + this.energy/15, 8 + this.energy/20);
            return;
        }
        this.leafNodes = []; 
        let segments = 10; let segLen = this.lerpHeight / segments;
        let currentX = 0; let currentY = 0; let droopFactor = (1 - this.health) * 12;

        for (let i = 0; i < segments; i++) {
            let hRatio = i / segments;
            let wind = sin(frameCount * (0.03 * this.health + 0.01) + i * 0.2) * (hRatio * 2);
            let stemColor = lerpColor(color(140, 110, 60), color(50, 180, 50), this.health);
            let nextX = currentX + wind + (droopFactor * hRatio);
            let nextY = currentY - segLen;

            stroke(stemColor);
            strokeWeight(map(hRatio, 0, 1, 6, 2) * (this.stage >= 3 ? 1.2 : 0.8));
            strokeCap(ROUND);
            line(currentX, currentY, nextX, nextY);

            noStroke();
            if (this.stage == 1 && i == segments - 1) this.drawSeedLeaves(nextX, nextY);
            if (this.stage >= 2 && (i == 4 || i == 7)) {
                let side = i % 2 == 0 ? 1 : -1;
                this.drawTrueLeaf(side, hRatio, nextX, nextY);
                this.leafNodes.push({x: nextX, y: nextY});
            }
            currentX = nextX; currentY = nextY;
        }
        this.flowerNode = {x: currentX, y: currentY};

        if (this.stage == 3) {
            let budCol = lerpColor(color(130, 110, 50), color(40, 140, 40), this.health);
            fill(budCol); noStroke();
            let budScale = map(this.health, 0, 1, 0.6, 1);
            push(); translate(currentX, currentY); rotate((1-this.health) * HALF_PI);
            ellipse(0, 0, (12 + sin(frameCount*0.05)*1) * budScale, 16 * budScale);
            pop();
        } else if (this.stage >= 4) {
            push(); translate(currentX, currentY);
            let healthScale = map(this.health, 0, 1, 0.6, 1.0); 
            rotate((1-this.health) * PI * 0.4); 
            scale(this.lerpPetal * healthScale * 0.8); 
            this.drawFlowerHead();
            pop();
        }
    }
    drawSeedLeaves(x, y) {
        push(); translate(x, y);
        let leafCol = lerpColor(color(200, 150, 50), color(150, 220, 50), this.health);
        fill(leafCol);
        for (let side of [-1, 1]) {
            push(); rotate(QUARTER_PI * side + (1-this.health)*HALF_PI*side); ellipse(6 * side, -3, 10, 5); pop();
        }
        pop();
    }
    drawTrueLeaf(side, h, x, y) {
        push(); translate(x, y);
        let leafCol = lerpColor(color(210, 120, 50), color(34, 139, 34), this.health); fill(leafCol);
        let droopAngle = (1 - this.health) * HALF_PI * 1.5;
        rotate((PI/4 + sin(frameCount*0.02 + h)*0.1) * side + droopAngle * side);
        let shrink = map(this.health, 0, 1, 0.4, 1.0);
        ellipse(side * 14 * shrink, 0, 25 * shrink, 9 * shrink);
        pop();
    }
    drawFlowerHead() {
        noStroke(); let pCol = this.getPetalColor();
        if (this.type === 'Sunflower') {
            fill(pCol);
            for(let i=0; i<14; i++) {
                push(); rotate(TWO_PI/14*i + frameCount*0.002); 
                let pWidth = map(this.health, 0, 1, 10, 14); let pHeight = map(this.health, 0, 1, 3, 6);
                ellipse(pWidth, 0, pWidth, pHeight); pop();
            }
            fill(lerpColor(color(40, 20, 10), color(60, 30, 10), this.health)); ellipse(0, 0, 18, 18);
        } else if (this.type === 'Rose') {
            fill(pCol);
            for(let i=0; i<5; i++) { let offset = sin(frameCount*0.02 + i) * 1; ellipse(offset, 0, 25 - i*4, 20 - i*3); }
        } else { // Generic
            fill(pCol);
            for(let i=0; i<5; i++) { push(); rotate(TWO_PI/5*i); ellipse(12, 0, 20, 8); pop(); }
            fill(lerpColor(color(180, 150, 80), color(255, 200, 50), this.health)); ellipse(0, 0, 6, 6);
        }
    }
}

function setup() {
    let canvas = createCanvas(180, 180);
    canvas.parent(document.getElementById('center-plant')); 
    myP5Flower = new RealFlower2D(p5FlowerType, p5Mood);
}

function draw() {
    clear(); 
    myP5Flower.type = p5FlowerType;
    myP5Flower.stage = flowerStage;
    myP5Flower.energy = flowerEnergy;
    myP5Flower.health = p5Mood;
    
    p5Mood = lerp(p5Mood, targetP5Mood, 0.05);

    push();
    translate(90, 150);
    noStroke(); fill(40, 30, 20); ellipse(0, 10, 60, 15);
    fill(60, 45, 35); ellipse(0, 5, 50, 10);
    myP5Flower.update();
    myP5Flower.display();
    pop();

    if (isPetVisible) {
        let petCanvas = document.getElementById('pet-canvas');
        if (!petCanvas && pipWindow) {
            petCanvas = pipWindow.document.getElementById('pet-canvas');
        }
        if (petCanvas) {
            let pCtx = petCanvas.getContext('2d');
            let sourceCanvas = document.querySelector('#center-plant canvas');
            if (sourceCanvas) {
                pCtx.clearRect(0, 0, petCanvas.width, petCanvas.height);
                pCtx.drawImage(sourceCanvas, 0, 0, sourceCanvas.width, sourceCanvas.height, 0, 0, petCanvas.width, petCanvas.height);
            }
        }
    }
}

// ================= 账号体系与全局逻辑 =================
let currentUser = null; 

function getTodayString() { return `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`; }

function handleLogin() {
    const username = document.getElementById('login-username').value.trim();
    if (!username) { alert("请输入账号或昵称！"); return; }
    currentUser = username; document.getElementById('display-name').innerText = currentUser;
    const hasFinishedSetup = localStorage.getItem('setupCompleted_' + currentUser);
    if (hasFinishedSetup === 'true') goToPage('7'); else goToPage('page-q1');
}

function handleGuestLogin() {
    currentUser = '游客玩家'; document.getElementById('display-name').innerText = currentUser; goToPage('page-q1');
}

function logout() {
    currentUser = null; document.getElementById('sidebar-overlay').classList.remove('active'); document.getElementById('sidebar-menu').classList.remove('active'); document.getElementById('login-username').value = ''; document.getElementById('login-password').value = ''; goToPage('login'); 
}

function goToPage(pageId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(pageId.startsWith('page-') ? pageId : 'page-' + pageId).classList.add('active');
    if (pageId === '7' && currentUser && currentUser !== 'guest') { localStorage.setItem('setupCompleted_' + currentUser, 'true'); }
    updateProgressRing(); 
}

// ================= 15 题问卷测试逻辑 =================
let testAnswers = {}; 

function selectSingleOption(button, qId, val, nextPage) {
    testAnswers[qId] = val; 
    const screen = button.closest('.screen'); screen.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected')); button.classList.add('selected');
    const contBtn = screen.querySelector('.continue-btn'); contBtn.disabled = false; contBtn.classList.add('active');
    if (nextPage !== 'calculateResult') { contBtn.setAttribute('onclick', `goToPage('${nextPage}')`); }
}

function selectMBTI(circle) {
    const container = circle.closest('.mbti-circles');
    if(container) {
        container.querySelectorAll('.mbti-circle').forEach(c => c.classList.remove('selected')); circle.classList.add('selected');
        const qId = circle.closest('.mbti-question').getAttribute('data-dim'); testAnswers[qId] = parseInt(circle.getAttribute('data-val')); 
        container.setAttribute('data-selected-val', 'true');
    }
    let allAnswered = true;
    document.querySelectorAll('.mbti-question').forEach(q => { if (!q.querySelector('.mbti-circles').getAttribute('data-selected-val')) allAnswered = false; });
    if (allAnswered) { document.getElementById('mbti-submit-btn').disabled = false; document.getElementById('mbti-submit-btn').classList.add('active'); }
}

function calculateAndShowMBTI() {
    let q1_6_score = (testAnswers.q1||1) + (testAnswers.q2||1) + (testAnswers.q3||1) + (testAnswers.q4||1) + (testAnswers.q5||1) + (testAnswers.q6||1);
    const mapMbtiScore = (val) => { if (val === 2) return 1; if (val === 1) return 1.5; if (val === 0) return 3; if (val === -1) return 2.5; if (val === -2) return 2; return 3; };
    let totalInfoScore = Math.round(q1_6_score + mapMbtiScore(testAnswers.q7||0) + mapMbtiScore(testAnswers.q11||0)); 
    
    let infoType = "";
    if (totalInfoScore >= 8 && totalInfoScore <= 14) infoType = "现实稳重型";
    else if (totalInfoScore >= 15 && totalInfoScore <= 20) infoType = "温柔细腻型";
    else infoType = "理想独特型"; 
    
    let mbti = "";
    mbti += (testAnswers.q7||0) >= 0 ? "E" : "I"; 
    mbti += (testAnswers.q8||0) >= 0 ? "S" : "N"; 
    let tScore = ((testAnswers.q9||0) > 0 ? 1 : 0) + ((testAnswers.q12||0) > 0 ? 1 : 0);
    let fScore = ((testAnswers.q9||0) < 0 ? 1 : 0) + ((testAnswers.q12||0) < 0 ? 1 : 0);
    mbti += tScore >= fScore ? "T" : "F";
    mbti += (testAnswers.q10||0) >= 0 ? "J" : "P";

    let biasSum = (testAnswers.q13||0) + (testAnswers.q14||0) + (testAnswers.q15||0);
    let biasType = "";
    if (biasSum > 0) biasType = "理性主导"; else if (biasSum < 0) biasType = "感性主导"; else biasType = "平衡型";

    let flowerName = ""; let flowerDesc = "";
    if (infoType === "现实稳重型") {
        if (biasType === "理性主导") { flowerName = "🌻 向日葵"; flowerDesc = "性格踏实可靠，做事有条理，情绪稳定，给人强烈安全感。"; }
        else if (biasType === "感性主导") { flowerName = "🌸 康乃馨"; flowerDesc = "温柔体贴、擅长照顾别人，重视亲情友情，内心柔软但很坚韧。"; }
        else { flowerName = "🌼 雏菊"; flowerDesc = "简单纯粹、随和自然，不纠结、不较真。适应力强，和谁都能相处舒服。"; }
    } else if (infoType === "温柔细腻型") {
        if (biasType === "理性主导") { flowerName = "🌹 玫瑰"; flowerDesc = "外表优雅有态度，内心有原则，外冷内热。自带气场，温柔但不软弱。"; }
        else if (biasType === "感性主导") { flowerName = "🌷 百合"; flowerDesc = "气质干净通透，情感细腻丰富，追求和谐与美好。共情力强，自带温柔光环。"; }
        else { flowerName = "🌿 茉莉"; flowerDesc = "清淡雅致、内敛舒服，不张扬却让人念念不忘。安静但有力量。"; }
    } else {
        if (biasType === "理性主导") { flowerName = "💜 鸢尾"; flowerDesc = "思维清晰、创意独特，理想与理性兼备。不随波逐流，有自己的坚持和审美。"; }
        else if (biasType === "感性主导") { flowerName = "🦋 蝴蝶兰"; flowerDesc = "浪漫敏感、想象力丰富，情感细腻且审美高级。内心世界丰富，温柔又有艺术气质。"; }
        else { flowerName = "✨ 满天星"; flowerDesc = "自由灵动、包容多元，喜欢新鲜感，不愿被定义。永远保持好奇。"; }
    }
    
    // 传递类型给 P5 画布
    const p5Map = {"🌻 向日葵": "Sunflower", "🌸 康乃馨": "Carnation", "🌼 雏菊": "Daisy", "🌹 玫瑰": "Rose", "🌷 百合": "Lily", "🌿 茉莉": "Jasmine", "💜 鸢尾": "Iris", "🦋 蝴蝶兰": "Orchid", "✨ 满天星": "BabysBreath"};
    p5FlowerType = p5Map[flowerName] || 'Sunflower';
    
    // 强制重置为种子状态，初始能量0
    flowerStage = 0; flowerEnergy = 0; targetP5Mood = 1.0;

    document.getElementById('result-flower-name').innerText = flowerName;
    document.getElementById('result-mbti-letters').innerText = `(${mbti} · ${infoType} · ${biasType})`;
    document.getElementById('result-flower-desc').innerText = flowerDesc;
    goToPage('page-result');
}
function calculateResult() { calculateAndShowMBTI(); }

function closeCalendarDrawer(e) {
    if(e) e.stopPropagation();
    document.getElementById('calendar-overlay').classList.remove('active');
    document.getElementById('calendar-drawer').classList.remove('show');
}

// ================= Tab切换与日历呼出 =================
function switchTab(pageId) {
    goToPage(pageId.replace('page-', ''));
    if(pageId === 'page-growth') setTimeout(() => { if(!growthChartInstance) initGrowthChart(); }, 100);
}
function switchTabAndOpenCalendar() {
    switchTab('page-7'); renderCalendar(); setTimeout(() => { 
        // 联动开启日历遮罩层
        document.getElementById('calendar-overlay').classList.add('active');
        document.getElementById('calendar-drawer').classList.add('show'); 
    }, 50);
}

// ================= 签到与物资系统 =================
let resources = { water: 0, light: 0, fertilizer: 0 };
function openCheckinModal() {
    const todayStr = getTodayString(); const storageKey = 'lastCheckin_' + (currentUser || 'guest');
    const lastCheckin = localStorage.getItem(storageKey); const btn = document.getElementById('checkin-submit-btn'); const d1 = document.getElementById('checkin-day-1');
    if (lastCheckin === todayStr) { btn.innerText = "今日已签到"; btn.disabled = true; btn.style.backgroundColor = "#cccccc"; d1.innerHTML = '第1天<br>✔️'; d1.classList.add('checked'); } 
    else { btn.innerText = "立即签到"; btn.disabled = false; btn.style.backgroundColor = "#48cae4"; d1.innerHTML = '第1天<br>+物资'; d1.classList.remove('checked'); }
    document.getElementById('checkin-modal').classList.add('active');
}
function closeCheckinModal(e) { 
    if(e) e.stopPropagation();
    document.getElementById('checkin-modal').classList.remove('active'); 
}
function submitCheckin() {
    const todayStr = getTodayString(); const storageKey = 'lastCheckin_' + (currentUser || 'guest');
    if (localStorage.getItem(storageKey) === todayStr) return;
    resources.water += 2; resources.light += 1; resources.fertilizer += 2;
    updateResourceBadges(); localStorage.setItem(storageKey, todayStr); closeCheckinModal();
    setTimeout(() => alert("签到成功！\n获得水分 x2, 光照 x1, 肥料 x2"), 200);
}

function updateResourceBadges() {
    const wBadge = document.getElementById('badge-water'); const lBadge = document.getElementById('badge-light'); const fBadge = document.getElementById('badge-fert');
    wBadge.style.display = resources.water > 0 ? 'flex' : 'none'; wBadge.innerText = resources.water;
    lBadge.style.display = resources.light > 0 ? 'flex' : 'none'; lBadge.innerText = resources.light;
    fBadge.style.display = resources.fertilizer > 0 ? 'flex' : 'none'; fBadge.innerText = resources.fertilizer;
    updateDesktopPet(); 
}

// ================= 画中画桌宠系统 =================
let isPetVisible = false;
let pipWindow = null;

async function toggleDesktopPet() {
    const pet = document.getElementById('desktop-pet');
    if (isPetVisible) {
        if (pipWindow) { pipWindow.close(); } 
        else { pet.style.display = 'none'; isPetVisible = false; }
        return;
    }

    isPetVisible = true;
    updateDesktopPet();

    if ('documentPictureInPicture' in window) {
        try {
            pipWindow = await documentPictureInPicture.requestWindow({ width: 160, height: 160 });
            [...document.styleSheets].forEach((styleSheet) => {
                try { const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join(''); const style = document.createElement('style'); style.textContent = cssRules; pipWindow.document.head.appendChild(style); } 
                catch (e) { const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = styleSheet.href; pipWindow.document.head.appendChild(link); }
            });

            pipWindow.document.body.style.margin = '0'; pipWindow.document.body.style.display = 'flex'; pipWindow.document.body.style.justifyContent = 'center'; pipWindow.document.body.style.alignItems = 'center'; pipWindow.document.body.style.height = '100vh'; pipWindow.document.body.style.background = 'transparent'; 
            pet.style.position = 'relative'; pet.style.bottom = 'auto'; pet.style.right = 'auto'; pet.style.display = 'flex'; pet.style.boxShadow = 'none'; 
            pipWindow.document.body.appendChild(pet);

            pipWindow.addEventListener("pagehide", () => {
                const appContainer = document.getElementById('app-container');
                pet.style.position = 'fixed'; pet.style.bottom = '30px'; pet.style.right = '30px'; pet.style.display = 'none'; pet.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
                appContainer.appendChild(pet); isPetVisible = false; pipWindow = null;
            });
            return; 
        } catch (error) { console.warn("画中画模式被阻止或不支持，降级为网页内悬浮", error); }
    }

    pet.style.position = 'fixed'; pet.style.bottom = '30px'; pet.style.right = '30px'; pet.style.display = 'flex';
}

function updateDesktopPet() {
    if (!isPetVisible) return;
    let pet = document.getElementById('desktop-pet');
    if (!pet && pipWindow) pet = pipWindow.document.getElementById('desktop-pet');
    if (!pet) return;

    const ring = pet.querySelector('#pet-ring-fill');
    const levelText = pet.querySelector('#pet-level');
    const waterText = pet.querySelector('#pet-water');

    const pCanvas = pet.querySelector('#pet-canvas');
    if(pCanvas && pCanvas.width !== 140) {
        pCanvas.width = 140;
        pCanvas.height = 140;
    }

    const stages = ['🌱', '🌿', '🪴', '🌸', '🌳'];
    levelText.innerText = `Lv.${flowerStage}`;
    waterText.innerText = resources.water;

    const circum = 282.7;
    const progressPercent = flowerEnergy / 100;
    ring.style.strokeDashoffset = circum - (progressPercent * circum);
}

// ================= 💡 能量与打卡系统 =================
// 测试面板能量调整
function debugAddEnergy(amount) {
    flowerEnergy = Math.max(0, Math.min(100, flowerEnergy + amount));
    updateProgressRing();
    if(flowerEnergy >= 100) checkFlowerEvolution();
}
function debugSetEnergy(amount) {
    flowerEnergy = amount;
    updateProgressRing();
    if(flowerEnergy >= 100) checkFlowerEvolution();
}

let isClockingIn = false; let clockinStartTime = 0; let clockinTimerInterval = null; let todayClockinSeconds = 0; let lastProcessedHour = 0; 

function formatTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
}

function updateClockinDisplay() {
    let currentTotal = todayClockinSeconds;
    if (isClockingIn) currentTotal += Math.floor((Date.now() - clockinStartTime) / 1000);
    if (currentTotal >= 32400) { currentTotal = 32400; if (isClockingIn) toggleClockin(); }
    document.getElementById('clockin-timer').innerText = formatTime(currentTotal);
    document.getElementById('clockin-today-hours').innerText = (currentTotal / 3600).toFixed(1);
    
    let currentHour = Math.floor(currentTotal / 3600);
    if (currentHour > lastProcessedHour) {
        let hoursToReward = currentHour - lastProcessedHour;
        for(let i=0; i<hoursToReward; i++) giveHourlyReward();
        lastProcessedHour = currentHour;
    }
}

function toggleClockin() {
    const btn = document.getElementById('clockin-action-btn');
    if (!isClockingIn) {
        if (todayClockinSeconds >= 32400) { alert("今日9小时打卡上限已满，请明天再来吧！"); return; }
        isClockingIn = true; clockinStartTime = Date.now();
        clockinTimerInterval = setInterval(updateClockinDisplay, 1000);
        btn.innerHTML = `<span id="btn-icon">⏸</span> 结束打卡`; btn.classList.add('running');
    } else {
        isClockingIn = false; clearInterval(clockinTimerInterval);
        todayClockinSeconds += Math.floor((Date.now() - clockinStartTime) / 1000);
        btn.innerHTML = `<span id="btn-icon">▶</span> 开始打卡`; btn.classList.remove('running');
        document.getElementById('stat-clockin').innerText = (todayClockinSeconds / 3600).toFixed(1);
    }
}

function debugAddHour() {
    if (todayClockinSeconds >= 32400) { alert("今日9小时打卡上限已满！"); return; }
    todayClockinSeconds += 3600; if (isClockingIn) clockinStartTime = Date.now(); 
    updateClockinDisplay(); document.getElementById('stat-clockin').innerText = (todayClockinSeconds / 3600).toFixed(1);
}

function giveHourlyReward() {
    let energyGained = 1; 
    debugAddEnergy(energyGained);
    totalEnergyHistory += energyGained;
    
    let gotItem = "";
    if (Math.random() < 0.5) {
        const items = ['water', 'light', 'fertilizer']; const itemNames = {'water': '水分', 'light': '光照', 'fertilizer': '肥料'};
        const dropped = items[Math.floor(Math.random() * items.length)];
        resources[dropped]++; gotItem = itemNames[dropped]; updateResourceBadges();
    }
    let msg = `⏰ 打卡满1小时！\n花朵自动汲取了 ${energyGained} 点能量！`;
    if (gotItem) msg += `\n🎁 幸运降临，获得了 1 份 [${gotItem}]！`;
    alert(msg);
}

function useResource(type) {
    if (resources[type] > 0) {
        resources[type]--; updateResourceBadges(); 
        totalEnergyHistory += 1;
        debugAddEnergy(1); // 消耗物资增加1点能量
    } else { alert('该养护物资不足，请先去左上角签到获取哦！'); }
}

function checkFlowerEvolution() {
    flowerEnergy = 0; flowerStage++;
    if (flowerStage >= 4) flowerStage = 4; // 阶段封顶
    const stages = ['🌱', '🌿', '🪴', '🌸', '🌳'];
    document.getElementById('stat-stage').innerText = stages[flowerStage];
    setTimeout(() => alert(`🎉 恭喜！植物吸收满100能量，升级到了新阶段！\n你已经解锁了新的形态。`), 300);
}

function updateProgressRing() {
    const ring = document.getElementById('flower-ring');
    const tracker = document.getElementById('flower-tracker');
    const flowerIcon = document.getElementById('flower-icon');
    
    // 圆环半径 130 (根据CSS), 周长约 816.8
    const circumference = 816; 
    const progressPercent = flowerEnergy / 100;
    const offset = circumference - (progressPercent * circumference);
    if(ring) ring.style.strokeDashoffset = offset;
    
    const degrees = progressPercent * 360;
    if(tracker) tracker.style.transform = `rotate(${degrees}deg)`;
    if(flowerIcon) flowerIcon.style.transform = `translate(-50%, -50%) rotate(-${degrees}deg)`; // 保持表情不倒立
    
    updateDesktopPet(); 
}

// ================= 生长记录图表 (Chart.js) =================
let growthChartInstance = null;
const mockChartData = {
    daily: { labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], barData: [15, 20, 12, 35, 10, 45, 25], lineData: [1.5, 2.0, 1.2, 3.5, 1.0, 4.5, 2.5] },
    monthly: { labels: ['一月', '二月', '三月', '四月', '五月', '六月'], barData: [320, 450, 280, 500, 390, 410], lineData: [30, 42, 25, 48, 35, 38] },
    yearly: { labels: ['2023年', '2024年', '2025年', '2026年'], barData: [3500, 4200, 5100, 1500], lineData: [320, 400, 480, 120] }
};

function initGrowthChart() {
    const canvas = document.getElementById('growthChart'); if(!canvas) return; const ctx = canvas.getContext('2d');
    growthChartInstance = new Chart(ctx, {
        type: 'bar',
        data: { labels: mockChartData.daily.labels, datasets: [{ type: 'line', label: '打卡时长 (折线)', data: mockChartData.daily.lineData, borderColor: '#fada5e', backgroundColor: '#fada5e', borderWidth: 3, tension: 0.4, yAxisID: 'yLine' }, { type: 'bar', label: '获得能量 (柱状)', data: mockChartData.daily.barData, backgroundColor: '#48cae4', borderRadius: 4, yAxisID: 'yBar' }] },
        options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: { position: 'top', labels: { boxWidth: 12, usePointStyle: true } } }, scales: { x: { grid: { display: false } }, yBar: { type: 'linear', display: true, position: 'left', title: { display: true, text: '能量点数' }, grid: { borderDash: [2, 4], color: '#f0f0f0' } }, yLine: { type: 'linear', display: true, position: 'right', title: { display: true, text: '时长' }, grid: { drawOnChartArea: false } } } }
    });
}
function switchChartData(type) {
    document.querySelectorAll('.time-toggle-btn').forEach(btn => btn.classList.remove('active')); document.getElementById(`btn-chart-${type}`).classList.add('active');
    if(growthChartInstance) { growthChartInstance.data.labels = mockChartData[type].labels; growthChartInstance.data.datasets[0].data = mockChartData[type].lineData; growthChartInstance.data.datasets[1].data = mockChartData[type].barData; growthChartInstance.update(); }
}

// ================= 🔥 编辑与发布互动逻辑 🔥 =================
const profileOverlay = document.getElementById('profile-overlay');
function openProfileDrawer(drawerElement) { profileOverlay.classList.add('active'); drawerElement.classList.add('active'); }
function closeProfileDrawers() { profileOverlay.classList.remove('active'); document.querySelectorAll('.profile-drawer').forEach(d => d.classList.remove('active')); }

const genderBtns = document.querySelectorAll('.gender-btn');
genderBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        genderBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
});

let currentAvatarSeed = 'Felix'; 
let currentAvatarUrl = `url('https://api.dicebear.com/7.x/adventurer/svg?seed=Felix')`;

document.getElementById('changeAvatarBtn').addEventListener('click', () => {
    currentAvatarSeed = Math.random().toString(36).substring(7);
    currentAvatarUrl = `url('https://api.dicebear.com/7.x/adventurer/svg?seed=${currentAvatarSeed}')`;
    document.getElementById('edit-avatar-preview').style.backgroundImage = currentAvatarUrl;
});

document.getElementById('saveEditBtn').addEventListener('click', () => {
    const newName = document.getElementById('input-name').value;
    const newLocation = document.getElementById('input-location').value;
    const newBio = document.getElementById('input-bio').value;
    const newInterests = document.getElementById('input-interests').value;
    const activeGenderBtn = document.querySelector('.gender-btn.active');
    const newAge = document.getElementById('input-age').value;
    
    document.getElementById('display-avatar').style.backgroundImage = currentAvatarUrl;
    document.getElementById('display-name').innerText = newName || '未命名';
    document.getElementById('display-gender').innerText = `${activeGenderBtn.getAttribute('data-icon')} ${activeGenderBtn.getAttribute('data-text')} ${newAge}`;
    document.getElementById('display-location').innerText = `📍 ${newLocation || '未知'}`;
    document.getElementById('display-bio').innerText = newBio || '这个人很懒，什么都没写。';

    const displayInterestsBox = document.getElementById('display-interests');
    displayInterestsBox.innerHTML = ''; 
    const interestsArray = newInterests.split(/[,，]+/).map(i => i.trim()).filter(i => i !== '');
    interestsArray.forEach(interest => { displayInterestsBox.innerHTML += `<span>✨ ${interest}</span>`; });
    
    closeProfileDrawers();
});

let uploadedImagesBase64 = [];
document.getElementById('postImageInput').addEventListener('change', function(e) {
    const files = e.target.files;
    if(!files || files.length === 0) return;
    
    for(let i=0; i<files.length; i++) {
        if(uploadedImagesBase64.length >= 3) break; 
        const reader = new FileReader();
        reader.onload = function(event) {
            uploadedImagesBase64.push(event.target.result);
            renderImagePreviews();
        }
        reader.readAsDataURL(files[i]);
    }
});

function renderImagePreviews() {
    const previewContainer = document.getElementById('postImagePreview');
    previewContainer.innerHTML = '';
    uploadedImagesBase64.forEach((src, index) => {
        const imgWrap = document.createElement('div');
        imgWrap.style.position = 'relative'; imgWrap.style.width = '65px'; imgWrap.style.height = '65px';
        const img = document.createElement('div');
        img.style.width = '100%'; img.style.height = '100%'; img.style.borderRadius = '8px';
        img.style.backgroundImage = `url(${src})`; img.style.backgroundSize = 'cover'; img.style.backgroundPosition = 'center'; img.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        const delBtn = document.createElement('div');
        delBtn.innerHTML = '✕'; delBtn.style.position = 'absolute'; delBtn.style.top = '-6px'; delBtn.style.right = '-6px';
        delBtn.style.background = '#ff4d4f'; delBtn.style.color = 'white'; delBtn.style.borderRadius = '50%';
        delBtn.style.width = '18px'; delBtn.style.height = '18px'; delBtn.style.fontSize = '10px';
        delBtn.style.fontWeight = 'bold'; delBtn.style.display = 'flex'; delBtn.style.justifyContent = 'center'; delBtn.style.alignItems = 'center'; delBtn.style.cursor = 'pointer';
        delBtn.onclick = () => { uploadedImagesBase64.splice(index, 1); renderImagePreviews(); };
        imgWrap.appendChild(img); imgWrap.appendChild(delBtn); previewContainer.appendChild(imgWrap);
    });
}

document.getElementById('publishBtn').addEventListener('click', () => {
    const content = document.getElementById('postContent').value.trim();
    const tagsInput = document.getElementById('postTags').value.trim();
    if (!content && uploadedImagesBase64.length === 0) { alert('请输入内容或上传图片哦！'); return; }

    const today = new Date();
    const currentName = document.getElementById('display-name').innerText;
    const stages = ['🌱', '🌿', '🪴', '🌸', '🌳'];
    const currentPlantStage = stages[Math.min(flowerStage, 4)]; 
    const stageNames = ['种下一颗新种子', '幼苗成长', '盆栽成长', '繁花盛开', '绿树成荫'];
    
    let tagsHtml = '';
    if (tagsInput) {
        tagsInput.split(/\s+/).forEach(tag => { if(tag) tagsHtml += `<span class="post-tag">${tag}</span>`; });
    }

    let imagesHtml = '';
    if (uploadedImagesBase64.length === 1) {
        imagesHtml = `<div class="post-image" style="background-image: url('${uploadedImagesBase64[0]}'); background-size: cover; background-position: center; font-size:0;"></div>`;
    } else if (uploadedImagesBase64.length === 2) {
        imagesHtml = `
        <div style="display:flex; gap:4px; margin-bottom:15px;">
            <div style="flex:1; height:150px; background-image:url('${uploadedImagesBase64[0]}'); background-size:cover; background-position:center; border-radius:12px;"></div>
            <div style="flex:1; height:150px; background-image:url('${uploadedImagesBase64[1]}'); background-size:cover; background-position:center; border-radius:12px;"></div>
        </div>`;
    } else if (uploadedImagesBase64.length >= 3) {
        imagesHtml = `
        <div class="post-images-grid" style="margin-bottom: 15px;">
            <div class="img-main" style="background-image: url('${uploadedImagesBase64[0]}');"></div>
            <div class="img-sub-container">
                <div class="img-sub" style="background-image: url('${uploadedImagesBase64[1]}');"></div>
                <div class="img-sub" style="background-image: url('${uploadedImagesBase64[2]}');"></div>
            </div>
        </div>`;
    }

    const circlePostHtml = `
        <div class="post-card">
            <div class="post-header">
                <div class="post-avatar" style="background-image: ${currentAvatarUrl}; background-size: cover; font-size:0;"></div>
                <div class="post-info"><div class="post-name">${currentName}</div><div class="post-time">刚刚</div></div>
                <div class="circle-post-tag">${currentPlantStage} ${stageNames[Math.min(flowerStage, 4)]}</div>
            </div>
            ${content ? `<div class="post-content">${content}</div>` : ''}
            ${imagesHtml}
            ${tagsHtml ? `<div class="post-tags" style="margin-bottom:15px;">${tagsHtml}</div>` : ''}
            <div class="post-actions">
                <div class="action-btn">❤️ 0</div><div class="action-btn">💬 0</div><div class="action-btn">↗️ 分享</div>
            </div>
        </div>`;

    const minePostHtml = `
        <div class="timeline-item">
            <div class="timeline-dot" style="background-color: var(--primary-pink);"></div>
            <div class="timeline-header">
                <div class="timeline-date">${today.getDate()}<span>${today.getMonth() + 1}月</span></div>
                <div class="timeline-more">•••</div>
            </div>
            ${tagsHtml ? `<div class="post-tags">${tagsHtml}</div>` : ''}
            ${content ? `<div class="post-text">${content}</div>` : ''}
            ${imagesHtml}
        </div>`;

    document.getElementById('global-circle-feed').insertAdjacentHTML('afterbegin', circlePostHtml);
    document.getElementById('myTimelineList').insertAdjacentHTML('afterbegin', minePostHtml);
    
    document.getElementById('postContent').value = '';
    document.getElementById('postTags').value = '';
    document.getElementById('postImageInput').value = '';
    uploadedImagesBase64 = [];
    renderImagePreviews();
    
    closeProfileDrawers();
    alert("发布成功！");
});


// ================= 日历及心情交互 =================
function toggleSidebar() { document.getElementById('sidebar-overlay').classList.toggle('active'); document.getElementById('sidebar-menu').classList.toggle('active'); }

let displayYear = new Date().getFullYear();
let displayMonth = new Date().getMonth(); 
let isEditMode = false;
let activeDateKey = null; 
let currentEditEmoji = ""; 
const journalData = {}; 

function renderCalendar() {
    const gridBody = document.getElementById('cal-days-grid'); gridBody.innerHTML = '';
    document.getElementById('display-month').innerText = `${displayMonth + 1}月`; document.getElementById('display-year').innerText = `${displayYear}年`;

    let firstDay = new Date(displayYear, displayMonth, 1).getDay(); firstDay = firstDay === 0 ? 6 : firstDay - 1; 
    const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
    const today = new Date(); const isCurrentMonth = today.getFullYear() === displayYear && today.getMonth() === displayMonth;
    
    for(let i = 0; i < firstDay; i++) { const emptyCell = document.createElement('div'); emptyCell.className = 'cal-day-cell empty'; gridBody.appendChild(emptyCell); }
    for(let i = 1; i <= daysInMonth; i++) {
        const cell = document.createElement('div'); cell.className = 'cal-day-cell';
        const dateKey = `${currentUser || 'guest'}_${displayYear}-${displayMonth + 1}-${i}`;
        if(isCurrentMonth && i === today.getDate()) cell.classList.add('today');
        
        const numSpan = document.createElement('span'); numSpan.className = 'day-number'; numSpan.innerText = i;
        const circleDiv = document.createElement('div'); circleDiv.className = 'day-circle';

        const record = journalData[dateKey];
        if(record) {
            if(record.emoji) { circleDiv.innerText = record.emoji; circleDiv.classList.add('filled'); }
            if(record.text) cell.classList.add('has-text'); 
        }
        cell.onclick = (e) => handleDateClick(e, i, dateKey);
        cell.appendChild(numSpan); cell.appendChild(circleDiv); gridBody.appendChild(cell);
    }
}

function handleDateClick(e, dayNum, dateKey) {
    e.stopPropagation(); activeDateKey = dateKey; const record = journalData[dateKey] || { emoji: "", text: "" };
    if (isEditMode) {
        document.getElementById('edit-modal-title').innerText = `${displayYear}年${displayMonth + 1}月${dayNum}日`;
        document.getElementById('journal-textarea').value = record.text || "";
        currentEditEmoji = record.emoji || "";
        document.querySelectorAll('.modal-emoji-btn').forEach(btn => { btn.classList.toggle('selected', btn.innerText === currentEditEmoji); });
        document.getElementById('journal-edit-modal').classList.add('active');
    } else {
        if (record.text || record.emoji) {
            document.getElementById('view-modal-title').innerText = `${displayYear}年${displayMonth + 1}月${dayNum}日`;
            document.getElementById('view-modal-emoji').innerText = record.emoji;
            document.getElementById('view-modal-text').innerText = record.text || '没有写下文字，只留下了心情~';
            document.getElementById('journal-view-modal').classList.add('active');
        }
    }
}

function toggleEditMode() { isEditMode = !isEditMode; document.getElementById('edit-mode-btn').classList.toggle('active', isEditMode); }
function selectModalEmoji(emoji, btnElement) { currentEditEmoji = emoji; document.querySelectorAll('.modal-emoji-btn').forEach(btn => btn.classList.remove('selected')); btnElement.classList.add('selected'); }
function saveJournal() {
    const textValue = document.getElementById('journal-textarea').value.trim();
    if(!journalData[activeDateKey]) journalData[activeDateKey] = { emoji: "", text: "" };
    journalData[activeDateKey].text = textValue; journalData[activeDateKey].emoji = currentEditEmoji;
    
    if (currentEditEmoji === '😀' || currentEditEmoji === '😆') targetP5Mood = 1.0; 
    else if (currentEditEmoji === '😢' || currentEditEmoji === '😡') targetP5Mood = 0.3; 
    else targetP5Mood = 0.8; 

    document.getElementById('journal-edit-modal').classList.remove('active'); isEditMode = false; document.getElementById('edit-mode-btn').classList.remove('active'); renderCalendar();
}

const pickerModal = document.getElementById('date-picker-modal');
function initWheelPicker() {
    const yearCol = document.getElementById('wheel-year'); const monthCol = document.getElementById('wheel-month');
    yearCol.innerHTML = '<div class="wheel-pad"></div>'; for(let y = 2020; y <= 2035; y++) yearCol.innerHTML += `<div class="wheel-item" data-val="${y}">${y}</div>`; yearCol.innerHTML += '<div class="wheel-pad"></div>';
    monthCol.innerHTML = '<div class="wheel-pad"></div>'; for(let m = 0; m < 12; m++) monthCol.innerHTML += `<div class="wheel-item" data-val="${m}">${m + 1}</div>`; monthCol.innerHTML += '<div class="wheel-pad"></div>';
    setTimeout(() => { scrollToValue('wheel-year', displayYear); scrollToValue('wheel-month', displayMonth); }, 10);
}
function scrollToValue(colId, val) {
    const col = document.getElementById(colId); let index = 0;
    col.querySelectorAll('.wheel-item').forEach((item, i) => { if(parseInt(item.dataset.val) === val) { index = i; item.classList.add('selected'); } else item.classList.remove('selected'); });
    col.scrollTop = index * 40; 
}
function updateWheelSelection(type) {
    const col = document.getElementById(type === 'year' ? 'wheel-year' : 'wheel-month'); const index = Math.round(col.scrollTop / 40);
    col.querySelectorAll('.wheel-item').forEach((item, i) => { item.classList.toggle('selected', i === index); });
}
function setupWheelDrag(colId) {
    const slider = document.getElementById(colId); let isDown = false; let startY; let scrollTop;
    slider.addEventListener('mousedown', (e) => { isDown = true; slider.style.scrollSnapType = 'none'; startY = e.pageY - slider.offsetTop; scrollTop = slider.scrollTop; });
    const stopDrag = () => { if (!isDown) return; isDown = false; slider.style.scrollSnapType = 'y mandatory'; slider.scrollBy(0, 1); slider.scrollBy(0, -1); };
    slider.addEventListener('mouseleave', stopDrag); slider.addEventListener('mouseup', stopDrag);
    slider.addEventListener('mousemove', (e) => { if (!isDown) return; e.preventDefault(); const y = e.pageY - slider.offsetTop; slider.scrollTop = scrollTop - (y - startY) * 1.5; });
}

// 网页内防遮挡拖拽逻辑
function setupPetDrag(petEl) {
    let isDraggingPet = false; let petOffsetX, petOffsetY;
    const startDragPet = (e) => {
        isDraggingPet = true;
        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        const rect = petEl.getBoundingClientRect(); petOffsetX = clientX - rect.left; petOffsetY = clientY - rect.top;
        const targetDoc = petEl.ownerDocument;
        targetDoc.addEventListener('mousemove', dragPet); targetDoc.addEventListener('mouseup', stopDragPet); targetDoc.addEventListener('touchmove', dragPet, {passive: false}); targetDoc.addEventListener('touchend', stopDragPet);
    };
    const dragPet = (e) => {
        if (!isDraggingPet) return; e.preventDefault(); 
        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        let x = clientX - petOffsetX; let y = clientY - petOffsetY;
        const win = petEl.ownerDocument.defaultView;
        const maxX = win.innerWidth - petEl.offsetWidth; const maxY = win.innerHeight - petEl.offsetHeight;
        x = Math.max(0, Math.min(x, maxX)); y = Math.max(0, Math.min(y, maxY));
        petEl.style.left = `${x}px`; petEl.style.top = `${y}px`; petEl.style.bottom = 'auto'; petEl.style.right = 'auto';
    };
    const stopDragPet = () => {
        isDraggingPet = false; const targetDoc = petEl.ownerDocument;
        targetDoc.removeEventListener('mousemove', dragPet); targetDoc.removeEventListener('mouseup', stopDragPet); targetDoc.removeEventListener('touchmove', dragPet); targetDoc.removeEventListener('touchend', stopDragPet);
    };
    petEl.addEventListener('mousedown', startDragPet); petEl.addEventListener('touchstart', startDragPet, {passive: false});
}

// ================= DOM 加载完成后统一初始化 =================
document.addEventListener("DOMContentLoaded", function() {
    // 初始能量载入时应用到 UI
    updateProgressRing();
    
    // 日历与时间轮盘弹窗控制
    document.getElementById('cal-header-trigger').addEventListener('click', (e) => {
        if(e.target.classList.contains('down-arrow-icon') || e.target.id === 'close-drawer-btn') return;
        initWheelPicker(); pickerModal.classList.add('active');
    });
    document.getElementById('confirm-date-btn').addEventListener('click', () => {
        const yearItem = document.querySelector('#wheel-year .wheel-item.selected'); const monthItem = document.querySelector('#wheel-month .wheel-item.selected');
        if(yearItem && monthItem) { displayYear = parseInt(yearItem.dataset.val); displayMonth = parseInt(monthItem.dataset.val); renderCalendar(); }
        pickerModal.classList.remove('active');
    });

    // ================= ★ 全局无死角点击空白退出修复 ★ =================
    const overlayClasses = ['.modal-overlay', '.profile-overlay', '.calendar-overlay', '.sidebar-overlay'];
    document.querySelectorAll(overlayClasses.join(', ')).forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            // 仅当点击的目标就是黑色半透明遮罩层本身时才触发关闭
            if (e.target === this) {
                this.classList.remove('active');
                if (this.id === 'calendar-overlay') { document.getElementById('calendar-drawer').classList.remove('show'); }
                if (this.id === 'sidebar-overlay') { document.getElementById('sidebar-menu').classList.remove('active'); }
                if (this.classList.contains('profile-overlay')) { closeProfileDrawers(); }
            }
        });
    });

    setupWheelDrag('wheel-year'); setupWheelDrag('wheel-month');
    setupPetDrag(document.getElementById('desktop-pet'));
});