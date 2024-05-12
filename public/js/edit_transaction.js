document.addEventListener('DOMContentLoaded', (event) => {
    const form = document.getElementById('edit-form');

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
        window.location.href = '/event';
    });
})