// LOGIN
function login(){
    let u = document.getElementById("username").value.trim();
    let p = document.getElementById("password").value.trim();

    if(!u || !p){
        alert("Enter username & password");
        return;
    }

    localStorage.setItem("loggedUser", u);
    window.location = "semester.html";
}

function logout(){
    localStorage.clear();
    window.location = "index.html";
}

// NAVIGATION
function goToSubjects(s){
    localStorage.setItem("semester", s);
    window.location = "subjects.html";
}

// GLOBAL
let selectedType = "";
let exchanged = false;
let exchangedOnce = false;
let questions = [];
let selectedQuestionIndex = -1;

function resetState(){
    exchanged = false;
    exchangedOnce = false;
    selectedQuestionIndex = -1;
}

// TYPE
function showTypeSelection(){
    document.getElementById("typeSection").innerHTML = `
        <h3>Select Type</h3>
        <button onclick="selectType('internal')">Internal</button>
        <button onclick="selectType('external')">External</button>
    `;
}

function selectType(type){
    selectedType = type;
    document.getElementById("typeSection").innerHTML = "";
    showStudentForm();
}

// STUDENT
function showStudentForm(){
    resetState();

    document.getElementById("studentSection").innerHTML = `
    <h3>Student Details</h3>
    Name: <input id="studentNameInput"><br><br>
    Reg No: <input id="studentRegInput"><br><br>
    <button onclick="saveStudent()">Proceed</button>
    `;

    document.getElementById("questionNumbers").innerHTML = "";
    document.getElementById("questionDisplay").innerHTML = "";
    document.getElementById("exchangeSection").innerHTML = "";
    document.getElementById("marksSection").innerHTML = "";
}

function saveStudent(){
    let name = document.getElementById("studentNameInput").value.trim();
    let reg = document.getElementById("studentRegInput").value.trim();

    if(!name || !reg){
        alert("Enter all details");
        return;
    }

    localStorage.setItem("studentName", name);
    localStorage.setItem("regNo", reg);

    loadQuestions();
}

// QUESTIONS
function loadQuestions(){
    let subject = localStorage.getItem("subject");

    fetch(subject + ".txt")
    .then(res => res.text())
    .then(data => {
        let lines = data.split("\n");
        questions = [];
        let qBuffer = "";

        for(let i=0;i<lines.length;i++){
            let line = lines[i].trim();

            if(line.match(/^\d+\)/)){
                if(qBuffer) questions.push(qBuffer.trim());
                qBuffer = line;
            } else if(line !== ""){
                qBuffer += "\n" + line;
            }
        }

        if(qBuffer) questions.push(qBuffer.trim());

        while(questions.length < 10){
            questions.push("(No question)");
        }

        showQuestionButtons();
    });
}

// QUESTION BUTTONS
function showQuestionButtons(){
    let div = document.getElementById("questionNumbers");
    div.innerHTML = "<h3>Select Question</h3>";

    for(let i=0;i<10;i++){
        let btn = document.createElement("button");
        btn.textContent = "Q" + (i+1);
        btn.onclick = () => showQuestion(i);
        div.appendChild(btn);
        div.appendChild(document.createTextNode(" "));
    }
}

// SHOW QUESTION
function showQuestion(i){
    selectedQuestionIndex = i;

    let q = questions[i].replace(/\n/g,"<br>");

    document.getElementById("questionDisplay").innerHTML = `
    <h3>Question ${i+1}</h3>
    <p>${q}</p>
    `;

    if(exchangedOnce){
        showMarksForm();
        return;
    }

    document.getElementById("exchangeSection").innerHTML = `
    <button onclick="handleExchange(true)">Exchange</button>
    <button onclick="handleExchange(false)">Continue</button>
    `;
}

// EXCHANGE
function handleExchange(choice){
    if(choice){
        exchanged = true;
        exchangedOnce = true;
        showQuestionButtons();
        document.getElementById("questionDisplay").innerHTML = "";
        document.getElementById("exchangeSection").innerHTML = "";
    } else {
        showMarksForm();
        document.getElementById("exchangeSection").innerHTML = "";
    }
}

// MARKS FORM
function showMarksForm(){
    let section = document.getElementById("marksSection");

    if(selectedType === "internal"){
        section.innerHTML = `
        <h3>Internal Marks</h3>
        Observation: <input id="obs"><br><br>
        Record: <input id="rec"><br><br>
        Written: <input id="written"><br><br>
        Viva: <input id="viva"><br><br>
        <button onclick="calculate()">Submit</button>
        `;
    } else {
        section.innerHTML = `
        <h3>External Marks</h3>
        Logic: <input id="logic"><br><br>
        Execution: <input id="execution"><br><br>
        Viva: <input id="viva"><br><br>
        <button onclick="calculate()">Submit</button>
        `;
    }
}

// SAVE RESULT
function saveResult(obj){
    let user = localStorage.getItem("loggedUser");
    let sub = localStorage.getItem("subject");
    let type = selectedType;

    let key = `results_${user}_${sub}_${type}`;
    let data = JSON.parse(localStorage.getItem(key)) || [];
    data.push(obj);

    localStorage.setItem(key, JSON.stringify(data));
}

// CALCULATE
function calculate(){
    let name = localStorage.getItem("studentName");
    let reg = localStorage.getItem("regNo");
    let sub = localStorage.getItem("subject");
    let qNo = "Q" + (selectedQuestionIndex+1);

    let html = "";

    if(selectedType === "internal"){
        let o=+obs.value, r=+rec.value, w=+written.value, v=+viva.value;

        if(o>5||r>5||w>15||v>5){
            alert("Marks exceed limit!");
            return;
        }

        let penalty = exchanged?5:0;
        let total = o+r+w+v-penalty;

        saveResult({Name:name,RegNo:reg,Subject:sub,Question:qNo,
            Observation:o,Record:r,Written:w,Viva:v,Penalty:penalty,Total:total});

        html = `
        <table border="1">
        <tr>
        <th>Name</th><th>Reg No</th><th>Subject</th><th>Question No</th>
        <th>Observation</th><th>Record</th><th>Written</th><th>Viva</th>
        <th>Penalty</th><th>Total</th>
        </tr>
        <tr>
        <td>${name}</td><td>${reg}</td><td>${sub}</td><td>${qNo}</td>
        <td>${o}</td><td>${r}</td><td>${w}</td><td>${v}</td>
        <td>${penalty}</td><td>${total}</td>
        </tr>
        </table>`;
    } else {
        let l=+logic.value,e=+execution.value,v=+viva.value;

        if(l>30||e>30||v>10){
            alert("Marks exceed limit!");
            return;
        }

        let penalty = exchanged?10:0;
        let total = l+e+v-penalty;
        let grade = total>=60?"A":total>=40?"B":"C";

        saveResult({Name:name,RegNo:reg,Subject:sub,Question:qNo,
            Logic:l,Execution:e,Viva:v,Penalty:penalty,Total:total,Grade:grade});

        html = `
        <table border="1">
        <tr>
        <th>Name</th><th>Reg No</th><th>Subject</th><th>Question No</th>
        <th>Logic</th><th>Execution</th><th>Viva</th>
        <th>Penalty</th><th>Total</th><th>Grade</th>
        </tr>
        <tr>
        <td>${name}</td><td>${reg}</td><td>${sub}</td><td>${qNo}</td>
        <td>${l}</td><td>${e}</td><td>${v}</td>
        <td>${penalty}</td><td>${total}</td><td>${grade}</td>
        </tr>
        </table>`;
    }

    document.getElementById("marksSection").innerHTML = `
    ${html}
    <br><br>
    <button onclick="showStudentForm()">Next Student</button>
    <button onclick="exportCSV()">Export</button>
    <button onclick="logout()">Logout</button>
    `;
}

// EXPORT CSV
function exportCSV(){
    let user = localStorage.getItem("loggedUser");
    let sub = localStorage.getItem("subject");
    let type = selectedType;

    let key = `results_${user}_${sub}_${type}`;
    let data = JSON.parse(localStorage.getItem(key)) || [];

    if(data.length===0){
        alert("No data");
        return;
    }

    let csv = Object.keys(data[0]).join(",")+"\n";
    data.forEach(r=>{
        csv += Object.values(r).join(",")+"\n";
    });

    let blob = new Blob([csv],{type:"text/csv"});
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${user}_${sub}_${type}.csv`;
    a.click();
}