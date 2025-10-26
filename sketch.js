let video;

let handPose;
let hands = []; // ml5 cam tracking - always set global variable as an array to track those points

let fingerCount = 0;
let img, graph1, graph2;
let sq = [];
let cq = [];

// let layer; // use new layer to make paintings/images appear

function preload() {
  handPose = ml5.handPose({ flipped: true }); //model needs to know webcam is flipped
  img = loadImage('interface-mockup.png');
  graph1 = loadImage('SQ-0.png');
  graph2 = loadImage('CQ-0.png');
  for (let i = 0; i < 5; i++){
    let sqImg = loadImage('SQ-' + (i+1) + '.png')
    sq.push(sqImg);
  }
  for (let i = 0; i < 5; i++){
    let cqImg = loadImage('CQ-' + (i+1) + '.png')
    cq.push(cqImg);
  }
}

function gotPoses(results) {
  // console.log(results);
  hands = results;
}

function mousePressed() {
  // Get console's records only by press, like a camera capture
  console.log(hands);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO, { flipped: true });
  video.size(windowWidth, windowHeight);
  video.hide();
  handPose.detectStart(video, gotPoses);
}

function draw() {
  image(video, 0, 0);
  img.resize(windowWidth, windowHeight);
  // image(img, 0, 0);

  if (hands.length > 0) {
    // Once hands are detected
    for (let hand of hands) {
      // for every 'hand' in the 'hands' array - to detect multiple hands

      if (hand.confidence > 0.15) {
        // This will help eliminate the other points that's not in the camera
        
        //Draw all dots of the hand as small dots
        for (let i = 0; i < hand.keypoints.length; i++) {
          fill(255);
          let dots = hand.keypoints[i];
          noStroke();
        circle(dots.x, dots.y, 3);
        }
        // Where do graphs go?
        let graphX = hand.index_finger_pip.x - (graph1.width/2)
        let graphY = hand.index_finger_tip.y + 6

        // Slightly different thumb mechanism
        if (hand.handedness == "Left") { // if on left hand
          // Manually signal how many fingers are up
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

        } else { // if on right hand

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

        // FINGER COUNT TEXT
        // if (fingerCount > 0) {
        //   fill(255);
        //   textSize(30);
        //   text(
        //     fingerCount + " FINGER UP",
        //     hand.index_finger_tip.x,
        //     hand.index_finger_tip.y - 10
        //   );
        // }

      }
    }
  }

  fingerCount = 0;
}
