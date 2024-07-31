function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    updateFlipCard('hours', hours);
    updateFlipCard('minutes', minutes);
}
function updateFlipCard(unit, value) {
    const topElement = document.getElementById(`${unit}-top`);
    const bottomElement = document.getElementById(`${unit}-bottom`);
    if (topElement.textContent !== value) {
        topElement.textContent = value;
        bottomElement.textContent = value;
        const flipCardInner = topElement.closest('.flip-card-inner');
        flipCardInner.style.transform = 'rotateX(180deg)';
        setTimeout(() => {
            flipCardInner.style.transform = '';
        }, 600);
    }
}
setInterval(updateTime, 1000);
updateTime();
// debut du code pour le calendrier
document.addEventListener('DOMContentLoaded', function() {
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    let events = JSON.parse(localStorage.getItem('events')) || {};

    function generateCalendar(month, year) {
        let firstDay = new Date(year, month, 1);
        let lastDay = new Date(year, month + 1, 0);
        let startingDay = firstDay.getDay();
        let monthLength = lastDay.getDate();
        let monthYearString = new Date(year, month).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
        document.getElementById('monthYear').textContent = monthYearString;
        let calendarBody = document.getElementById('calendar-body');
        calendarBody.innerHTML = '';

        let date = 1;
        for (let i = 0; i < 6; i++) {
            let row = document.createElement('tr');
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < startingDay) {
                    let cell = document.createElement('td');
                    row.appendChild(cell);
                } else if (date > monthLength) {
                    break;
                } else {
                    let cell = document.createElement('td');
                    cell.textContent = date;
                    if (date === currentDate.getDate() && year === currentDate.getFullYear() && month === currentDate.getMonth()) {
                        cell.classList.add('today');
                    }
                    
                    // Ajouter les événements à la cellule
                    let dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
                    if (events[dateString]) {
                        let dot = document.createElement('span');
                        dot.className = 'event-dot';
                        cell.appendChild(dot);

                        let eventList = document.createElement('div');
                        eventList.className = 'event-list';
                        events[dateString].forEach(event => {
                            let eventItem = document.createElement('div');
                            eventItem.textContent = event.title;
                            eventList.appendChild(eventItem);
                        });
                        cell.appendChild(eventList);
                    }

                    row.appendChild(cell);
                    date++;
                }
            }
            calendarBody.appendChild(row);
        }
    }
    generateCalendar(currentMonth, currentYear);

    document.getElementById('prevMonth').addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar(currentMonth, currentYear);
    });
    document.getElementById('nextMonth').addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar(currentMonth, currentYear);
    });

    // Gestion du modal pour ajouter des événements
    let modal = document.getElementById('eventModal');
    let addEventBtn = document.getElementById('addEventBtn');
    let span = document.getElementsByClassName('close')[0];

    addEventBtn.onclick = function() {
        modal.style.display = 'block';
        document.getElementById('eventDate').value = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
    }
    span.onclick = function() {
        modal.style.display = 'none';
    }
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
    document.getElementById('eventForm').addEventListener('submit', function(e) {
        e.preventDefault();
        let title = document.getElementById('eventTitle').value;
        let date = document.getElementById('eventDate').value;
        let description = document.getElementById('eventDescription').value;

        if (!events[date]) {
            events[date] = [];
        }
        events[date].push({ title, description });
        localStorage.setItem('events', JSON.stringify(events));
        modal.style.display = 'none';
        generateCalendar(currentMonth, currentYear);
        document.getElementById('eventForm').reset();// Réinitialiser le formulaire
    });
    // Permettre l'ouverture du modal en cliquant sur une date
    document.getElementById('calendar-body').addEventListener('click', function(e) {
        if (e.target.tagName === 'TD' && e.target.textContent !== '') {
            modal.style.display = 'block';
            let clickedDate = new Date(currentYear, currentMonth, parseInt(e.target.textContent));
            document.getElementById('eventDate').value = clickedDate.toISOString().split('T')[0];
        }
    });
});
// fin calendrier et heure
const apiKey = "Bearer 0644f7fb-2093-40ad-b1e1-246c75f24fbd"
const baseUrl = 'http://146.59.242.125:3009';
async function handleFetchResponse(response) {
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody}`);
    }
    return response.json();
}
function displayError(message) {
    const errorContainer = document.getElementById('errorContainer') || document.createElement('div');
    errorContainer.id = 'errorContainer';
    errorContainer.style.color = 'red';
    errorContainer.textContent = message;
    document.body.prepend(errorContainer);
setTimeout(() => {
    errorContainer.style.display = 'none';
}, 5000);
}
// Promo management functions
async function getPromos() {
    try {
        const response = await fetch(`${baseUrl}/promos`, {
            headers: {
                'Content-Type': 'application/json',
                'authorization': apiKey
            }
        });
        return await handleFetchResponse(response);
    } catch (error) {
        displayError(`Erreur lors de la récupération des promos: ${error.message}`);
        throw error;
    }
}

async function displayPromos() {
    try {
        const promos = await getPromos();
        const promoContainer = document.getElementById("promosContainer");
        if (!promoContainer) {
            throw new Error('Le conteneur des promos n\'a pas été trouvé');
        }
        promoContainer.innerHTML = "";
        promos.forEach(promo => {
            let promoCard = document.createElement("div");
            promoCard.classList.add("promo");
            promoCard.innerHTML = `
                <h2>${promo.name}</h2>
                <button class="delete">x</button>
                <button class="update">Modifier</button>
                <a href="details.html?id=${promo._id}">Voir les étudiants</a>
            `;
            promoCard.querySelector('.delete').addEventListener('click', () => deletePromo(promo._id));
            promoCard.querySelector('.update').addEventListener('click', () => {
                showUpdatePromoForm(promo);
            });
            promoContainer.appendChild(promoCard);
        });
    } catch (error) {
        displayError(`Erreur lors de l'affichage des promos: ${error.message}`);
    }
}
async function addPromo() {
    const name = document.querySelector('#name').value;
    const startDate = document.querySelector('#startDate').value;
    const endDate = document.querySelector('#endDate').value;
    if (!name || !startDate || !endDate) {
        displayError('Tous les champs sont requis pour ajouter une promo');
        return;
    }
    const body = { name, startDate, endDate };
    try {
        const response = await fetch(`${baseUrl}/promos`, {
            method: 'POST',
            headers: {
                'authorization': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });
        const data = await handleFetchResponse(response);
        console.log('Promo ajoutée:', data);
        displayPromos();
    } catch (error) {
        displayError(`Erreur lors de l'ajout de la promo: ${error.message}`);
    }
}
async function deletePromo(promoId) {
    try {
        const response = await fetch(`${baseUrl}/promos/${promoId}`, {
            method: 'DELETE',
            headers: {
                'authorization': apiKey
            }
        });
        const data = await handleFetchResponse(response);
        console.log('Promo supprimée:', data);
        displayPromos();
    } catch (error) {
        displayError(`Erreur lors de la suppression de la promo: ${error.message}`);
        throw error;
    }
}
function showUpdatePromoForm(promo) {
    document.getElementById('updatePromoId').value = promo._id;
    document.getElementById('updatePromoName').value = promo.name;
    document.getElementById('updatePromoStartDate').value = promo.startDate.split('T')[0]; // Pour formater la date correctement
    document.getElementById('updatePromoEndDate').value = promo.endDate.split('T')[0]; // Pour formater la date correctement

    document.getElementById('updatePromoForm').classList.remove("hidden")
}
async function handleUpdatePromoSubmit(event) {
    event.preventDefault();
    const promoId = document.getElementById('updatePromoId').value;
    const name = document.getElementById('updatePromoName').value;
    const startDate = document.getElementById('updatePromoStartDate').value;
    const endDate = document.getElementById('updatePromoEndDate').value;
    if (!name || !startDate || !endDate) {
        displayError('Tous les champs sont requis pour mettre à jour une promo');
        return;
    }
    const body = { name, startDate, endDate };
    try {
        const response = await fetch(`${baseUrl}/promos/${promoId}`, {
            method: 'PUT',
            headers: {
                'authorization': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });
        const data = await handleFetchResponse(response);
        document.getElementById('updatePromoForm').classList.add("hidden")
        displayPromos();
    } catch (error) {
        displayError(`Erreur lors de la mise à jour de la promo: ${error.message}`);
    }
}
// Student management functions
function getPromoId() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (!id) {
        displayError('Le paramètre ID de la promo est manquant dans l\'URL');
        return null;
    }
    return id;
}
async function getStudentsByPromo(promoId) {
    try {
        const response = await fetch(`${baseUrl}/promos/${promoId}`, {
            headers: {
                'authorization': apiKey
            }
        });
        const data = await handleFetchResponse(response);
        return data.students;
    } catch (error) {
        displayError(`Erreur lors de la récupération des étudiants de la promo: ${error.message}`);
        throw error;
    }
}
async function displayStudents() {
    const promoId = getPromoId();
    if (!promoId) {
        displayError('Impossible d\'afficher les étudiants: l\'ID de la promo est manquant');
        return;
    }
    try {
        const students = await getStudentsByPromo(promoId);
        const studentContainer = document.getElementById("studentContainer");
        if (!studentContainer) {
            throw new Error('Le conteneur des étudiants n\'a pas été trouvé');
        }
        studentContainer.innerHTML = "";
        students.forEach(student => {
            let studentCard = document.createElement("div");
            studentCard.classList.add("student");
            studentCard.id = `student-${student._id}`;
            studentCard.innerHTML = `
                <h2 class="title">${student.firstName} ${student.lastName}</h2>
                <p>Age: ${student.age}</p>
                <div class="buttonContainer">
                    <button type="button" class="modify">Modifier</button>
                    <button type="button" class="supp">x</button>
                </div>
            `;
            studentCard.querySelector('.supp').addEventListener('click', async () => {
                try {
                    await deleteStudent(student._id);
                    displayStudents();
                } catch (error) {
                    displayError(`Erreur lors de la suppression de l'étudiant: ${error.message}`);
                }
            });
            studentCard.querySelector('.modify').addEventListener('click', () => {
                showUpdateStudentForm(student);
            });
            studentContainer.appendChild(studentCard);
        });
    } catch (error) {
        displayError(`Erreur lors de l'affichage des étudiants: ${error.message}`);
    }
}
async function addStudent() {
    const lastName = document.querySelector('#lastName').value;
    const firstName = document.querySelector('#firstName').value;
    const age = document.querySelector('#age').value;
    
    if (!firstName || !lastName || !age) {
        displayError('Tous les champs sont requis pour ajouter un étudiant');
        return;
    }
    const promoId = getPromoId();
    if (!promoId) {
        displayError('Impossible d\'ajouter un étudiant: l\'ID de la promo est manquant');
        return;
    }
    const body = { firstName, lastName, age };
    try {
        const response = await fetch(`${baseUrl}/promos/${promoId}/students`, {
            method: "POST",
            headers: {
                'authorization': apiKey,
                "Content-type": "application/json",
            },
            body: JSON.stringify(body),
        });
        const data = await handleFetchResponse(response);
        console.log('Étudiant ajouté:', data);
        displayStudents();
    } catch (error) {
        displayError(`Erreur lors de l'ajout de l'étudiant: ${error.message}`);
    }
}
async function deleteStudent(studentId) {
    try {
        const response = await fetch(`${baseUrl}/promos/${getPromoId()}/students/${studentId}`, {
            method: "DELETE",
            headers: {
                'authorization': apiKey,
                'Content-Type': 'application/json'
            }
        });
        const data = await handleFetchResponse(response);
        removeStudentFromUI(studentId);
        return data;
    } catch (error) {
        displayError(`Erreur lors de la suppression de l'étudiant: ${error.message}`);
        throw error;
    }
}
function removeStudentFromUI(studentId) {
    const studentElement = document.getElementById(`student-${studentId}`);
    if (studentElement) {
        studentElement.remove();
    } else {
        console.warn(`L'élément étudiant avec l'id student-${studentId} n'a pas été trouvé`);
    }
}
function showUpdateStudentForm(student) {
    document.getElementById('updateStudentId').value = student._id;
    document.getElementById('updateStudentFirstName').value = student.firstName;
    document.getElementById('updateStudentLastName').value = student.lastName;
    document.getElementById('updateStudentAge').value = student.age;
    document.getElementById('updateStudentForm').classList.remove('hidden');
}
async function handleUpdateStudentSubmit(event) {
    document.getElementById('updateStudentForm').classList.add('hidden');

    event.preventDefault();
    const studentId = document.getElementById('updateStudentId').value;
    const firstName = document.getElementById('updateStudentFirstName').value;
    const lastName = document.getElementById('updateStudentLastName').value;
    const age = document.getElementById('updateStudentAge').value;
    if (!firstName || !lastName || !age) {
        displayError('Tous les champs sont requis pour mettre à jour un étudiant');
        return;
    }
    const body = { firstName, lastName, age };
    try {
        const response = await fetch(`${baseUrl}/promos/${getPromoId()}/students/${studentId}`, {
            method: 'PUT',
            headers: {
                'authorization': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });
        const data = await handleFetchResponse(response);
        document.getElementById('updateStudentForm').classList.add('hidden')

        displayStudents();
    } catch (error) {
        displayError(`Erreur lors de la mise à jour de l'étudiant: ${error.message}`);
    }
}
// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    const addPromoButton = document.getElementById('addPromoButton');
    const addStudentButton = document.getElementById('addStudentButton');
    const updatePromoForm = document.getElementById('updatePromoForm');
    const updateStudentForm = document.getElementById('updateStudentForm');
    if (addPromoButton) {
        addPromoButton.addEventListener('click', addPromo);
    }
    if (addStudentButton) {
        addStudentButton.addEventListener('click', addStudent);
    }
    if (updatePromoForm) {
        updatePromoForm.addEventListener('submit', handleUpdatePromoSubmit);
    }
    if (updateStudentForm) {
        updateStudentForm.addEventListener('submit', handleUpdateStudentSubmit);
    }
    if (window.location.pathname.includes('details.html')) {
        displayStudents();
    } else {
        displayPromos();
    }
});