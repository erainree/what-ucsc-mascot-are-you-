//single source of college list
const COLLEGES=[
    "Cowell College",
    "Stevenson College",
    "Crown College",
    "Merrill College",
    "Porter College",
    "Kresge College",
    "Oakes College",
    "Rachel Carson College",
    "College Nine",
    "John R. Lewis College",
];

//newly added 7/17 need to fix
function setStudentType(type){
    window.studentType=type; //freshman or transfer

    document.getElementById('student-type-container').style.display='none';
    document.getElementById('ranking-container').style.display='block';
}

function startRanking(){
    document.getElementById('student-type-container').style.display='block';
    document.getElementById('ranking-container').style.display='none';
    document.getElementById('game-container').style.display='none';
    document.getElementById('homescreen').style.display='none';
    document.querySelector('.start-button').style.display='none';
    document.querySelector('.title').style.display='none'
}

window.setStudentType=setStudentType;
window.startRanking=startRanking;

//scoring helpers
function buildBaseScores(studentType){
    const base={};
    
    //even base for all colleges
    COLLEGES.forEach(c => { base[c]=1; });
    //transfer automatically gets +3 points to Porter
    if (studentType === 'Transfer'){
        base["Porter College"] += 3;
    }
    return base;
}

function buildRankingPoints(rankedCollegesText){
    const pts={};
    COLLEGES.forEach(c => {pts[c]=0;});

    const cleaned =rankedCollegesText.map(txt => txt.split(' - ')[0].trim());

    const awards = [5,4,3,2,1]; //top 5 only
    for (let i =0; i<cleaned.length && i<awards.length; i++){
        const name = cleaned[i];
        if (pts[name] != null) pts[name] += awards[i];
    }
    return pts;
}

function sumScores(a,b){
    const out={};
    COLLEGES.forEach(c => {out[c]=(a[c] || 0) + (b[c] || 0); });
    return out;
}

document.addEventListener('DOMContentLoaded', () => {
    const list = document.getElementById('college-list');
    const button = document.getElementById('submit-ranking');

    if (!list || !button){
        console.error('[collegeRanking] Missing #college-list or #submit-ranking');
        return;
    }

    if (typeof Sortable !== 'undefined'){
        Sortable.create(list, {
            animation:150,
            ghostClass:'sortable-ghost',
            chosenClass:'sortable-chosen',
        });
    } else{
        console.warn('[collegeRanking] SortableJS not found; drag-and-drop may not work.');
    }

    let submitted=false;
    button.addEventListener('click', (e) => {
        e.preventDefault();
        if (submitted) return;
        submitted=true;

        const rankedColleges=Array.from(list.children).map(li => li.textContent.trim());
        window.collegeRankOrder = rankedColleges.map(txt => txt.split (' - ')[0].trim());

        const base=buildBaseScores(window.studentType || 'Freshman');
        const rankPts=buildRankingPoints(rankedColleges);
        const finalScores=sumScores(base, rankPts);

        window.collegeFinalScores=finalScores;

        console.log('BASE   :', base);
        console.log('RANKING   :', rankPts);
        console.log('FINAL   :', finalScores);
        console.log('ORDER   :', window.collegeRankOrder);

        document.getElementById('ranking-container').style.display='none';
        document.getElementById('game-container').style.display='block';

        if(typeof window.startGame === 'function'){
            window.startGame();
        } else{
            console.warn('[collegeRanking] window.startGame() not available.');
        }
    });
});