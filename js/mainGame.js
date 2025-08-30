const collegePoints = {
  "Cowell College": 0,
  "Stevenson College": 0,
  "Crown College": 0,
  "Merrill College": 0,
  "Porter College": 0,
  "Kresge College": 0,
  "Oakes College": 0,
  "Rachel Carson College": 0,
  "College Nine": 0,
  "John R. Lewis College": 0,
};

let assignedDorm=null;
let assignedRoom=null;

const roomTypeBeds={
  "Cowell College": ["single", "triple", "quad"],
  "Stevenson College": ["single", "triple", "quad"],
  "Crown College": ["single", "triple", "large triple"],
  "Merrill College": ["single", "double", "triple", "large triple", "quad", "quint", "hex"],
  "Porter College": ["single", "double", "triple", "large triple", "quint"],
  "Kresge College": ["single", "triple"],
  "Oakes College": ["single", "triple", "quad", "quint"],
  "Rachel Carson College": ["single", "double", "triple", "quad", "hex double suite"],
  "College Nine": ["single", "triple", "large triple"],
  "John R. Lewis College": ["single", "triple", "large triple"],
};

const ROOM_WEIGHTS={
  "single":5,
  "double":15,
  "triple":45,
  "large triple":30,
  "quad":25,
  "quint":25,
  "hex":25,
  "hex double suite":10,
};

//HELPERS
//picking dorm room based on each college and their room types

function weightPick(weightMap){
  const entries = Object.entries(weightMap).filter(([, w]) => (Number(w) || 0) > 0);
  if (!entries.length) return null;
  const total = entries.reduce((sum, [, w]) => sum + Number(w), 0);
  let r = Math.random() * total;
  for (const [key, w] of entries) {
    r -= Number(w);
    if (r <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

function assignDorm() {
  const scores = window.collegeFinalScores || {}; //comes from collegeRanking.js
  const entries = Object.entries(scores);

  if (!entries.length) {
    assignedDorm = "Porter College";
    console.warn("[assignDorm] No scores; defaulting to Porter.");
    return;
  }

  let max = -Infinity;
  for(const [, s] of entries) {
    const v = Number(s) || 0;
    if (v>max) max=v;
  }

  //all colleges with the max score
  let top=entries
  .filter (([, s]) => (Number(s) || 0) === max)
  .map(([c]) => c);

  //tie-break by user's drag order
  const order=Array.isArray(window.collegeRankOrder) ? window.collegeRankOrder : [];
  if(order.length > 0 && top.length > 1) {
    top.sort((a,b) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      return (ia === -1 ? Number.MAX_SAFE_INTEGER:ia) - (ib === -1 ? Number.MAX_SAFE_INTEGER:ib);
    });
  }

  //final pick
  assignedDorm=top.length === 1 ? top[0] : top[Math.floor(Math.random() * top.length)];
  console.log("[assignDorm] Assigned:", assignedDorm, "Scores:", scores, "Order:", order);
}

//chosing room type from what the college has, using weights
function assignRoomType(dormName){
  const allowed = roomTypeBeds[dormName] || ["triple"];
  const filteredWeights = {};
  allowed.forEach(type => {
    filteredWeights[type]=ROOM_WEIGHTS[type] || 0;
  });

  //
  if (Object.values(filteredWeights).every(w => !w)){
    filteredWeights["triple"]=1;
  }

  return weightPick(filteredWeights) || "triple";
}

//THE STORY PORTION!
const gameData = {

  "1": {
    "text": "Welcome to UCSC!! \
            You will be living at {{dorm}} in a {{roomType}} \
            and will be moving in a week before school start as part of UCSC's Welcome Week."
            ,
    "image": "images/movein.png",
    "choices": {
      "Continue": [2, []]
    }
  },

  "2": {
    "text": "As you drive up the winding road as to get to {{dorm}}, \
            what is the first thing you notice?",
    "image": "images/windingroad.png",
    "choices": {
      "The tall trees": [3,[]],
      "The sun peaking through": [3,[]],
      "The calm wind (steady breeze?)": [3,[]],
      "The water meeting the forest": [3,[]],
      "Nothing :/ you're getting car sick": [3,[]]
    }
  },

  "3": {
    "text": "You get to your {{dorm}} and your the first one there! \
            Which bed will you choose?",
    "image": "images/beds.png",
    "choices": {

    }
  },

  "4": {
    "text": "",
    "image": "",
    "choices": {
    }
  },

  "5": {
    "text": "",
    "image": "",
    "choices": {
      "sf": [,[]],
      "sf": [,[]],
    }
  }
};

const personalities = {
  "Banana Slug": 0,
  "Deer": 0,
  "Turkey": 0,
  "Coyote": 0,
  "Bat": 0,
  "Crow/Owl": 0,
  "Squirrel": 0,
  "Rabbit": 0,
  "Butterfly": 0,
  "Koi Fish": 0,
  "Raccoon": 0,
  "Snake": 0,
};

let currentScene = 1;
const sceneStack = [];

//render

function renderState(index){
  const scene=gameData[index];
  if (!scene){
    console.error("Scene not found:", index);
    return;
  }

  if (!assignedDorm) assignDorm();
  if (!assignedRoom) assignedRoom = assignRoomType(assignedDorm);

  const storyText=document.getElementById('story-text');
  const storyImage=document.getElementById('story-image');
  const choicesContainer=document.getElementById('choices');

  const processedText= (scene.text || "")
    .replace('{{dorm}}', assignedDorm || 'your dorm')
    .replace('{{roomType}}', assignedRoom || 'triple');

  //different bed types
  storyText.textContent=processedText;
  storyImage.src=scene.image || '';
  choicesContainer.innerHTML='';

  let choicesToRender=scene.choices || {};
  if(index === 3){
    const rt = (assignedRoom || "triple").toLowerCase();


    //library option of room types
    const BED_CHOICES={
      "single": {
        "Claim the only bed - center of the universe": [, []],
      },

      "double": {
        "Bed by the window (morning light!)": [,[]],
        "Bed by the door (quick in/out)": [,[]],
      },

      "triple": {
        "Loft bed": [,[]],
        "Top bunk": [,[]],
        "Lower bunk (more storage)": [,[]],
      },

      "quad": {
        "Top bunk near the window": [,[]],
        "Bottom bunk near the window": [,[]],
        "Top bunk near the door": [,[]],
        "Bottom bunk near the door": [,[]],
      },

      "quint": {
        "Loft bed": [,[]],
        "Top bunk near the window": [,[]],
        "Bottom bunk near the window": [,[]],
        "Top bunk near the door": [,[]],
        "Bottom bunk near the door": [,[]],
      },

      "hex": {
        "Loft bed near the window": [,[]],
        "Loft bed near the door": [,[]],
        "Top bunk near the window": [,[]],
        "Bottom bunk near the window": [,[]],
        "Top bunk near the door": [,[]],
        "Bottom bunk near the door": [,[]],
      },

      "hex double suite": {
        "Room A: bed by the window": [,[]],
        "Room A: bed by the door": [,[]],
        "Room B: bed by the window": [,[]],
        "Room B: bed by the door": [,[]],
        "Room C: bed by the window": [,[]],
        "Room C: bed by the door": [,[]],
      },
    };

    choicesToRender=BED_CHOICES[rt] || {
      "Take the bed closest to the window": [,[]],
      "Take the bed closest to the door": [,[]],
    };
  }

  Object.entries(choicesToRender).forEach(([choiceText, [nextState, personalitiesList]]) => {
    const button = document.createElement('button');
      button.className='choice-button';
      button.textContent=choiceText;
      button.onclick = () => {
        (personalitiesList || []).forEach(p => {
          if(!(p in personalities)) personalities[p]=0;
          personalities[p]++;
        });

        const target = (typeof nextState === 'number') ? nextState : currentScene +1;
        sceneStack.push(currentScene);
        currentScene=nextState;
        renderState(currentScene);
      };
      choicesContainer.appendChild(button);
  });
}
  
function revealMostSelectedCollege(){
  let maxCount = 0;
  let maxAnimal = '';

  for (const [Animal, count] of Object.entries(personalities)){
    if (count > maxCount){
      maxCount = count;
      maxAnimal = Animal;
    }
  }

  const storyImage = document.getElementById('story-image');
  const storyText = document.getElementById('story-text');
  const choicesContainer = document.getElementById('choices');

  const img = new Image();
  img.src = `smaller_images/id_cards/${maxAnimal}.png`;
  img.className = 'responsive-image';

  const shareButton = document.createElement('button');
  shareButton.textContent = 'Share the game with Friends';
  shareButton.className = 'choice-button';
  shareButton.onclick = () => {
    navigator.clipboard
    .writeText('Check out my Animal ID! You can create yours at https://erainree.github.io/Animal/')
    .then(() => alert('Link copied to clipboard!'))
    .catch(() => alert('Failed to copy link.'));
};

  img.onload = () => {
    storyImage.style.display = 'none';
    choicesContainer.style.display = 'none';
    storyText.textContent = "Drumroll... here is your Animal ID! Don't lose it! (Right click or hold the image to save)";
    storyText.appendChild(img);
    storyText.appendChild(shareButton);
  };
}


function startGame() {
  document.querySelector('.title').style.display = 'none';
  document.getElementById('homescreen').style.display = 'none';

  const startButton = document.querySelector('.start-button');
  if(startButton) startButton.style.display = 'none';

  document.getElementById('ranking-container').style.display = 'none';
  document.getElementById('game-container').style.display = 'block';

  renderState(currentScene);
}

window.startGame=startGame;

window.addEventListener('popstate', () => {
  if (sceneStack.length > 0) {
      currentScene = sceneStack.pop();
      renderState(currentScene);
  }
});
