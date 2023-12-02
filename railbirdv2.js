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
  const questionElement = card.querySelector('.question');
  const successMessageCardFlip = card.querySelector(".success-message-card-flip");
  const successMessageCard = successMessageCardFlip.querySelector(".success-card-content");
  const percentageResult = successMessageCard.querySelector('.percentage-result');
  const successResult = successMessageCard.querySelector('.success-result');

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
    
    const optionsContainer = document.querySelector('.form_left');
  optionsContainer.innerHTML = ''; // Clear existing options
  
  const successMessage = document.querySelector('.success-message-grid')
  // Ensure the success message grid is cleared properly
  successMessage.innerHTML = '';

    let totalVotes = 0;
    for (let i = 1; i <= 4; i++) {
      totalVotes += questionData[`option_${i}_votes`] || 0;
    }
  // Loop through each option in the questionData
  for (let i = 1; i <= 4; i++) {
    const optionKey = `option_${i}`;
    const optionText = questionData[optionKey];
    if (!optionText) {
      console.error(`Option text for ${optionKey} not found`);
      continue; // Skip this iteration if the option text does not exist
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

    // Create the radio button
    const radioButton = document.createElement('input');
    radioButton.type = 'radio';
    radioButton.name = 'movie'; // All radio buttons should share the same 'name'
    radioButton.className = 'movie_radio-button';
    radioButton.id = `movie_option_${i}`; // Unique ID for each radio button

    // Create the label and associate it with the radio button
    const label = document.createElement('label');
    label.htmlFor = `movie_option_${i}`;
    label.className = 'movie_label';
    label.textContent = optionText;

    // Append the radio button and label to the item_movie div
    itemMovieDiv.appendChild(radioButton);
    itemMovieDiv.appendChild(label);

    // Append the item_movie div to the container
    optionsContainer.appendChild(itemMovieDiv);
    }
		const submitButton = document.getElementById('entertainment-submit');
		submitButton.addEventListener('click', function() {
  const selectedOptionInput = document.querySelector('input[name="movie"]:checked');
  if (!selectedOptionInput) {
    console.error('No option selected');
    return; // Stop the function if no option is selected
  }
  // This will get '1', '2', etc., based on which radio button is selected
  const selectedOptionNumber = selectedOptionInput.id.split('_')[2];
  incrementOptionVote(questionData.id, selectedOptionNumber);
  
});

 }
 
 
function incrementOptionVote(questionId, optionNumber) {
  // Fetch the current question data first
  fetch(`${xanoApiBaseUrl}/entertainment/${questionId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(questionData => {
      // Prepare the updated data with incremented vote count
      const voteType = `option_${optionNumber}_votes`; // e.g., option_1_votes
      const updatedQuestionData = {
        ...questionData,
        [voteType]: (questionData[voteType] || 0) + 1 // Increment the vote count safely
      };

      // Send the updated vote count back to the server
      return fetch(`${xanoApiBaseUrl}/entertainment/${questionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Add any other headers like authorization if needed
        },
        body: JSON.stringify(updatedQuestionData)
      });
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(updatedQuestion => {
      console.log('Vote updated', updatedQuestion);
      // Call a function to update the UI here, if necessary
    })
    .catch(error => console.error('Error updating vote:', error));
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


let currentSportsQuestionId = null; // This variable will hold the current sports question ID


function fetchRandomSportsQuestion() {
  fetch(`${xanoApiBaseUrl}/sports`)
    .then(response => {
      console.log(response); // Log the raw response
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log(data); // Log the data to see if it's what you expect
      if (data.length === 0) {
        throw new Error('No sports questions available');
      }
      // Randomly select one question from the array
      const randomQuestion = data[Math.floor(Math.random() * data.length)];
      currentSportsQuestionId = randomQuestion.id; // Store the ID
      displaySportsQuestion(randomQuestion);
    })
    .catch(error => console.error('Error fetching sports questions:', error));
}

function displaySportsQuestion(question) {
  const sportQuestionElement = document.querySelector('#sports-question');
  if (sportQuestionElement) {
    sportQuestionElement.textContent = question.question;
     const resultText = document.querySelector('#result-text')
      resultText.textContent = question.resultText
  } else {
    console.error('Sports question element not found on the page');
  }
}

function calculateAveragePercentage() {
  fetch(`${xanoApiBaseUrl}/sports_percentage`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(records => {
      console.log('All records:', records); // Log all records for debugging
      const filteredRecords = records.filter(record => record.sports_id === currentSportsQuestionId);
      console.log('Filtered records:', filteredRecords); // Log filtered records

      let totalPercentage = 0;
      filteredRecords.forEach(record => {
        totalPercentage += record.percentage;
      });

      const averagePercentage = filteredRecords.length > 0 ? totalPercentage / filteredRecords.length : 0;
      console.log(`Average Percentage for sports_id ${currentSportsQuestionId}: ${averagePercentage.toFixed(1)}%`);
      // Optionally, update this average percentage in the UI
      const averagePercentageText = document.querySelector('#sports_percentage-text')
      averagePercentageText.textContent = `${averagePercentage.toFixed(1)}%`
    })
    .catch(error => console.error('Error fetching or calculating average percentage:', error));
}



document.getElementById('sports-submit').addEventListener('click', function() {
  const rangeInput = document.querySelector('[fs-cmsfilter-field="price"]');
  const sliderValue = parseInt(rangeInput.value, 10); // Ensure it's an integer

  if (currentSportsQuestionId === null) {
    console.error('No current sports question ID is set');
    return; // Exit the function if we don't have a current sports question ID
  }
  calculateAveragePercentage()

  // Create the data object to send
  const dataToSend = {
    sports_id: currentSportsQuestionId,
    percentage: sliderValue
  };

  // Perform the POST request to add a new record
  fetch(`${xanoApiBaseUrl}/sports_percentage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dataToSend)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(newRecord => {
    console.log('New record added to sports_percentage', newRecord);
  })
  .catch(error => console.error('Error posting new percentage record:', error));
});

document.addEventListener('DOMContentLoaded', (event) => {
  getQuestionsAndDisplayPercentages();
  fetchRandomQuestionAndDisplay();
  fetchRandomSportsQuestion()
});
