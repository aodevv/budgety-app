// BUDEGT CONTROLLER
var budgetController = (function () {
    var Expense = function (id, desc, value) {
        this.id = id;
        this.description = desc;
        this.value = value;
        this.perc = -1;
    };

    Expense.prototype.calcPerc = function(totalInc) {
        if(totalInc>0) {this.perc = Math.round((this.value/totalInc)*100)};
    };

    Expense.prototype.getPerc = function() {return this.perc};

    var Income = function (id, desc, value) {
        this.id = id;
        this.description = desc;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        perc: -1
    };

    var calcTotal = (type) => {
        data.totals[type] = data.allItems[type].reduce((acc, cv) => {return acc + cv.value} , 0);
    };

    return {
        addItem: function(type, des, val){
            var newItem, ID;

            ID = (data.allItems[type].length > 0) ? data.allItems[type][data.allItems[type].length-1].id + 1 : 0;

            if(type == 'exp'){
                newItem = new Expense(ID, des, val);
            } else if (type == 'inc'){
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);
            return newItem;

        },

        removeItem: (type, id) => {
            var ids, index;
            ids = data.allItems[type].map((cur) => cur.id);
            index = ids.indexOf(id);

            if(index != -1) data.allItems[type].splice(index, 1);

        },

        calcBuget: () => {
            // Calc inc and exp
            calcTotal('inc');
            calcTotal('exp');

            // Calc budget = inc - exp
            data.budget = data.totals.inc - data.totals.exp; 

            // Calc perc for exp
            if(data.totals.inc) data.perc = Math.round((data.totals.exp / data.totals.inc) * 100);

        },

        calcPerc: () => {
            /**
             * a=20
             * b=
             */

            data.allItems.exp.forEach((cur) => {cur.calcPerc(data.totals.inc)});
        },

        getPerc: () => data.allItems.exp.map((cur) => cur.getPerc()),

        getBudget: () => ({
            budget: data.budget,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            perc: data.perc
        }),

        testing: function(){
            console.log(data);
        }
    }
})();

// UI CONTROLLER
var UIController = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        addBtn: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetValue: ".budget__value",
        budgetIncValue: ".budget__income--value",
        budgetExpValue: ".budget__expenses--value",
        budgetExpPerc: ".budget__expenses--percentage",
        container: '.container',
        expPerc: '.item__percentage'

    }
    
    return{
        getInput: function(){
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                desc: document.querySelector(DOMstrings.inputDesc).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type){
            var markup, element;
            // 1. Create markup
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                markup = `
                <div class="item clearfix" id="inc-${obj.id}">
                <div class="item__description">${obj.description}</div>
                <div class="right clearfix">
                    <div class="item__value">+ ${obj.value}</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                </div>
                </div>
                `;
            }else if(type === 'exp'){
                element = DOMstrings.expensesContainer;
                markup = `
                <div class="item clearfix" id="exp-${obj.id}">
                <div class="item__description">${obj.description}</div>
                <div class="right clearfix">
                        <div class="item__value">- ${obj.value}</div>
                        <div class="item__percentage">21%</div>
                        <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div>
                </div>
                </div>
                `;
            }

            // 2. INSERT into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', markup);

        },

        clearFields: function(){
            var fields = document.querySelectorAll(DOMstrings.inputDesc + ", " + DOMstrings.inputValue);
            fields = Array.prototype.slice.call(fields);
            fields.forEach((current) => current.value = '');
            fields[0].focus();
        },

        displayBudget: (obj) => {
            const {budget, totalInc, totalExp, perc} = obj;
            document.querySelector(DOMstrings.budgetValue).innerHTML = "+ " + budget;
            document.querySelector(DOMstrings.budgetIncValue).innerHTML = '+ ' + totalInc;
            document.querySelector(DOMstrings.budgetExpValue).innerHTML = '- ' +totalExp;
            document.querySelector(DOMstrings.budgetExpPerc).innerHTML = (perc>0) ? perc+'%' : '---';

        },

        deleteItem : (itemID) => {
            var el = document.getElementById(itemID);
            el.parentNode.removeChild(el);
        },

        displayPercs: (percs) => {
            var fields = document.querySelectorAll(DOMstrings.expPerc);

            var nodeListForEach = (list, callback) => {
                for (var i=0; i< list.length; i++){
                    callback(list[i], i);
                }
            };

            nodeListForEach(fields, function(cur, idx) {
                cur.textContent = (percs[idx] > 0) ? percs[idx] + '%' : '---';
            });
        },

        getDOMstrings: function(){
            return DOMstrings;
        }
    }

})();

// GLOBAL APP CONTROLLER
var controller = (function (Bc, UIC) {

    var setupEventListeners = function(){
        var DOM = UIC.getDOMstrings();
        document.querySelector(DOM.addBtn).addEventListener("click", ctrlAddItem);

        document.addEventListener("keypress", function (e) {
              if(e.key === 'Enter'){
                  ctrlAddItem();
              }
          });
        
          document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    }

    var updateBudget = () => {
        // 1. Calc budget
        Bc.calcBuget();

        // 2. Get budegt from modal
        var budget = Bc.getBudget();

        // 3. Display in UI
        //console.log(budget);
        UIC.displayBudget(budget);

    };
    
    var updatePerc = () => {
        // 1. Calc perc
        Bc.calcPerc();

        // 2. Read perc from Bc
        var percs = Bc.getPerc();

        // 3. Update UI with new perc
        UIC.displayPercs(percs);
    };

    var ctrlAddItem = function(){
        var input, newItem;
        // 1. Get the field input data
        input = UIC.getInput();

        if(input.desc && input.value && input.value > 0){

            // 2. Add item to bc
            newItem = Bc.addItem(input.type, input.desc, input.value);

            // 3. Add the item to UI
            UIC.addListItem(newItem, input.type);
            UIC.clearFields();

            // 4. Calc and update budget
            updateBudget();
            updatePerc();
        }


    };

    var ctrlDeleteItem = (event) => {
        var itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID.includes('inc-') || itemID.includes('exp-')){
            [type, id] = itemID.split('-');
            id = parseInt(id);

            // 1. Delete item from data structure
            Bc.removeItem(type, id);

            // 2. Delete from UI
            UIC.deleteItem(itemID);

            // 3. Update and show budegt
            updateBudget();
            updatePerc();
        }

    };

    return{
        init: function(){
            console.log("App started");
            UIC.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                perc: -1
            });
            setupEventListeners();
        }
    }

 
})(budgetController, UIController);


controller.init();


