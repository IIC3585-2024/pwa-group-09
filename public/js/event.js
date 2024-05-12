document.addEventListener('DOMContentLoaded', () => {

    const divs = document.getElementsByClassName('expense-user');
    for (let i = 0; i < divs.length; i++) {
        divs[i].addEventListener('click', function () {
            window.location.href = '/edit-transaction';
        });
    }
});