let tables = localStorage.getItem("tables") ? JSON.parse(localStorage.getItem("tables")) : [];
let cindex = null;
if (tables.length == 0) {
  for (let i = 0; i < 3; i++) {
    var obj = {
      "food": [],
      "items": 0,
      "price": 0
    }
    tables.push(obj);
  }
}
let tableNo = 0;
while (tableNo < 3) {
  var li = createNode(tableNo);
  document.getElementById("table-list").appendChild(li);
  tableNo++;
}

/**
 * this method is used to search through both tables and food menu.
 * @param {*} x id of table list || menu list
 */
function searchTables(x) {
  input = document.getElementsByClassName('tablesearch');
  if (x === 'table-list') {
    filter = input[0].value.toUpperCase();
  } else {
    filter = input[1].value.toUpperCase();
  }
  ul = document.getElementById(x);
  li = ul.getElementsByTagName('li');
  for (i = 0; i < li.length; i++) {
    a = li[i].getElementsByTagName("h5")[0];
    if (a == undefined) {
      a = li[i].getElementsByTagName("span")[0];
    }
    txtValue = a.textContent || a.innerText;
    console.log(txtValue);
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}

function drag(ev) {
  ev.dataTransfer.setData("li", ev.target.id);
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drop(ev) {
  ev.preventDefault();
  let data = document.getElementById(ev.dataTransfer.getData("li"));
  updateStorage(data, ev.target.getElementsByTagName("span")[0].innerText);
}

/**
 * update the local storage when we add a new item to a table
 * @param {*} cpy food object to be added
 * @param {*} tableNo table no(string)
 */
function updateStorage(cpy, tableNo) {
  let index = Number(tableNo[tableNo.length - 1]) - 1;
  let obj = {
    "foodName": cpy.getElementsByTagName('h5')[0].innerText,
    "foodPrice": Number(cpy.getElementsByTagName('span')[0].innerText),
    "foodQuantity": 1
  }
  let flag = false;
  for (let i = 0; i < tables[index].food.length; i++) {
    if (obj.foodName === tables[index].food[i].foodName) {
      tables[index].food[i].foodQuantity += 1;
      tables[index].items += 1;
      tables[index].price += obj.foodPrice;
      flag = true;
      break;
    }
  }
  if (!flag) {
    tables[index].food.push(obj);
    tables[index].items += 1;
    tables[index].price += obj.foodPrice;
  }
  localStorage.setItem('tables', JSON.stringify(tables));
  updateMenuView(index);
}

/**
 * update the  ui of the page
 * @param {*} index table no to be updated
 */
function updateMenuView(index) {
  let list = document.getElementById('table-list');
  let li = createNode(index);
  list.replaceChild(li, list.childNodes[index + 1]);
}

/**
 * create new table li with updated data;
 * @param {*} index table no to be updated
 */
function createNode(index) {
  let li = document.createElement('li');
  li.innerHTML = `<span>Table ${index + 1}</span><ul style="display:none"></ul><div class="table-bottom-view">Rs.<span>${tables[index].price}</span> | Total items: <span>${tables[index].items}</span></div>`;
  li.setAttribute('ondrop', "drop(event)");
  li.setAttribute('ondragover', 'allowDrop(event)');
  li.setAttribute('data-toggle', 'modal');
  li.setAttribute('data-target', '#myModal')
  return li;
}
/**
 * add the current table items on the bill when modal opens.
 */
$('#myModal').on('show.bs.modal', function (e) {
  let table = e.relatedTarget.getElementsByTagName("span")[0].innerText;
  index = Number(table[table.length - 1]) - 1;
  cindex = index;
  document.getElementsByClassName('modal-title')[0].innerText = `${table} | Order Details`;
  let i = 0;
  let bill = document.getElementById('bill');
  for (i = 0; i < (tables[index].food).length; i++) {
    let tr = createTableRows(index, i);
    bill.appendChild(tr);
  }
  let total = document.getElementById('bill-total');
  total.innerText = 'Total: ' + tables[index].price;
});
/**
 * create  table rows for the bill description.
 * @param {*} index  current table no  whose bill is to be generated.
 * @param {*} cur   current item no of the food .
 */
function createTableRows(index, cur) {
  let tr = document.createElement('tr');
  let sn = document.createElement('td');
  sn.innerText = `${cur + 1}`;
  tr.appendChild(sn);
  for (key in (tables[index].food)[cur]) {
    let td = document.createElement('td');
    if (key == 'foodQuantity') {
      td.innerHTML = `<input onchange='updateBill()' type="number" value="${((tables[index].food)[cur])[key]}" min ='1'>`;
    } else {
      td.innerText = ((tables[index].food)[cur])[key];
    }
    tr.appendChild(td);
  }
  let del = document.createElement('td');
  del.innerHTML = '<button onclick="updateBill()"><img src="https://img.icons8.com/material-outlined/24/000000/delete-trash.png"></button>';
  tr.appendChild(del);
  return tr;
}
/**
 * remove the previous items from bill on modal minimization.
 */
$('#myModal').on('hide.bs.modal', function (e) {
  $('#bill tr').slice(1).remove();
  cindex = null;
});

/**
 * clear the bill once user clicks genrate bill and update local storage.
 */
function clearBill() {
  let title = document.getElementsByClassName('modal-title')[0].innerText;
  let index = Number(title[6]) - 1;
  var obj = {
    "food": [],
    "items": 0,
    "price": 0
  }
  tables[index] = obj;
  updateMenuView(index);
  localStorage.setItem('tables', JSON.stringify(tables));

}
/**
 * update the bill and local storage when bill's item quantity in changed.
 * can perform both change food no's and removing food from bill.
 */
function updateBill() {
  let foodName;
  let quantity;
  let deleteFlag=false;
  if(event.target.nodeName=='INPUT'){
    foodName = (event.target.parentNode.parentNode).childNodes[1].innerText;
    quantity = event.target.value;
  }else{
    foodName = (event.target.parentNode.parentNode.parentNode).childNodes[1].innerText;
    quantity=0;
    deleteFlag=true;
  }
  let price = null;
  let diff = null;
  let i= null;
  for (key in tables[cindex].food) {
    if ((tables[cindex].food)[key].foodName == foodName) {
      price = tables[cindex].food[key].foodPrice
      diff = Number(quantity) - tables[cindex].food[key].foodQuantity;
      tables[cindex].food[key].foodQuantity = quantity;
      if(deleteFlag){
        tables[cindex].food.splice(key,1);
        (event.target.parentNode.parentNode.parentNode).style.display='none';
      }
      break;
    }
  }
  tables[cindex].items += diff
  tables[cindex].price += Number((diff * price))
  updateMenuView(cindex);
  let total = document.getElementById('bill-total');
  total.innerText = 'Total: ' + tables[cindex].price;
  localStorage.setItem('tables', JSON.stringify(tables));
}