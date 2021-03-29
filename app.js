// BUDEGT CONTROLLER
var budgetController = (function () {
    var Expense = function (id, desc, value) {
        this.id = id;
        this.description = desc;
        this.value = value;
    };
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

        calcBuget: () => {
            // Calc inc and exp
            if(data.allItems.inc.length) calcTotal('inc');
            if(data.allItems.exp.length) calcTotal('exp');

            // Calc budget = inc - exp
            data.budget = data.totals.inc - data.totals.exp; 

            // Calc perc for exp
            if(data.totals.inc) data.perc = Math.round((data.totals.exp / data.totals.inc) * 100);

        },

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
        budgetExpPerc: ".budget__expenses--percentage"

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
                <div class="item clearfix" id="income-${obj.id}">
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
                <div class="item clearfix" id="expense-${obj.id}">
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
          })
    }

    var updateBudget = () => {
        // 1. Calc budget
        Bc.calcBuget();

        // 2. Get budegt from modal
        var budget = Bc.getBudget();

        // 3. Display in UI
        console.log(budget);
        UIC.displayBudget(budget);

    }    

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

