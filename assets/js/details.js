// Fonction pour obtenir les étudiants d'une promo
async function getStudentsByPromo(promoId) {
    try {
        const response = await fetch(`${baseUrl}/promos/${promoId}`, {
            headers: {
                'authorization': apiKey
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.students;
    } catch (error) {
        console.error('There was a problem fetching the students by promo:', error);
        throw error;
    }
}
// Fonction pour afficher les étudiants
async function displayStudents() {
    const promoId = getPromoId(); 
    if(!promoId){
        console.error('cannot display students: Promo ID is missing'); 
        return;
    }
    try {
        const students = await getStudentsByPromo(promoId);
        const studentContainer = document.getElementById("studentContainer");
        if(!studentContainer){
            console.error('Student container not found');
            return;
        }
        studentContainer.innerHTML = "";
        students.forEach(student => {
            let studentCard = document.createElement("div");
            studentCard.classList.add("student");
            studentCard.innerHTML = `
                <h2 class="title">${student.firstName} ${student.lastName}</h2>
                <div class="buttonContainer">
                    <button class="supp">delete</button>
                </div>
            `;
            studentCard.querySelector('.supp').addEventListener('click', async () => {
                await deleteStudent(student._id);
                displayStudents();
            });
            studentContainer.appendChild(studentCard);
        });
    } catch (error) {
        console.error('There was a problem displaying the students:', error);
    }
}
// Fonction pour supprimer un étudiant
async function deleteStudent(studentId) {
    try {
        const promoId = getPromoId();
        const response = await fetch(`${baseUrl}/promos/${promoId}/students/${studentId}`, {
            method: "DELETE",
            headers: {
                'authorization': apiKey,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Student deleted:', data);
    } catch (error) {
        console.error('There was a problem with the delete operation:', error);
        throw error;
    }
}
// Fonction pour ajouter un étudiant
async function addStudent() {
    const firstName = document.querySelector('#nameStudent').value;
    const lastName = document.querySelector('#firstnameStudent').value;
    const age = document.querySelector('#birthday').value;
    if (!firstName ||  !lastName || !age) {
        console.error('All fields are required');
        return;
    }
    const promoId = getPromoId();
    if (!promoId) {
        console.error('Cannot add student: Promo ID is missing');
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
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Student added:', data);
        displayStudents();
    } catch (error) {
        console.error('There was a problem adding the student:', error);
    }
}