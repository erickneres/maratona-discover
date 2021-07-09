const ModalTransaction = {
  open() {
    document.querySelector('.modal-overlay.new-transaction').classList.add('active');
    document.querySelector('.modal').classList.add('active');
  },
  close() {
    document.querySelector('.modal-overlay.new-transaction').classList.remove('active');
    document.querySelector('.modal').classList.remove('active');

    ErrorMessage.closeMessage();
  }
}

const Storage = {
  getTransactions() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
  },

  setTransactions(transactions) {
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions));
  },
}

const Transaction = {
  all: Storage.getTransactions(),

  add(transaction) {
    Transaction.all.unshift(transaction);

    App.reload();
  },

  remove(index) {
    Transaction.all.splice(index, 1);

    App.reload();
  },

  incomes() {
    let income = 0;

    Transaction.all.forEach((transaction) => {
      if (transaction.amount > 0) {
        income += transaction.amount;
      }
    });
    return income;
  },

  expenses() {
    let expense = 0;

    Transaction.all.forEach((transaction) => {
      if (transaction.amount < 0) {
        expense += transaction.amount;
      }
    });
    return expense;
  },

  total() {
    return Transaction.incomes() + Transaction.expenses();
  }
}

const DOM = {
  balanceCards: document.querySelector('#balance-container').children,
  transactionsContainer: document.querySelector('#data-table tbody'),

  showCards() {
    let i = 0;
    let cards = DOM.balanceCards;

    function showCards() {
      setTimeout(function () {
        cards[i].classList.add('active');
        i++;
        if (i < cards.length) {
          showCards();
        }
      }, 100);
    }
    showCards();
  },

  addTransaction(transaction, index) {
    const tr = document.createElement('tr');
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;

    DOM.transactionsContainer.appendChild(tr);
  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense";

    let amount = Utils.formatCurrency(transaction.amount);

    const transactionModel = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img class="remove-button" onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
        </td>
        `;
    return transactionModel;
  },

  updateBalance() {
    document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes());
    document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses());
    document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total());
  },

  clearTrasanctions() {
    DOM.transactionsContainer.innerHTML = "";
  },
}

const Utils = {
  formatAmount(value) {
    value = Number(value) * 100;

    return value;
  },

  formartDate(date) {
    const splittedDate = date.split("-");
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";

    value = String(value).replace(/\D/g, "");

    value = Number(value) / 100;

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })

    return signal + value;
  }
}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

  validateFields() {
    const { description, amount, date } = Form.getValues();

    if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
      throw new Error;
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues();

    amount = Utils.formatAmount(amount);

    date = Utils.formartDate(date);

    return {
      description,
      amount,
      date
    }
  },

  clearFields() {
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },

  submit(event) {
    event.preventDefault();

    try {
      Form.validateFields();
      const transaction = Form.formatValues();
      Transaction.add(transaction);
      Form.clearFields();
      ModalTransaction.close();
    } catch (error) {
      ErrorMessage.showMessage();
    }
  }
}

const ErrorMessage = {
  messageElement: document.querySelector('.message-content'),

  showMessage() {
    this.messageElement.classList.add('showMessage');
  },

  closeMessage() {
    this.messageElement.classList.remove('showMessage');
  }
}

const App = {
  load() {
    DOM.showCards();
  },
  init() {
    Storage.setTransactions(Transaction.all);
    Transaction.all.forEach(DOM.addTransaction);
    DOM.updateBalance();
  },
  reload() {
    DOM.clearTrasanctions();
    App.init();
  }
}

App.load();
App.init();