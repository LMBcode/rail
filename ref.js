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

  function fetchRandomQuestionAndDisplay() {
    fetch(`${xanoApiBaseUrl}/entertainment`)
      .then(response => response.json())
      .then(data => {
        // Randomly select one question from the array
        const randomQuestion = data[Math.floor(Math.random() * data.length)];
        displayQuestionWithOptions(randomQuestion);
      })
      .catch(error => console.error('Error fetching questions:', error));
  }
  
  function displayQuestionWithOptions(questionData) {

    // Create a title for the question
    const titleElement = document.querySelector('.form_entertainment-question');
    titleElement.textContent = questionData.question; 
    
    const optionsContainer = document.querySelector('.form_left-checkbox');
  optionsContainer.innerHTML = ''; // Clear existing options
  
  const successMessage = document.querySelector('.success-message-grid')
  // Ensure the success message grid is cleared properly
  successMessage.innerHTML = '';

    let totalVotes = 0;
    let optionsCount = 0;
    // Determine the number of options and total votes, excluding null values
    while (questionData[`option_${optionsCount + 1}`] !== null && questionData[`option_${optionsCount + 1}`] !== undefined) {
        totalVotes += questionData[`option_${optionsCount + 1}_votes`] || 0;
        optionsCount++;
    }
  // Loop through each option in the questionData
  for (let i = 1; i <= optionsCount; i++) {
    const optionKey = `option_${i}`;
    const optionText = questionData[optionKey];
    // Skip any option that is null or undefined
    if (optionText === null || optionText === undefined) {
        continue;
    }
    
    const optionVotes = questionData[`option_${i}_votes`] || 0;
    const percentage = totalVotes > 0 ? (optionVotes / totalVotes * 100).toFixed(1) : 		"0.00";
    
    console.log(`${optionText} - ${percentage}%`);
    const percentageLabel = document.createElement('div');
    percentageLabel.className = 'percentage-label';
    percentageLabel.textContent = `${percentage}%`;

    // Create a div for the movie name
    const movieName = document.createElement('div');
    movieName.className = 'movie-name';
    movieName.textContent = optionText;

    // Combine the movie name and percentage label
    const movieContainer = document.createElement('div');
    movieContainer.appendChild(movieName);
    movieContainer.appendChild(percentageLabel);

    // Append the combined movie container to the success message
    successMessage.appendChild(movieContainer);
    // Create a new div for the item_movie
    const itemMovieDiv = document.createElement('div');
    itemMovieDiv.className = 'item_movie';


    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'option';
    checkbox.className = 'checkbox_button';
    checkbox.value = `option_${i}`;
    checkbox.id = `option_${i}`;

    const label = document.createElement('label');
    label.htmlFor = `option_${i}`;
    label.className = 'movie_label';
    label.textContent = optionText;

    // Append the radio button and label to the item_movie div
    itemMovieDiv.appendChild(checkbox);
    itemMovieDiv.appendChild(label);

    // Append the item_movie div to the container
    optionsContainer.appendChild(itemMovieDiv);
    }
    const submitButton = document.getElementById('entertainment-submit');
  submitButton.onclick = async function() {
    const selectedCheckboxes = document.querySelectorAll('input[name="option"]:checked');
    const selectedOptions = Array.from(selectedCheckboxes).map(cb => cb.value.split('_')[1]);
    if (selectedOptions.length === 0) {
      console.error('No options selected');
      return;
    }
    
    // Await the completion of each vote increment before continuing to the next
    for (const optionNumber of selectedOptions) {
      await incrementOptionVote(questionData.id, optionNumber);
    }
  
    // After all votes have been incremented, you can refresh the UI as needed
  };

 }
 

async function incrementOptionVote(questionId, optionNumber) {
  try {
    const response = await fetch(`${xanoApiBaseUrl}/entertainment/${questionId}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const questionData = await response.json();
    const voteType = `option_${optionNumber}_votes`;
    const updatedQuestionData = {
      ...questionData,
      [voteType]: (questionData[voteType] || 0) + 1
    };

    const updateResponse = await fetch(`${xanoApiBaseUrl}/entertainment/${questionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
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
      fetchRandomQuestionAndDisplay();
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
