import config from '../config.js';

firebase.initializeApp(config);
const messaging = firebase.messaging();

messaging
    .requestPermission()
    .then(() => {
        console.log("Notifications allowed")
        return messaging.getToken();
    })
    .then(token => {
        console.log("Token Is : " + token)
    })
    .catch(err => {
        console.log("No permission to send push", err);
    });

// messaging.onMessage(payload => {
//     console.log("Message received. ", payload);
//     const { title, ...options } = payload.notification;
// });

messaging.onMessage(function(payload) {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon,
    };
    // console.log(notificationTitle,notificationOptions)

    if (!("Notification" in window)) {
        console.log("This browser does not support system notifications.");
    } else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        var notification = new Notification(notificationTitle,notificationOptions);
        notification.onclick = function(event) {
            event.preventDefault();
            window.open(payload.notification.click_action , '_blank');
            notification.close();
        }
    }
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            navigator.serviceWorker.register('/serviceWorker.js')
        } catch (error) {
            console.log('Service Worker Registration Failed to FCM');
        }
    })
}

function checkIfPushIsEnabled() {
    //---check if push notification permission has been denied by the user---
    if (Notification.permission === 'denied') {
        alert('User has blocked push notification.');
        return;
    }
    //---check if push notification is supported or not---
    if (!('PushManager' in window)) {
        alert('Sorry, Push notification is ' + 'not supported on this browser.');
        return;
    }
    //---get push notification subscription if serviceWorker is registered and ready---
    navigator.serviceWorker.ready
        .then(function (registration) {
            registration.pushManager.getSubscription()
                .then(function (subscription) {
                    if (subscription) {
                        //---user is currently subscribed to push---
                        console.log('User is currently subscribed to push.');
                    }
                    else {
                        //---user is not subscribed to push---
                        console.log('User is not subscribed to push');
                    }
                })
                .catch(function (error) {
                    console.error('Error occurred enabling push ', error);
                });
        });
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

//---subscribe to push notification---
function subscribeToPushNotification() {
    navigator.serviceWorker.ready
        .then(function(registration) {
            if (!registration.pushManager) {
                alert('This browser does not ' + 'support push notification.');
                return false;
            }
            //---to subscribe push notification using pushmanager---
            registration.pushManager.subscribe(
                //---always show notification when received---
                {
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array('BIFB0r53I7areXNEPiVjHexoGN3Ybgp5Wte-E8Q2XK2_Wp-vleoQiXTJBRSIvAUWoqeRjmK5OMuQH0rzwkRHiaY')
                }
            )
                .then(function (subscription) {
                    console.log('Push notification subscribed.');
                    console.log(subscription);
                })
                .catch(function (error) {
                    console.error('Push notification subscription error: ', error);
                });
        })
}

//---unsubscribe from push notification---
function unsubscribeFromPushNotification() {
    navigator.serviceWorker.ready
        .then(function(registration) {
            registration.pushManager.getSubscription()
                .then(function (subscription) {
                    if(!subscription) {
                        alert('Unable to unsubscribe from push ' + 'notification.');
                        return;
                    }
                    subscription.unsubscribe()
                        .then(function () {
                            console.log('Push notification unsubscribed.');
                            console.log(subscription);
                        })
                        .catch(function (error) {
                            console.error(error);
                        });
                })
                .catch(function (error) {
                    console.error('Failed to unsubscribe push ' +'notification.');
                });
        })
}


//---check if push notification is supported---
checkIfPushIsEnabled()


if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    const pushElement = document.querySelector('.push');
    const pushImage = document.querySelector('.image');
    pushElement.addEventListener('click', function () {
        //---check if you are already subscribed to push notifications---
        if (pushElement.dataset.checked === 'true') {
            unsubscribeFromPushNotification();
        }
        else {
            subscribeToPushNotification();
        }
    });
    let deferredPrompt;
    const btnAdd = document.getElementById('install-button');
    if (btnAdd) {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            // Update UI to notify the user they can add to home screen
            btnAdd.style.display = 'block';
        });

        btnAdd.addEventListener('click', () => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the A2HS prompt');
                } else {
                    console.log('User dismissed the A2HS prompt');
                }
                deferredPrompt = null;
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const script = document.createElement('script');
    script.src = '/node_modules/flowbite/dist/flowbite.min.js';
    document.body.appendChild(script);
    loadEvents();
});

function loadEvents() {
    const request = indexedDB.open('eventsDB', 1);

    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('events')) {
            db.createObjectStore('events', { autoIncrement: true });
        }
    };

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['events'], 'readonly');
        const objectStore = transaction.objectStore('events');
        const request = objectStore.getAll();

        request.onsuccess = function(event) {
            const events = event.target.result;
            const eventsContainer = document.getElementById('events-container');
            eventsContainer.innerHTML = '';

            events.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.classList.add('event');
                eventElement.innerHTML = `
                        <div class="w-48 text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <a href="/event/${event.id}"
                            class="inline-flex items-center w-full px-4 py-2 text-sm font-medium border-b border-gray-200 rounded-t-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-500 dark:focus:text-white">
                                <svg class="w-3 h-3 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M10 9.293l5.293-5.293a1 1 0 011.414 1.414L11.414 10l5.293 5.293a1 1 0 01-1.414 1.414L10 11.414l-5.293 5.293a1 1 0 01-1.414-1.414L8.586 10 3.293 4.707a1 1 0 011.414-1.414L10 8.586z"
                                        clip-rule="evenodd"/>
                                </svg>
                                ${event.event_name}
                            </a>
                        </div> `
                eventsContainer.appendChild(eventElement);
            });
        };
    }

    request.onerror = function(event) {
        console.log('Error loading events');
    }
}

if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark')
}

var themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
var themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

// Change the icons inside the button based on previous settings
if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    themeToggleLightIcon.classList.remove('hidden');
} else {
    themeToggleDarkIcon.classList.remove('hidden');
}

var themeToggleBtn = document.getElementById('theme-toggle');

themeToggleBtn.addEventListener('click', function () {

    // toggle icons inside button
    themeToggleDarkIcon.classList.toggle('hidden');
    themeToggleLightIcon.classList.toggle('hidden');

    // if set via local storage previously
    if (localStorage.getItem('color-theme')) {
        if (localStorage.getItem('color-theme') === 'light') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        }

        // if NOT set via local storage previously
    } else {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        }
    }
});

