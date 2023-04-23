import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://grocery-shopping-cart-e906e-default-rtdb.europe-west1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const shoppingListInDB = ref(database, "shoppingList")

const deptFieldEl = document.getElementById("dept-field")
const taskFieldEl = document.getElementById("task-field")
const timeFieldEl = document.getElementById("time-field")

const addButtonEl = document.getElementById("add-button")
const shoppingListEl = document.getElementById("shopping-list")



addButtonEl.addEventListener("click", function() {
    let inputValue = []
    
    inputValue.push(timeFieldEl.value)
    inputValue.push(deptFieldEl.value)
    inputValue.push(taskFieldEl.value)
    
    console.log(inputValue)
    
    push(shoppingListInDB, inputValue)
    
    clearInputFieldEl()
})

onValue(shoppingListInDB, function(snapshot) {
    if (snapshot.exists()) {
        let itemsArray = Object.entries(snapshot.val())
    
        clearShoppingListEl()
        
        itemsArray.sort();
        itemsArray.sort((a, b) => {
                const aTime = a[1][0];
                const bTime = b[1][0];
                if (aTime.includes(':') && bTime.includes(':')) {
                    // Both times are in the format of 'HH:MM{AM/PM}, DD Month'.
                    // We will convert them to a sortable format of 'YYYY-MM-DDTHH:MM:00'.
                    const aDate = new Date(`${aTime.slice(-2)} ${aTime.slice(0, -6)} ${aTime.slice(-5, -3)} 2023`);
                    const bDate = new Date(`${bTime.slice(-2)} ${bTime.slice(0, -6)} ${bTime.slice(-5, -3)} 2023`);
                    return aDate - bDate;
                } else if (aTime.includes(':') && !bTime.includes(':')) {
                    // aTime is a specific time, bTime is a duration in minutes.
                    return -1;
                } else if (!aTime.includes(':') && bTime.includes(':')) {
                    // aTime is a duration in minutes, bTime is a specific time.
                    return 1;
                } else {
                    // Both times are durations in minutes.
                    return parseInt(aTime) - parseInt(bTime);
                }
                });
        
        for (let i = 0; i < itemsArray.length; i++) {
            let currentItem = itemsArray[i] 
            let currentItemID = currentItem[0]
            let currentItemValue = currentItem[1]
            
            appendItemToShoppingListEl(currentItem)
        }    
    } else {
        shoppingListEl.innerHTML = "No items here... yet"
    }
})

function clearShoppingListEl() {
    shoppingListEl.innerHTML = ""
}

function clearInputFieldEl() {
    deptFieldEl.value = ""
    taskFieldEl.value = ""
    timeFieldEl.value = ""
    
}

function appendItemToShoppingListEl(item) {
    let itemID = item[0]
    let tempValue = item[1]
    
    let itemValue = ""
    itemValue += tempValue[1] + ": " + tempValue[2] + ": " + tempValue[0]
    console.log(itemValue)
    
    let newEl = document.createElement("li")
    
    newEl.textContent = itemValue
    
    newEl.addEventListener("click", function() {
        let exactLocationOfItemInDB = ref(database, `shoppingList/${itemID}`)
        
        remove(exactLocationOfItemInDB)
    })
    
    shoppingListEl.append(newEl)
}