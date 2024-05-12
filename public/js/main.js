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
});


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

