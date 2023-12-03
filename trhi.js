var typed = new Typed(".typing-text", {
  strings: [
        '<span class="dark-purple">NFL attendance</span>', 
        '<span class="orange">NBA draft</span>', 
        '<span class="blue">AI chip prices</span>',
        '<span class="red">TV show metrics</span>',
        '<span class="green">Weather patterns</span>',
        '<span class="black">What you know</span>'
    ],
    typeSpeed: 50,// typing speed
    backSpeed: 50, // erasing speed
    loop: false, // start back after ending typing
    showCursor: true,
      cursorChar: '|',

});

const xanoApiBaseUrl = 'https://x8ki-letl-twmt.n7.xano.io/api:AdRE1MAv';
  const card = document.getElementById("card-form");
  const questionElement = document.querySelector('.question');
  const successMessageCardFlip = document.querySelector(".success-message-card-flip");
  const successMessageCard = document.querySelector(".success-card-content");
  const percentageResult = document.querySelector('.percentage-result');
  const successResult = document.querySelector('.success-result');

function incrementVote(questionId, voteType) {
    // Get the current vote counts
    fetch(`${xanoApiBaseUrl}/question/${questionId}`)
      .then(response => response.json())
      .then(questionData => {
        // Increment the appropriate counter based on the voteType
        const updatedQuestionData = {
          ...questionData,
          [voteType]: questionData[voteType] + 1
        };
  
        // Send the updated vote count back to the server
        fetch(`${xanoApiBaseUrl}/question/${questionId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            // Add any other headers like authorization if needed
          },
          body: JSON.stringify(updatedQuestionData)
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(() => {
          // After updating, re-fetch and refresh the UI with the new data
                //getQuestionsAndDisplayPercentages();
           successMessageCardFlip.style.display = "block"; // Unhide the card
        })
        .catch(error => console.error('Error updating vote:', error));
      })
      .catch(error => console.error('Error fetching current vote count:', error));
  }

  function getQuestionsAndDisplayPercentages() {
    fetch(`${xanoApiBaseUrl}/question`)
      .then(response => response.json())
      .then(questions => {
        if (questions.length === 0) {
          throw new Error('No questions available');
        }
        // Select a random question
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        displayQuestion(randomQuestion);
      })
      .catch(error => console.error('Error:', error));
  }
  
function displayQuestion(question) {
  // Set the question text and calculate the yes percentage
  questionElement.textContent = question.question;
  const totalVotes = question.yes_votes + question.no_votes;
  const successResultText = question.result;
  const yesPercentage = totalVotes > 0 ? (question.yes_votes / totalVotes) * 100 : 0;
  percentageResult.textContent = `${yesPercentage.toFixed(1)}%`;
    successResult.textContent = successResultText;
  // Select the buttons
  const yesButton = card.querySelector('.button-yes');
  const noButton = card.querySelector('.button-no');
  
  // Remove any existing event listeners (if applicable) and add new ones
  yesButton.onclick = () => yesVoteHandler(question);
  noButton.onclick = () => noVoteHandler(question);
}

function yesVoteHandler(question) {
  console.log('Yes button clicked');
  incrementVote(question.id, 'yes_votes');
 // showSuccessCard();
}

function noVoteHandler(question) {
  console.log('No button clicked');
  incrementVote(question.id, 'no_votes');
      //showSuccessCard();
}

function fetchQuestionsAndDisplay(category, displayFunction, apiUrl) {
    fetch(`${xanoApiBaseUrl}/${apiUrl}`)
      .then(response => response.json())
      .then(questions => {
        if (questions.length === 0) {
          throw new Error(`No questions available for ${category}`);
        }
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        displayFunction(randomQuestion);
      })
      .catch(error => console.error(`Error fetching ${category} questions:`, error));
  }

 function displayQuestionVote(question, questionSelector, buttonYesSelector, buttonNoSelector, incrementVoteFunction) {
    const currentQuestion = document.querySelector(questionSelector);
    currentQuestion.textContent = question.question;
  
    const yesButton = document.querySelector(buttonYesSelector);
    const noButton = document.querySelector(buttonNoSelector);
  
    yesButton.onclick = () => incrementVoteFunction(question.id, 'yes_votes');
    noButton.onclick = () => incrementVoteFunction(question.id, 'no_votes');
  }

  function incrementVote(questionId, voteType, apiUrl, successCardSelector) {
    let successCard = document.querySelector(successCardSelector);
    fetch(`${xanoApiBaseUrl}/${apiUrl}/${questionId}`)
      .then(response => response.json())
      .then(questionData => {
        const updatedQuestionData = { ...questionData, [voteType]: questionData[voteType] + 1 };
  
        fetch(`${xanoApiBaseUrl}/${apiUrl}/${questionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedQuestionData)
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(() => successCard.style.display = "block")
        .catch(error => console.error('Error updating vote:', error));
      })
      .catch(error => console.error('Error fetching current vote count:', error));
  }

function fetchRandomQuestionAndDisplay(apiUrl, displayFunction) {
  fetch(`${xanoApiBaseUrl}/${apiUrl}`)
    .then(response => response.json())
    .then(data => {
      const randomQuestion = data[Math.floor(Math.random() * data.length)];
      displayFunction(randomQuestion);
    })
    .catch(error => console.error('Error fetching questions:', error));
}
  

function displayQuestionWithOptions(questionData, selectors, incrementOptionVoteFunction) {
  const { titleSelector, optionsContainerSelector, submitButtonId, itemDivClass, labelClass } = selectors;

  const titleElement = document.querySelector(titleSelector);
  titleElement.textContent = questionData.question; 

  const optionsContainer = document.querySelector(optionsContainerSelector);
  optionsContainer.innerHTML = '';

  const successMessage = document.querySelector('.success-message-grid')
  successMessage.innerHTML = '';

  let totalVotes = 0;
  let optionsCount = 0;
  while (questionData[`option_${optionsCount + 1}`] !== null && questionData[`option_${optionsCount + 1}`] !== undefined) {
    totalVotes += questionData[`option_${optionsCount + 1}_votes`] || 0;
    optionsCount++;
  }

  for (let i = 1; i <= optionsCount; i++) {
    const optionKey = `option_${i}`;
    const optionText = questionData[optionKey];
    if (optionText === null || optionText === undefined) continue;

    const optionVotes = questionData[`option_${i}_votes`] || 0;
    const percentage = totalVotes > 0 ? (optionVotes / totalVotes * 100).toFixed(1) : "0.00";

    createOptionElement(optionText, percentage, optionsContainer, itemDivClass, labelClass, `option_${i}`);
  }

  document.getElementById(submitButtonId).onclick = async function() {
    const selectedCheckboxes = document.querySelectorAll(`${optionsContainerSelector} input[name="option"]:checked`);
    const selectedOptions = Array.from(selectedCheckboxes).map(cb => cb.value.split('_')[1]);
    if (selectedOptions.length === 0) {
      console.error('No options selected');
      return;
    }
    
    for (const optionNumber of selectedOptions) {
      await incrementOptionVoteFunction(questionData.id, optionNumber, apiUrl);
    }
  };
}

function createOptionElement(optionText, percentage, container, itemDivClass, labelClass, optionValue) {
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.name = 'option';
  checkbox.className = 'checkbox_button';
  checkbox.value = optionValue;
  checkbox.id = optionValue;

  const label = document.createElement('label');
  label.htmlFor = optionValue;
  label.className = labelClass;
  label.textContent = optionText;

  const itemDiv = document.createElement('div');
  itemDiv.className = itemDivClass;
  itemDiv.appendChild(checkbox);
  itemDiv.appendChild(label);

  container.appendChild(itemDiv);
}

async function incrementOptionVote(questionId, optionNumber, category) {
  try {
    const apiUrl = `${xanoApiBaseUrl}/${category}/${questionId}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const questionData = await response.json();
    const voteType = `option_${optionNumber}_votes`;
    const updatedQuestionData = {
      ...questionData,
      [voteType]: (questionData[voteType] || 0) + 1
    };

    const updateResponse = await fetch(apiUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedQuestionData)
    });

    if (!updateResponse.ok) {
      throw new Error('Network response was not ok');
    }
    const updatedQuestion = await updateResponse.json();
    console.log('Vote updated', updatedQuestion);
    // Call a function to update the UI here, if necessary
  } catch (error) {
    console.error('Error updating vote:', error);
  }
}


function generateReferenceCode(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('wf-form-reference-code').addEventListener('submit', function(event) {
        event.preventDefault();

        var referenceCode = generateReferenceCode(Math.floor(Math.random() * (8 - 6 + 1) + 6));
        var email = document.getElementById('email-reference-code').value;
        var apiReferenceCode = `${xanoApiBaseUrl}/referencecode`;

        // Send the email and the generated reference code to Xano
        fetch(apiReferenceCode, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email, code: referenceCode }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            document.getElementById('uk-reference').innerText = referenceCode;
            return response.json();
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
    });
});
document.addEventListener('DOMContentLoaded', (event) => {
  getQuestionsAndDisplayPercentages();
   //fetchRandomSportsQuestion();
    fetchQuestionsAndDisplay(
    'Sports', 
    (question) => displayQuestionVote(
        question, 
        '.question-sports', 
        '#button-yes-sports', 
        '#button-no-sports', 
        (id, voteType) => incrementVote(id, voteType, 'sports_q2', '.success-message-card-flip_sports')
      ), 
      'sports_q2'
  );
   chooseRandomFunction()
});
function chooseRandomFunction() {
  // Generate a random number (0 or 1)
  var randomNumber = Math.floor(Math.random() * 2);

  if (randomNumber === 0) {
      fetchRandomQuestionAndDisplay('entertainment', (questionData) => {
        displayQuestionWithOptions(questionData, {
          titleSelector: '.form_entertainment-question',
          optionsContainerSelector: '.form_left-checkbox',
          submitButtonId: 'entertainment-submit',
          itemDivClass: 'item_movie',
          labelClass: 'movie_label'
        }, (questionId, optionNumber) => incrementOptionVote(questionId, optionNumber, 'entertainment'));
      });


      document.querySelector('.card-form-entertainment').style.display = "none"
  } else {
     // getYesOrNoEntertainmentQuestion();
      fetchQuestionsAndDisplay(
      'Entertainment', 
      (question) => displayQuestionVote(
        question, 
        '.question_entertainment', 
        '.button-yes_entertainment', 
        '.button-no_entertainment', 
        (id, voteType) => incrementVote(id, voteType, 'entertainment_q2', '.success-message-card-flip_entertainment')
      ), 
      'entertainment_q2'
    );
      document.querySelector('#card-form-options').style.display = "none"
  }
}
