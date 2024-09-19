// BankAccount class
class BankAccount {
  constructor(owner, currency, pin, interestRate) {
    this.owner = owner;
    this.currency = currency;
    this.pin = pin;
    this._movements = [];
    this._interestRate = interestRate;
    this._approvedLoans = [];
  }

  // Static method to log a welcome message and the current date
  static hello() {
    BankAccount._logMessage(
      `Welcome to our bank! Today's date is ${new Date().toLocaleString()}`
    );
  }

  static _logMessage(message) {
    document.getElementById("console-output").textContent += message + "\n";
  }
  // Method to add a deposit to _movements
  deposit(val) {
    if (val > 0) {
      this._movements.push({ amount: val, date: new Date() });
      BankAccount._logMessage(`Deposited: ${val} ${this.currency}`);
    } else {
      BankAccount._logMessage("Deposit amount must be positive.");
    }
    return this;
  }
  // Method to subtract a withdrawal from _movements
  withdraw(val) {
    if (val > 0 && this._getBalance() >= val) {
      this._movements.push({ amount: -val, date: new Date() });
      BankAccount._logMessage(`Withdrew: ${val} ${this.currency}`);
    } else if (val <= 0) {
      BankAccount._logMessage("Withdrawal amount must be positive.");
    } else {
      BankAccount._logMessage("Insufficient funds.");
    }
    return this;
  }
  // Method to request a loan
  requestLoan(val) {
    if (this._approveLoan(val)) {
      this._approvedLoans.push(val);
      this._movements.push({ amount: val, date: new Date() });
      BankAccount._logMessage(`Loan approved: ${val} ${this.currency}`);
    } else {
      BankAccount._logMessage("Loan request denied.");
    }
    return this;
  }

  // Private method to approve a loan
  _approveLoan(val) {
    return val <= this._getBalance() * 10;
  }

  // Method to calculate interest on the balance
  calculateInterest() {
    const balance = this._getBalance();
    if (balance > 0) {
      const interest = balance * (this._interestRate / 100);
      this._movements.push({ amount: interest, date: new Date() });
      BankAccount._logMessage(`Interest added: ${interest} ${this.currency}`);
    } else {
      BankAccount._logMessage(
        "No interest added because the balance is non-positive."
      );
    }
    return this;
  }

  // Private method to get the current balance
  _getBalance() {
    return this._movements.reduce((acc, mov) => acc + mov.amount, 0);
  }

  // Method to provide account summary
  getAccountSummary() {
    const balance = this._getBalance();
    const totalInterest = this._movements
      .filter((mov) => mov.amount > 0 && this._interestRate > 0)
      .reduce((acc, mov) => acc + (mov.amount * this._interestRate) / 100, 0);

    BankAccount._logMessage(`Account Summary for ${this.owner}:`);
    BankAccount._logMessage(`Currency: ${this.currency}`);
    BankAccount._logMessage(
      `Transactions: ${this._movements
        .map((mov) => `${mov.amount} on ${mov.date.toLocaleString()}`)
        .join(", ")}`
    );
    BankAccount._logMessage(`Current Balance: ${balance} ${this.currency}`);
    BankAccount._logMessage(
      `Total Interest Earned: ${totalInterest} ${this.currency}`
    );
    return this;
  }

  // Getter for movements
  get movements() {
    return this._movements;
  }
}

// Prototype method to sort transactions by date
BankAccount.prototype.sortMovementsByDate = function () {
  this._movements.sort((a, b) => a.date - b.date);
  BankAccount._logMessage("Transactions sorted by date.");
  return this;
};

// SavingsAccount class definition, extending BankAccount
class SavingsAccount extends BankAccount {
  constructor(owner, currency, pin, interestRate, withdrawalLimit) {
    super(owner, currency, pin, interestRate);
    this.withdrawalLimit = withdrawalLimit;
  }

  // Override the withdraw method to enforce the withdrawal limit
  withdraw(val) {
    if (val > this.withdrawalLimit) {
      BankAccount._logMessage(
        `Withdrawal amount exceeds the limit of ${this.withdrawalLimit} ${this.currency}.`
      );
    } else {
      super.withdraw(val);
    }
    return this;
  }
}

// CheckingAccount class definition, extending BankAccount
class CheckingAccount extends BankAccount {
  constructor(
    owner,
    currency,
    pin,
    interestRate,
    overdraftLimit,
    overdraftFee
  ) {
    super(owner, currency, pin, interestRate);
    this.overdraftLimit = overdraftLimit;
    this.overdraftFee = overdraftFee;
  }

  // Override the withdraw method to allow overdraft
  withdraw(val) {
    const balance = this._getBalance();
    if (balance - val < -this.overdraftLimit) {
      BankAccount._logMessage(
        `Withdrawal denied. Exceeds overdraft limit of ${this.overdraftLimit} ${this.currency}.`
      );
    } else {
      super.withdraw(val);
      if (this._getBalance() < 0) {
        this._movements.push({
          amount: -this.overdraftFee,
          date: new Date(),
        });
        BankAccount._logMessage(
          `Overdraft fee of ${this.overdraftFee} ${this.currency} applied.`
        );
      }
    }
    return this;
  }
}

// BusinessAccount class definition, extending BankAccount
class BusinessAccount extends BankAccount {
  constructor(owner, currency, pin, interestRate) {
    super(owner, currency, pin, interestRate * 1.5);
  }

  // Method to process large transactions for business expenses
  processLargeTransaction(val) {
    if (val > 10000) {
      BankAccount._logMessage(
        `Processing large transaction: ${val} ${this.currency}`
      );
      this._movements.push({ amount: -val, date: new Date() });
    } else {
      BankAccount._logMessage(
        "Transaction amount is too small to be processed as a large transaction."
      );
    }
    return this;
  }

  // Method to generate a financial report
  generateReport() {
    const balance = this._getBalance();
    const totalInterest = this._movements
      .filter((mov) => mov.amount > 0 && this._interestRate > 0)
      .reduce((acc, mov) => acc + (mov.amount * this._interestRate) / 100, 0);
    const totalLoans = this._approvedLoans.reduce((acc, loan) => acc + loan, 0);

    BankAccount._logMessage(`Financial Report for ${this.owner}:`);
    BankAccount._logMessage(`Currency: ${this.currency}`);
    BankAccount._logMessage(
      `Transactions: ${this._movements
        .map((mov) => `${mov.amount} on ${mov.date.toLocaleString()}`)
        .join(", ")}`
    );
    BankAccount._logMessage(`Current Balance: ${balance} ${this.currency}`);
    BankAccount._logMessage(
      `Total Interest Earned: ${totalInterest} ${this.currency}`
    );
    BankAccount._logMessage(
      `Total Loans Approved: ${totalLoans} ${this.currency}`
    );
    return this;
  }
}

let currentAccount = null;

function createAccount() {
  const accountType = document.getElementById("account-type").value;
  const owner = document.getElementById("owner").value;
  const currency = document.getElementById("currency").value;
  const pin = document.getElementById("pin").value;
  const interestRate =
    parseFloat(document.getElementById("interest-rate").value) || 0;
  const withdrawalLimit =
    parseFloat(document.getElementById("withdrawal-limit").value) || 1000;
  const overdraftLimit =
    parseFloat(document.getElementById("overdraft-limit").value) || 500;
  const overdraftFee =
    parseFloat(document.getElementById("overdraft-fee").value) || 35;

  let valid = true;

  // Validate inputs
  if (!/^[a-zA-Z\s]+$/.test(owner.trim())) {
    document.getElementById("owner-error").textContent =
      "Owner's name must contain only letters.";
    valid = false;
  } else {
    document.getElementById("owner-error").textContent = "";
  }

  if (!/^\d{4}$/.test(pin)) {
    document.getElementById("pin-error").textContent =
      "PIN must be a 4-digit number.";
    valid = false;
  } else {
    document.getElementById("pin-error").textContent = "";
  }

  if (isNaN(interestRate) || interestRate < 0) {
    document.getElementById("interest-rate-error").textContent =
      "Interest rate must be a positive number.";
    valid = false;
  } else {
    document.getElementById("interest-rate-error").textContent = "";
  }

  if (isNaN(withdrawalLimit) || withdrawalLimit < 0) {
    document.getElementById("withdrawal-limit-error").textContent =
      "Withdrawal limit must be a positive number.";
    valid = false;
  } else {
    document.getElementById("withdrawal-limit-error").textContent = "";
  }

  if (isNaN(overdraftLimit) || overdraftLimit < 0) {
    document.getElementById("overdraft-limit-error").textContent =
      "Overdraft limit must be a positive number.";
    valid = false;
  } else {
    document.getElementById("overdraft-limit-error").textContent = "";
  }

  if (isNaN(overdraftFee) || overdraftFee < 0) {
    document.getElementById("overdraft-fee-error").textContent =
      "Overdraft fee must be a positive number.";
    valid = false;
  } else {
    document.getElementById("overdraft-fee-error").textContent = "";
  }

  if (!valid) return;

  switch (accountType) {
    case "savings":
      currentAccount = new SavingsAccount(
        owner,
        currency,
        pin,
        interestRate,
        withdrawalLimit,
        overdraftLimit,
        overdraftFee
      );
      break;
    case "checking":
      currentAccount = new CheckingAccount(
        owner,
        currency,
        pin,
        interestRate,
        withdrawalLimit,
        overdraftLimit,
        overdraftFee
      );
      break;
    case "business":
      currentAccount = new BusinessAccount(
        owner,
        currency,
        pin,
        interestRate,
        withdrawalLimit,
        overdraftLimit,
        overdraftFee
      );
      break;
    default:
      BankAccount._logMessage("Invalid account type.");
      return;
  }
  BankAccount._logMessage(`Account created: ${owner} (${accountType})`);
}

function performAction() {
  if (!currentAccount) {
    BankAccount._logMessage("No account created.");
    return;
  }

  const action = document.getElementById("action").value;
  const amount = parseFloat(document.getElementById("amount").value) || 0;
  const pinAction = document.getElementById("pin-action").value;

  let valid = true;

  if (!/^\d{4}$/.test(pinAction)) {
    document.getElementById("pin-action-error").textContent =
      "PIN must be a 4-digit number.";
    valid = false;
  } else {
    document.getElementById("pin-action-error").textContent = "";
  }

  if (currentAccount.pin !== pinAction) {
    BankAccount._logMessage("Invalid PIN.");
    valid = false;
  }

  if (!valid) return;

  switch (action) {
    case "deposit":
      currentAccount.deposit(amount);
      break;
    case "withdraw":
      currentAccount.withdraw(amount);
      break;
    case "request-loan":
      currentAccount.requestLoan(amount);
      break;
    case "calculate-interest":
      currentAccount.calculateInterest();
      break;
    case "process-large-transaction":
      if (currentAccount instanceof BusinessAccount) {
        currentAccount.processLargeTransaction(amount);
      } else {
        BankAccount._logMessage(
          "Large transactions are only available for business accounts."
        );
      }
      break;
    case "generate-report":
      if (currentAccount instanceof BusinessAccount) {
        currentAccount.generateReport();
      } else {
        BankAccount._logMessage(
          "Reports are only available for business accounts."
        );
      }
      break;
    default:
      BankAccount._logMessage("Invalid action.");
      return;
  }
  currentAccount.getAccountSummary();
  currentAccount.sortMovementsByDate();
}

BankAccount.hello();
