//Geme start!
const tttGame = new Game();
tttGame.gameStart();

function Game() {
  const board = new Board();
  const play = new Play(board);
  const _matchPartner = document.querySelectorAll('input[name=opponent-type]');
  const _modal = document.querySelector('#game-result-modal');
  const _modalClose = document.querySelector('.modal-close');
  const _btnBack = document.querySelector('#get-back');

  //Modal Close
  document.onclick = function (event) {
    if (event.target === _modal || event.target === _modalClose) {
      _modal.style.display = 'none';
    }
  };

  //Start Game
  this.gameStart = function () {
    _setPartner();
    play.getClkPosition();
  };

  // Set player from radio buttons
  function _setPartner() {
    _matchPartner.forEach((el) =>
      el.addEventListener('click', (e) => {
        let _headerDescOfPartner = document.querySelector('#matchpartner');

        if (e.target.id === 'human') {
          play.setPartnerId('human');
          _headerDescOfPartner.innerHTML = 'with Human';
          _btnBack.disabled = false;
        } else {
          play.setPartnerId('computer');
          _headerDescOfPartner.innerHTML = 'with Computer';
          _btnBack.disabled = true;
        }
        if (board.history.length > 0) {
          const _isReset = confirm(
            'You are playing game. Do you still want to reset this game?'
          );
          if (_isReset) play.resetGame();
          else return;
        }
      })
    );
  }
}

function Board() {
  this.positions = Array.from(document.querySelectorAll('.board-cell'));
  this.history = [];

  //   push data into array to save history
  this.setHistory = function (putPosition) {
    this.history.push(parseInt(putPosition));
  };

  //   delete data into array to get back
  this.getHistory = function () {
    return this.history.pop();
  };

  // clear history
  this.resetHistory = function () {
    this.history = [];
    this.positions.forEach((el) => (el.innerText = ''));
  };

  //check winner
  this.chkWinnder = function () {
    let isWin = false;
    const WINNING_COMBO = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    const positions = this.positions;
    WINNING_COMBO.forEach((combo) => {
      const p0Text = positions[combo[0]].innerText;
      const p1Text = positions[combo[1]].innerText;
      const p2Text = positions[combo[2]].innerText;
      const isWinningCombo =
        p0Text !== '' && p0Text === p1Text && p1Text === p2Text;
      if (isWinningCombo) {
        isWin = true;
      }
    });

    return isWin;
  };
}

function Play(board) {
  let _partnerType = 'human';
  //   Marker for each player X or O, the you will get 'O'
  let _marker = 'O';
  let _isPlayYou = true;
  let _isBack = false;
  let _isNewGame = false;
  const _btnBack = document.querySelector('#get-back');

  this.setPartnerId = function (partner) {
    _partnerType = partner;
  };

  this.getClkPosition = function () {
    board.positions.forEach((el) => {
      el.addEventListener('click', _takeTurn);
    });
  };

  this.resetGame = function () {
    board.resetHistory();
    _isNewGame = true;
    _marker = 'O';
    _isPlayYou = true;
    _isBack = false;
    _btnBack.disabled = false;
  };

  function _takeTurn(event) {
    let _targetText = event.target.innerText;
    _isNewGame = false;

    if (_targetText === '') {
      event.target.innerText = _marker;
      board.setHistory(event.target.id);
      _marker = _marker === 'O' ? 'X' : 'O';
      _isBack = false;

      if (_partnerType === 'computer') {
        if (board.history.length > 0) _autoPlay();
        _isPlayYou = true;
        _marker = 'O';
      }
    } else {
      return;
    }
    _handleBack();
    _endGame();

    if (_partnerType === 'computer') {
      _btnBack.disabled = true;
    } else {
      _btnBack.disabled = !_isPlayYou ? 'false' : _isBack;
    }
    if (!_isNewGame) _isPlayYou = _isBack ? _isPlayYou : !_isPlayYou;
  }

  function _autoPlay() {
    let availPos = board.positions.filter((p) => p.innerText === '');
    const getRandomPos = Math.floor(Math.random() * (availPos.length - 0));
    const _modal = document.querySelector('.modal-wait');
    _modal.style.display = 'block';

    const calcCom = new Promise((res, rej) => {
      setTimeout(res, 2000);
    });

    calcCom.then(() => {
      if (board.history.length < 9 && !_isNewGame) {
        availPos[getRandomPos].innerText = 'X';
        board.setHistory(getRandomPos + 1);
      }
      _modal.style.display = 'none';
      _endGame();
    });
  }

  function _handleBack() {
    if (!_isPlayYou) {
      _btnBack.disabled = true;
      _isBack = false;
    } else {
      _btnBack.onclick = function () {
        if (board.history.length === 0) return;
        const lastPosition = board.getHistory();
        document.getElementById(lastPosition).innerText = '';
        _btnBack.disabled = true;
        _isPlayYou = true;
        _isBack = true;
        _marker = 'O';
      };
    }
  }

  _endGame = () => {
    const isGetWinner = board.chkWinnder();
    const isEvenGame = board.history.length === 9 && !board.chkWinnder();

    if (isGetWinner || isEvenGame) {
      //get winner and Game end OR even Game
      const modal = document.querySelector('#game-result-modal');
      const modalBody = document.querySelector('.modal-content');
      const modalMessage = () => {
        let message;
        if (isGetWinner)
          message = `<img src='./assets/${
            _isPlayYou ? 'win.svg' : 'lose.svg'
          }'><h1> You ${_isPlayYou ? 'Win' : 'Lose'}!</h1>`;
        else if (isEvenGame)
          message = `<img src='./assets/even.svg'><h1>Even Game!</h1>`;
        console.log(message);
        return message;
      };

      modalBody.innerHTML = modalMessage();
      modal.style.display = 'block';
      this.resetGame();
    }
  };
}
