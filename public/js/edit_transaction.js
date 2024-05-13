document.addEventListener('DOMContentLoaded', (event) => {
    const form = document.getElementById('edit-form');
    const addDetailsButton = document.getElementById('add-details-button');

    addDetailsButton.addEventListener('click', function(event) {
        window.location.href = '/add-details';
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(form);
        // Selecciona todos los checkboxes que tienen el nombre 'participants[]'
        const participantCheckboxes = document.querySelectorAll('input[name="participants[]"]');

        // Crea un array para almacenar los valores de los checkboxes seleccionados
        const participants = [];

        // Itera sobre los checkboxes
        participantCheckboxes.forEach(checkbox => {
            // Si el checkbox está seleccionado, agrega su valor al array
            if (checkbox.checked) {
                participants.push(checkbox.value);
            }
        });

        const transactionForm = {
            who_paid: formData.get('who_paid'),
            for_what: formData.get('for_what'),
            how_much: formData.get('how_much'),
            when_date: formData.get('when_date'),
            participants: participants
        };

        console.log(transactionForm);

        saveTransactionForm(transactionForm);


        //window.location.href = '/event';
        window.location.href = '/add-details';
    });
})

function saveTransactionForm(transactionForm) {
    const request = window.indexedDB.open('transactionDB', 1);

    request.onerror = function(event) {
        console.error("Error al abrir la base de datos:", event.target.errorCode);
    };

    // Definir qué hacer cuando se abre la base de datos
    request.onupgradeneeded = function(event) {
        const db = event.target.result;

        // Crear una tienda de objetos para almacenar el formulario
        const objectStore = db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });

        // Definir los campos que se almacenarán
        objectStore.createIndex('who_paid', 'who_paid', { unique: false });
        objectStore.createIndex('for_what', 'for_what', { unique: false });
        objectStore.createIndex('how_much', 'how_much', { unique: false });
        objectStore.createIndex('when_date', 'when_date', { unique: false });
        objectStore.createIndex('participants', 'participants', { unique: false });
    };

    // Definir qué hacer cuando se abre correctamente la base de datos
    request.onsuccess = function(event) {
        const db = event.target.result;

        // Iniciar una transacción de lectura/escritura
        const transaction = db.transaction(['transactions'], 'readwrite');

        // Obtener el objeto de la tienda de objetos
        const objectStore = transaction.objectStore('transactions');

        // Agregar el formulario a la tienda de objetos
        const addRequest = objectStore.add(transactionForm);

        addRequest.onsuccess = function(event) {
            console.log('Formulario guardado correctamente en IndexedDB.');
        };

        addRequest.onerror = function(event) {
            console.error('Error al guardar el formulario en IndexedDB:', event.target.error);
        };
    };

    
}