//get list of ids from api and store them in an array
//get first 9 ids and GET job metadata from api

{
	let jobIds = [];
	let btnClickCount = 0;
	let stack = [];

	const currentlyDisplayIds = [];
	const apiUrl = 'https://hacker-news.firebaseio.com/v0/';
	const yComUrl = 'https://news.ycombinator.com/item?id=';
	const mainContainerDiv = document.getElementById('container');

	const getJobIds = async () => {
		const response = await fetch(`${apiUrl}jobstories.json`);
		const data = await response.json();
		jobIds = data;
	};

	const getJobMetaData = async (ids, totalClicks = 0) => {
		const numberOfIdsToRetrieve = totalClicks * 6 + 9;
		console.log('totalClicks', totalClicks);
		let jobsArray = [];
		let firstNineIds = ids.splice(0, numberOfIdsToRetrieve);
		console.log(firstNineIds);
		await Promise.all(
			firstNineIds.map(async (id) => {
				const response = await fetch(`${apiUrl}/item/${id}.json`);
				const data = await response.json();
				jobsArray.push(data);
			})
		);
		return jobsArray;
	};

	const populateMainDiv = async (data) => {
		await getJobIds();
		const jobData = await getJobMetaData(jobIds);
		jobData.map((item) => {
			const jobCard = document.createElement('div');
			const jobTitle = document.createElement('h2');
			const jobDesc = document.createElement('p');
			const jobDate = document.createElement('p');
			const hiddenSpan = document.createElement('span');

			const title = item.title.substring(0, item.title.indexOf(')') + 1);
			jobTitle.textContent = title;

			const desc = item.title.substring(item.title.indexOf(')') + 1);
			jobDesc.textContent = desc;

			const date = new Date(item.time * 1000);
			jobDate.textContent = moment(date).format('YYYY-MM-DD');

			hiddenSpan.setAttribute('hidden', 'true');
			hiddenSpan.textContent = item.url
				? item.url
				: `${yComUrl}${item.id}`;

			jobCard.classList.add('jobCard');
			jobCard.appendChild(jobTitle);
			jobCard.appendChild(jobDesc);
			jobCard.appendChild(jobDate);
			jobCard.appendChild(hiddenSpan);
			mainContainerDiv.appendChild(jobCard);
		});
	};

	mainContainerDiv.addEventListener('click', function (e) {
		const url = e.target.querySelector('span').innerHTML;
		window.open(url, '_blank');
	});

	const loadMoreBtn = document.getElementById('loadMoreBtn');
	loadMoreBtn.addEventListener('click', async () => {
		btnClickCount++;
		console.log('btn count', btnClickCount);
		const jobData = await getJobMetaData(jobIds, btnClickCount);
		await populateMainDiv(jobData);
	});

	populateMainDiv();
}
