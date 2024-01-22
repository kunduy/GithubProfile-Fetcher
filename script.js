const repositoriesPerPage = 9;
  const accessToken = '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';
  let currentPage = 1;
  let repositories = [];

  function showLoader() {
    document.getElementById('loader').style.display = 'block';
  }

  function hideLoader() {
    document.getElementById('loader').style.display = 'none';
  }

  function fetchRepositories() {
    const username = document.getElementById('username').value;
    const repositoriesList = document.getElementById('repositories-list');
    const pagination = document.getElementById('pagination');
    const displayedUsername = document.getElementById('displayedUsername');
    const userAvatar = document.getElementById('user-avatar');

    if (!username.trim()) {
      repositoriesList.innerHTML = '<p>Please enter a valid username.</p>';
      return;
    }

    // Show loader during API call
    showLoader();

    // Clear previous user details
    repositoriesList.innerHTML = '';
    pagination.innerHTML = '';

    // Fetch user details including avatar
    $.ajax({
      url: `https://api.github.com/users/${username}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      success: function (userDetails) {
        // Update user avatar
        userAvatar.src = userDetails.avatar_url;

        // Display username
        displayedUsername.textContent = userDetails.login;

        // Fetch repositories
        fetchUserRepositories(username);
      },
      error: function (xhr, status, error) {
        console.error('Error fetching user details:', error);
        repositoriesList.innerHTML = '<p>Error fetching user details. Please try again later.</p>';
        // Hide loader on error
        hideLoader();
      }
    });
  }

  function fetchUserRepositories(username) {
    const repositoriesList = document.getElementById('repositories-list');

    // Fetch user repositories
    $.ajax({
      url: `https://api.github.com/users/${username}/repos`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      success: function (fetchedRepositories) {
        repositories = fetchedRepositories;
        const totalPages = Math.ceil(repositories.length / repositoriesPerPage);
        displayRepositories(currentPage);
        displayPagination(totalPages);
        // Hide loader on success
        hideLoader();
      },
      error: function (xhr, status, error) {
        console.error('Error fetching repositories:', error);
        repositoriesList.innerHTML = '<p>Error fetching repositories. Please try again later.</p>';
        // Hide loader on error
        hideLoader();
      }
    });
  }

  function fetchRepoDetails(languagesUrl) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: languagesUrl,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        success: function (languages) {
          resolve(languages);
        },
        error: function (xhr, status, error) {
          console.error('Error fetching repository languages:', error);
          reject(error);
        }
      });
    });
  }

  function displayRepositories(page) {
    const repositoriesList = document.getElementById('repositories-list');
    const startIndex = (page - 1) * repositoriesPerPage;
    const endIndex = startIndex + repositoriesPerPage;
    const displayedRepositories = repositories.slice(startIndex, endIndex);

    repositoriesList.innerHTML = '';

    displayedRepositories.forEach(repo => {
      const projectCard = document.createElement('div');
      projectCard.className = 'project-card';

      const projectName = document.createElement('h3');
      projectName.textContent = repo.name;

      const projectDetails = document.createElement('span');
      projectDetails.className = 'project-details';
      projectDetails.textContent = repo.description || 'No description available';

      const topicsSection = document.createElement('div');
      topicsSection.className = 'topics-section';

      if (repo.topics && repo.topics.length > 0) {
        repo.topics.forEach(topic => {
          const topicSpan = document.createElement('span');
          topicSpan.textContent = topic;
          topicSpan.className = 'topic-span';
          topicsSection.appendChild(topicSpan);
        });
      }

      // Fetch details of the repository using the languages API
      fetchRepoDetails(repo.languages_url)
        .then(languages => {
          for (const lang in languages) {
            if (languages.hasOwnProperty(lang)) {
              const langSpan = document.createElement('span');
              langSpan.textContent = `${lang} `;
              langSpan.className = 'language-span';
              projectDetails.appendChild(langSpan);
            }
          }
        })
        .catch(error => {
          console.error('Error fetching repository languages:', error);
        });

      projectCard.appendChild(projectName);
      projectCard.appendChild(projectDetails);
      projectCard.appendChild(topicsSection);

      repositoriesList.appendChild(projectCard);
    });
  }

  function displayPagination(totalPages) {
    const pagination = document.getElementById('pagination');

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Older';
    prevButton.classList.add('prev-next');
    prevButton.addEventListener('click', function () {
      if (currentPage > 1) {
        currentPage--;
        displayRepositories(currentPage);
      }
    });
    pagination.appendChild(prevButton);

    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement('button');
      pageButton.textContent = i;
      pageButton.addEventListener('click', function () {
        currentPage = i;
        displayRepositories(currentPage);
      });
      pagination.appendChild(pageButton);
    }

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Newer';
    nextButton.classList.add('prev-next');
    nextButton.addEventListener('click', function () {
      if (currentPage < totalPages) {
        currentPage++;
        displayRepositories(currentPage);
      }
    });
    pagination.appendChild(nextButton);
  }