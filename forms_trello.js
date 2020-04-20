import {endpoint, apiKey} from "./modules/settings";

//---------------------------INIT------------------------------------//

window.addEventListener("load", init);

function init(){
    setUpForm();
    getTrelloList();
}

//---------------------------FORM------------------------------------//

function setUpForm(){
const form = document.querySelector("form");
window.form = form;
const elements = form.elements;
window.elements = elements;
console.log(elements)


form.setAttribute("novalidate", true);
form.addEventListener("submit", (e) => {
    e.preventDefault();
     //loop through each of the elements. Whenever user clicks submit, we clear all invalid classes
     const formElements = form.querySelectorAll("input");
     //verify if they are valid
     formElements.forEach((el)=>{
    //for each we remove the invalid class
    el.classList.remove("invalid");
     })

    if (form.checkValidity()){
        //send to api
        //console.log("send to api")
        if (form.dataset.state === "post"){
            postTrelloList({
                title: form.elements.title.value,
                description: form.elements.description.value,
                deadline: form.elements.deadline.value
    
            });
        } else {
            putTrelloList({
                title: form.elements.title.value,
                description: form.elements.description.value,
                deadline: form.elements.deadline.value
    
            }, form.dataset.id);
        }
        form.reset();
    } else {
   //if theres an issue, show the user error message
       formElements.forEach((el)=>{
       if(!el.checkValidity()){
               el.classList.add("invalid");
           }
       })

    }

});

}

//---------------------------TEMPLATE------------------------------------//
function showTasks(singleTask){
    console.log(singleTask)
    console.log(singleTask.title)
    //1.get template
    const template = document.querySelector("template").content;
    //2.clone it
    const copy = template.cloneNode(true);
    //parent
    const parent = document.querySelector("#toDoTasks");
    //console.log(document.querySelector("main"))
    console.log(document.querySelector("#toDoTasks"))
    //copy into the template
    copy.querySelector("p.title").textContent = singleTask.title;
    copy.querySelector("p.description").textContent = singleTask.description;
    copy.querySelector("p.deadline").textContent = singleTask.deadline;
    //buttons (to do, in prog, done)
    //action on the delete button
    copy.querySelector(`[data-action="delete"]`).addEventListener("click", (e) => deleteTask(singleTask._id));
    copy.querySelector(`[data-action="edit"]`).addEventListener("click", (e) => editPrepareTask(singleTask._id, setUpFormForEdit));
    copy.querySelectorAll(`article, button[data-action="delete"]`).forEach(el=>el.dataset.id=singleTask._id);
    //3.append
    parent.appendChild(copy);   
    
}

//---------------------------DELETE------------------------------------//
function deleteTask(id){
    //1.send request to api
    fetch(endpoint + "rest/trello/" + id, {
        method: "delete",
        headers: {
        "accept": "application/json",
        "x-apikey": apiKey,
        "cache-control": "no-cache",
    }
    })
    .then((res) => res.json())
    .then((data) => {});
    //2.remove from dom
    document.querySelector(`article[data-id="${id}"]`).remove();
}

//---------------------------prepare EDIT------------------------------------//
function editPrepareTask(id, callback){
    //fetch data using the id
    fetch(endpoint + "rest/trello/" + id, {
        method: "get",
        headers: {
        "accept": "application/json",
        "x-apikey": apiKey,
        "cache-control": "no-cache",
    }
    })
    .then((res) => res.json())
    .then((data) => callback(data));
  
}
//---------------------------EDITING MODE------------------------------------//
function setUpFormForEdit(data){
    //console.log("hi there")
    
    //populate form
    const form = document.querySelector("form");
    //dataset edit both ways - to reuse the form function
    form.dataset.state = "edit";
    //give it an id so that we can use in putsuperero function
    form.dataset.id = data._id;
    //clear the form before so that next edit button action populates info from scratch
    form.reset();
    
    //populate form
    form.elements.title.value = data.title;
    form.elements.description.value = data.description;
    form.elements.deadline.value = data.deadline;

}
//---------------------------POST------------------------------------//

function postTrelloList(newTask){

    const postData = JSON.stringify(newTask);
    fetch(endpoint + "rest/trello", {
    method: "post",
    headers: {
    "Content-Type": "application/json; charset=utf-8",
    "x-apikey": apiKey,
    "cache-control": "no-cache",
},
body: postData,
})
.then((res) => res.json())
.then((data) => {
  console.log(data);
  showTasks(data);
});

}


//------------------------- PUT after editing-----------------------------//

function putTrelloList(newTask, id){
    const postData = JSON.stringify(newTask);
    fetch(endpoint + "rest/trello/" + id, {
    method: "put",
    headers: {
    "Content-Type": "application/json; charset=utf-8",
    "x-apikey": apiKey,
    "cache-control": "no-cache",
},
body: postData,
})
.then((res) => res.json())
.then((data) => {
  console.log(data);
});

}

//---------------------------GET------------------------------------//

function getTrelloList(){
   
    fetch(endpoint + "rest/trello", {
    method: "get",
    headers: {
    "accept": "application/json",
    "x-apikey": apiKey,
    "cache-control": "no-cache",
}
})
.then((res) => res.json())
.then((data) => data.forEach(showTasks))

};

