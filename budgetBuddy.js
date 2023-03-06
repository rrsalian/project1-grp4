(function () {

    const transactions = [];    // array of objects : Objects are list of budget entries and expense objects
    google.charts.load('current', { 'packages': ['corechart'] });   // required for access to google chart 
    google.charts.setOnLoadCallback(drawChart);  // Call google drawchart
    let chart = null;   // Since we do not use local storage initial chart display is off

    let myBudget = new budget(transactions);    // Class initiation - creates , deletes , updates each transaction
    budget.counter = 0; // counter required as a counter for the array

    const select = document.getElementById('expenseText');
    const expenseOptionsArray = getExpenseOptions();    // get Expense type values like entertainment, food etc in an array
    const list = document.getElementById("list");

    const addBudget = document.querySelector(".addBudget");
    addBudget.addEventListener('click', (e) => {
        e.preventDefault();
        const category = e.target.name.toLowerCase();
        const amount = +document.getElementById('budgetAmount').value;

        if (amount <= 0) {  // error handing for budget when amount entered is < 0
            document.getElementById("error_msg_budget").innerHTML =
                "<span>Error: Please enter an amount greater than 0 </span>";
            document.getElementById("budgetAmount").value = null;
        }
        else {  // budget > 0 
            document.getElementById("error_msg_budget").innerHTML = null;
            document.getElementById("error_msg_expense").innerHTML = null;
            document.getElementById("error_msg_history").innerHTML = null;

            const transaction = myBudget.addTransaction(category, '', amount);

            updatePageSummary();   // Update Budget , Expense & Balance values in the Page

            li = document.createElement('li');
            li.classList.add('liItem');

            li.innerHTML = `Budget ${transaction.amount} <button class="delete-btn" value=${transaction.id}>X</button>`;
            list.appendChild(li);
            document.getElementById('budgetAmount').value = null;  // blank out the Budget Amount input after changes are posted          
        }
    });

    const addExpense = document.querySelector(".addExpense");
    addExpense.addEventListener('click', (e) => {
        e.preventDefault();
        let expenseSumArray = [];   // array of objects : expense object consists of id, expense, category, amount  
        const amount = +document.getElementById('expenseAmount').value;
        const currBudget = +document.getElementById('budget').value;
        const currBalance = +document.getElementById('balance').value;
        //console.log(currBalance);
        //console.log(amount);
        //console.log(currBudget);

        if (amount <= 0) {      // error handing for expense when amount entered is < 0
            document.getElementById("error_msg_expense").innerHTML =
                "<span>Error: Please enter an amount greater than 0 </span>";
            document.getElementById("expenseAmount").value = null;
        }
        else if (((currBalance - amount) / currBudget * 100) <= 10) {  // this handles error handling when balance about to reduce to 10 % or below
            document.getElementById("error_msg_expense").innerHTML =
                "<span>Error: Please maintain a balance of more than 10% </span>";
            document.getElementById("expenseAmount").value = null;
        }
        else {  // everything else
            document.getElementById("error_msg_expense").innerHTML = null;
            document.getElementById("error_msg_budget").innerHTML = null;
            document.getElementById("error_msg_history").innerHTML = null;

            const transaction = myBudget.addTransaction("Expense",
                document.getElementById('expenseText').value,
                amount
            );    // each entry is stored in an array of objects

            updatePageSummary();   // Update Page Summary for Budget , Expense & Balance values

            //expenseSumArray = myBudget.getSumByCategory(expenseOptionsArray); // Expense Summary Array of objects by category for use in graph
            //console.log(expenseSumArray);

            li = document.createElement('li');
            li.classList.add('liItem');
            li.innerHTML = `${transaction.text} ${transaction.amount} <button class="delete-btn" value=${transaction.id}>X</button>`;
            list.appendChild(li);

            document.getElementById('expenseAmount').value = null;
            getDataForChart();
        }
    })

    //const deleteBtn = document.querySelector('.delete-btn');
    list.addEventListener('click', (e) => {
        if (e.target.className === 'delete-btn') {
            const arr = e.target.parentElement.innerHTML.split(' ');

            if (arr[0] === "Budget" && myBudget.balance - +arr[1] <= (0.1 * myBudget.budget))
                document.getElementById("error_msg_history").innerHTML =
                    "<span>Error: Balance should be greater than 10% of the total Budget </span>";
            else {
                myBudget.deleteTransaction(e.target.value);
                e.target.parentElement.remove();
                e.target.parentElement.innerHTML = null;
                document.getElementById("error_msg_history").innerHTML = null;
                updatePageSummary();
                getDataForChart();
            }

        };
    })

    // get array list of expense categories from the select input
    function getExpenseOptions() {
        let OptionsArr = [];
        for (let i = 0; i < select.options.length; i++) {
            OptionsArr.push(select.options[i].value);
        }
        return OptionsArr;  // ["entertainment", "food", "clothing", "bills"]
    }

    // Upadate Page summary for Budget , Expense & balance when budget/expenses are adjusted
    function updatePageSummary() {
        document.getElementById('budget').value = myBudget.budget;
        document.getElementById('expense').value = myBudget.expense;
        document.getElementById('balance').value = myBudget.balance;
    }

    function getDataForChart() {

        expenseSumArray = myBudget.getSumByCategory(expenseOptionsArray);
        // data points for google pie chart
        let data = google.visualization.arrayToDataTable([
            ['Expense Type', 'Amount'],
            [expenseSumArray[0].text, +expenseSumArray[0].total],
            [expenseSumArray[1].text, +expenseSumArray[1].total],
            [expenseSumArray[2].text, +expenseSumArray[2].total],
            [expenseSumArray[3].text, +expenseSumArray[3].total],
        ]);

        let options = {
            title: '',
            backgroundColor: "#F0F0F0"
        };
        chart.draw(data, options);

    }

    //Pie Chart code - JI - initially chart won't show since we do not have local storage
    function drawChart() {

        let data = google.visualization.arrayToDataTable([
            ['Expense Type', 'Amount'],
            ['Entertainment', 0],
            ['Food', 0],
            ['Clothing', 0],
            ['Bills', 0],
        ]);

        let options = {
            title: '',
            backgroundColor: "#F0F0F0"
        };

        chart = new google.visualization.PieChart(document.getElementById('piechart'));

        chart.draw(data, options);
    }
    //End of Pie Chart code - JI
}())