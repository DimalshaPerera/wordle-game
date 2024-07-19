const letters = document.querySelectorAll(".scoreboard-letter");
const loadingDiv = document.querySelector(".info-bar");
let done = false;

const ANSWER_LENGTH = 5;
const ROUNDS = 6;

async function init() {
  let currentGuess = "";
  let currentRow = 0;
  let isLoading = true;
  // Step 1: Fetch the data from the API
  const res = await fetch(
    "https://words.dev-apis.com/word-of-the-day?random=1"
  );
  // Step 2: Parse the JSON response
  const resObj = await res.json();
  // Step 3: Extract the word and convert it to uppercase
  const word = resObj.word.toUpperCase();
  const wordParts = word.split("");
  isLoading = false;
  setLoading(false);

  console.log(word);
  // user adds a letter to the current guess
  function addLetter(letter) {
    if (currentGuess.length < ANSWER_LENGTH) {
      //add letter to the end
      currentGuess += letter;
    } else {
      //replace the last letter
      currentGuess =
        currentGuess.substring(0, currentGuess.length - 1) + letter;
    }
    letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText =
      letter;
  }

  //user tries to enter a guess
  async function commit() {
    if (currentGuess.length !== ANSWER_LENGTH) {
      //do nothing
      return;
    }
    isLoading = true;
    setLoading(true);
    //FOCUSS ON THIS TMRW
    const res = await fetch("https://words.dev-apis.com/validate-word", {
      method: "POST",
      body: JSON.stringify({ word: currentGuess }),
    });
    const resObj = await res.json();
    const validWord = resObj.validWord;
    //const{validword}=resobj;

    isLoading = false;
    setLoading(false);

    if (!validWord) {
      markInvalidWord();
      return;
    }

    const guessParts = currentGuess.split("");
    const map = makeMap(wordParts);

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) {
        letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
        map[guessParts[i]]--;
      }
    }
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) {
        //do nothing we did it in prevcode.
      } else if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0) {
        letters[currentRow * ANSWER_LENGTH + i].classList.add("close");
        map[guessParts[i]]--;
      } else {
        letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
      }
    }
    currentRow++;

    if (currentGuess === word) {
      //win
      alert("you win!");
      done = true;
      document.querySelector(".title").classList.add("winner");
    } else if (currentRow === ROUNDS) {
      alert(`You lose, the word was '${word}'`);
      done = true;
    }
    currentGuess = "";
  }

  function backspace() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = "";
  }
  function markInvalidWord() {
    // alert("not a valid word");
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid");
      // Execute the following function after a delay of 10 milliseconds
      setTimeout(
        () => letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid"),
        10
      );
    }
  }
  document.addEventListener("keydown", function handleKeyPress(event) {
    if (done || isLoading) {
      //do nothing
      return;
    }

    const action = event.key;

    if (action === "Enter") {
      commit();
    } else if (action === "Backspace") {
      backspace();
    } else if (isLetter(action)) {
      addLetter(action.toUpperCase());
    } else {
      //do nothing
    }
  });
}

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}
function setLoading(isLoading) {
  loadingDiv.classList.toggle("show", isLoading);
}
function makeMap(array) {
  const obj = {}; // Create an empty object to store the letter counts
  for (let i = 0; i < array.length; i++) {
    const letter = array[i]; // Get the current element (letter) from the array

    if (obj[letter]) {
      // Check if the letter already exists in the object
      obj[letter]++; // If it exists, increment its count
    } else {
      obj[letter] = 1; // If it doesn't exist, initialize its count to 1
    }
  }
  return obj; // Return the object with the letter counts
}
init();
