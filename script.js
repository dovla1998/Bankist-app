'use strict';

// Accounts data

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2023-01-26T17:01:17.194Z',
    '2023-01-28T23:36:17.929Z',
    '2023-02-01T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// Functions

const logoutTimer = function () {
  //Set time(5 minutes)
  let time = 120;
  const tick = function () {
    //Convert timer
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    //Print remaining time
    labelTimer.textContent = `${min}:${sec}`;

    //Stop timer and logout at 0
    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Log in to get started';
    }
    //Decrease 1 sec
    time--;
  };

  //Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

//Login
let currentAccount, timer;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  //Find matching account
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === +inputLoginPin.value) {
    //Display UI and welcome message
    labelWelcome.textContent = `Welcome ${currentAccount.owner.split(' ')[0]}`;
    containerApp.style.opacity = '1';

    //Clear inputs
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    //Update UI
    updateUI(currentAccount);
  } else {
    alert('wrong pw');
  }
  //Current
  const now = new Date();
  const options = {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  };
  labelDate.textContent = new Intl.DateTimeFormat(
    currentAccount.locale,
    options
  ).format(now);

  if (timer) clearInterval(timer);
  timer = logoutTimer();
});

const updateUI = function (acc) {
  //ažuriranje prikaza, prosljeđuje se currentacc
  displayMovements(acc);
  calcPrintBalance(acc);
  calcDisplaySummary(acc);
};

//Transfer
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const transferTo = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  inputTransferAmount.value = '';
  inputTransferTo.value = '';
  inputTransferAmount.blur();

  //Check if accounts exists
  //Check if amount < 0
  //Check funds in the balance
  if (
    amount > 0 &&
    amount <= currentAccount.balance &&
    transferTo &&
    transferTo?.username !== currentAccount.username
  ) {
    //Transaction
    currentAccount.movements.push(-amount);
    transferTo.movements.push(amount);

    //Transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    transferTo.movementsDates.push(new Date().toISOString());
  } else {
    alert('Not valid');
  }
  updateUI(currentAccount);
  if (timer) clearInterval(timer);
  timer = logoutTimer();
});

//Display movement dates
const formatMovementDate = function (date, locale) {
  const calcDate = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDate(new Date(), date);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

//Format currencies
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

//Display movements
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  //Sort movements
  const sortMov = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  sortMov.forEach(function (movement, i) {
    const type = movement > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMovement = formatCur(movement, acc.locale, acc.currency);

    const html = `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${formattedMovement}</div>
      </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

//Average values
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(val => val > 0)
    .reduce((acc, income) => acc + income, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);
  const outcomes = acc.movements
    .filter(val => val < 0)
    .reduce((acc, outcome) => acc + outcome, 0);
  labelSumOut.textContent = formatCur(
    Math.abs(outcomes),
    acc.locale,
    acc.currency
  );
  const interest = acc.movements
    .filter(val => val > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(val => val >= 1)
    .reduce((acc, val) => acc + val, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

//Total balance
const calcPrintBalance = function (acc) {
  acc.balance = acc.movements.reduce(function (acc, mov) {
    return acc + mov;
  }, 0);

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

//Generate username
function generateUsername(accounts) {
  accounts.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(val => val[0])
      .join('');
  });
}
generateUsername(accounts);

//Remove account

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
    labelWelcome.textContent = 'Log in to get started';
  } else {
    console.log('Not your acc');
  }
  labelWelcome.textContent = 'Log in to get started';
  inputCloseUsername.value = '';
  inputClosePin.value = '';
  inputTransferAmount.blur();
});

//Loan

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(val => val >= amount * 0.1)) {
    setTimeout(() => {
      //Add movement
      currentAccount.movements.push(amount);

      //Add loan date

      currentAccount.movementsDates.push(new Date().toISOString());

      //Update UI
      updateUI(currentAccount);
    }, 2000);
    inputLoanAmount.value = '';
    inputLoanAmount.blur();

    //Reset timer
    if (timer) clearInterval(timer);
    timer = logoutTimer();
  }
});

let sorted = false;

btnSort.addEventListener('click', function (e) {
  e.preventDefault;
  //Unsort if clicked again
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;

  //Reset timer
  if (timer) clearInterval(timer);
  timer = logoutTimer();
});
