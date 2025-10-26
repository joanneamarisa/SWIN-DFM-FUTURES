let video;
let handPose;
let hands = [];
let faceMesh;
let faces = [];

let fingerCount = 0;
let img, graph1, graph2;
let sq = [];
let cq = [];

// Student data
let studentData = [];
let currentStudentIndex = 0;
let previousFaceCount = 0;

function preload() {
  handPose = ml5.handPose({ flipped: true });
  faceMesh = ml5.faceMesh({ flipped: true }); // Add faceMesh
  
  img = loadImage('assets/interface-mockup.png');
  graph1 = loadImage('assets/SQ-0.png');
  graph2 = loadImage('assets/CQ-0.png');
  
  // Load graph images
  for (let i = 0; i < 5; i++) {
    let sqImg = loadImage('assets/SQ-' + (i + 1) + '.png');
    sq.push(sqImg);
  }
  for (let i = 0; i < 5; i++) {
    let cqImg = loadImage('assets/CQ-' + (i + 1) + '.png');
    cq.push(cqImg);
  }
  
  // Load CSV data
  loadTable('dfm-futures-genAI-student-personas.csv', 'csv', 'header', tableLoaded);
}

function tableLoaded(table) {
  // Parse CSV into studentData array
  for (let i = 0; i < table.getRowCount(); i++) {
    let row = table.getRow(i);
    studentData.push({
      name: row.getString('StudentName'),
      message: row.getString('AImessage'),
      scq: row.getString('SCQ'),
      miPercent: row.getString('MIpercent'),
      mostImproved: row.getString('MostImproved'),
      naPercent: row.getString('NApercent'),
      needsAttention: row.getString('NeedsAttention')
    });
  }
  console.log('Loaded ' + studentData.length + ' students');
  updateDisplay(studentData[0]);
}

function gotPoses(results) {
  hands = results;
}

function gotFaces(results) {
  faces = results;
  
  // Detect when a new face appears
  if (faces.length > 0 && previousFaceCount === 0) {
    // New face detected, switch to next student
    currentStudentIndex = (currentStudentIndex + 1) % studentData.length;
    if (studentData.length > 0) {
      updateDisplay(studentData[currentStudentIndex]);
      console.log('Switched to:', studentData[currentStudentIndex].name);
    }
  }
  
  previousFaceCount = faces.length;
}

function updateDisplay(student) {
  // Update HTML elements with student data
  select('.name').html(student.name);
  select('.message').html(student.message);
  select('.scq-score').html(student.scq);
  
  // Update Most Improved card
  select('.improved .card-percentage').html(
    student.miPercent.replace('%', '') + '<span class="percent">%</span> <span class="arrow">↑</span>'
  );
  select('.improved .card-label').html(student.mostImproved);
  
  // Update Needs Attention card
  select('.declined .card-percentage').html(
    student.naPercent.replace('%', '') + '<span class="percent">%</span> <span class="arrow">↓</span>'
  );
  select('.declined .card-label').html(student.needsAttention);
}

function mousePressed() {
  console.log('Hands:', hands);
  console.log('Faces:', faces);
  console.log('Current student:', studentData[currentStudentIndex]);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO, { flipped: true });
  video.size(windowWidth, windowHeight);
  video.hide();
  
  // Start hand pose detection
  handPose.detectStart(video, gotPoses);
  
  // Start face detection
  faceMesh.detectStart(video, gotFaces);
}

function draw() {
  image(video, 0, 0);

  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.15) {
        
        // Draw all dots of the hand
        for (let i = 0; i < hand.keypoints.length; i++) {
          fill(255);
          let dots = hand.keypoints[i];
          noStroke();
          circle(dots.x, dots.y, 3);
        }
        
        // Where do graphs go?
        let graphX = hand.index_finger_pip.x - (graph1.width / 2);
        let graphY = hand.index_finger_tip.y + 6;

        if (hand.handedness == "Left") {
          // Left hand - Social graph
          if (hand.index_finger_tip.y < hand.index_finger_pip.y) {
            fingerCount = 1;
            image(sq[0], graphX, graphY);
          }
          if (hand.middle_finger_tip.y < hand.middle_finger_pip.y) {
            fingerCount = 2;
            image(sq[1], graphX, graphY);
          }
          if (hand.ring_finger_tip.y < hand.ring_finger_pip.y) {
            fingerCount = 3;
            image(sq[2], graphX, graphY);
          }
          if (hand.pinky_finger_tip.y < hand.pinky_finger_pip.y) {
            fingerCount = 4;
            image(sq[3], graphX, graphY);
          }
          if (hand.thumb_tip.x > hand.thumb_mcp.x + 15) {
            fingerCount = 5;
            image(sq[4], graphX, graphY);
          }
          image(graph1, graphX, graphY);
          
        } else {
          // Right hand - Cognition graph
          if (hand.index_finger_tip.y < hand.index_finger_pip.y) {
            fingerCount = 1;
            image(cq[0], graphX, graphY);
          }
          if (hand.middle_finger_tip.y < hand.middle_finger_pip.y) {
            fingerCount = 2;
            image(cq[1], graphX, graphY);
          }
          if (hand.ring_finger_tip.y < hand.ring_finger_pip.y) {
            fingerCount = 3;
            image(cq[2], graphX, graphY);
          }
          if (hand.pinky_finger_tip.y < hand.pinky_finger_pip.y) {
            fingerCount = 4;
            image(cq[3], graphX, graphY);
          }
          if (hand.thumb_tip.x < hand.thumb_mcp.x - 15) {
            fingerCount = 5;
            image(cq[4], graphX, graphY);
          }
          image(graph2, graphX, graphY);
        }
      }
    }
  }

  fingerCount = 0;
}
