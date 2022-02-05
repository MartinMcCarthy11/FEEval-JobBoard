//get list of ids from api and store them in an array
//get first 9 ids and GET job metadata from api

{
	let jobIds = [];
	let stack = [];

	const apiUrl = 'https://hacker-news.firebaseio.com/v0/';
	const yComUrl = 'https://news.ycombinator.com/item?id=';
	const mainContainerDiv = document.getElementById('container');

	const getJobIds = async () => {
		const response = await fetch(`${apiUrl}jobstories.json`);
		const data = await response.json();
		jobIds = data;
	};

	const getJobMetaData = async (ids) => {
		let idsToRender;
		let jobsArray = [];
		//keep track of the last number of jobs to show == stack
		//splice from that number => 6
		//pass that value to fetch
		//replace stack[0] with new total number of jobs
		if (stack.length === 0) {
			idsToRender = ids.splice(0, 9);
			stack.push(idsToRender);
		} else {
			idsToRender = ids.splice(stack[0], stack[0] + 6);
			stack.pop();
			stack.push(idsToRender);
		}

		console.log(idsToRender);
		await Promise.all(
			idsToRender.map(async (id) => {
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
		console.log(jobData);
		jobData.map((item) => {
			const jobCard = document.createElement('div');
			const jobTitle = document.createElement('h2');
			const jobDesc = document.createElement('p');
			const jobDate = document.createElement('p');
			const hiddenSpan = document.createElement('span');

			let title = '';
			console.log(item.title);
			if (item.title.indexOf(')') === -1) {
				const tempArr = item.title.split(' ');
				title = tempArr[0];
				tempArr.shift();
				item.title = tempArr.join(' ');
			} else {
				title = item.title.substring(0, item.title.indexOf(')') + 1);
			}
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
		const jobData = await getJobMetaData(jobIds);
		await populateMainDiv(jobData);
	});

	populateMainDiv();
}
