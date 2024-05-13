document.addEventListener('DOMContentLoaded', () => {

    const divs = document.getElementsByClassName('expense-user');
    for (let i = 0; i < divs.length; i++) {
        divs[i].addEventListener('click', function () {
            window.location.href = '/edit-transaction';
        });
    }
    loadEventInfomation();
});

function loadEventInfomation() {
    const eventButton = document.getElementsByName('event-id')[0];
    const request = indexedDB.open('eventsDB', 1);

    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(['events'], 'readonly');
        const objectStore = transaction.objectStore('events');
        const request = objectStore.getAll();

        request.onsuccess = function (event) {
            const events = event.target.result;
            const infoEvent = events.find(event => event.id === eventButton.id);
            eventButton.textContent = infoEvent.event_name;
            const nameContainer = document.getElementById('name-list');
            nameContainer.innerHTML = `<li class="py-4">
                <div class="flex items-center">
                    <div class="flex-1 min-w-0 ms-4">
                        <p class="text-sm font-medium text-gray-900 truncate dark:text-white">
                            ${infoEvent.participant_name}
                        </p>
                    </div>
                    <div class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                        <span class="bg-green-100 text-green-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">   0.00 USD</span>
                    </div>
                </div>
            </li>`

            infoEvent.friends.forEach(friend => {
                const newLi = document.createElement('li');
                newLi.classList.add('py-4');
                newLi.innerHTML = `
                    <div class="flex items-center">
                        <div class="flex-1 min-w-0 ms-4">
                            <p class="text-sm font-medium text-gray-900 truncate dark:text-white">
                                ${friend}
                            </p>
                        </div>
                        <div class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                            <span class="bg-green-100 text-green-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">   0.00 USD</span>
                        </div>
                    </div>
                `
                nameContainer.appendChild(newLi);
            })
        };
    };


}