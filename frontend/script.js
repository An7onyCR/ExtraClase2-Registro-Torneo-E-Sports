// script.js
// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC4Ggpdn5vhBGQlNT52r5Z9IEmCfOt2zis",
    authDomain: "torneor6-33014.firebaseapp.com",
    projectId: "torneor6-33014",
    storageBucket: "torneor6-33014.appspot.com",
    messagingSenderId: "283944144295",
    appId: "1:283944144295:web:527ebdeaf9a60bf555fa82"
  };
  
  // Inicializar Firebase
  console.log("Inicializando Firebase...");
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase inicializado");
  
  // Inicializar Firestore
  console.log("Inicializando Firestore...");
  const db = firebase.firestore();
  console.log("Firestore inicializado");
  
  // Autenticación anónima
  console.log("Iniciando autenticación anónima...");
  firebase.auth().signInAnonymously()
    .then(() => {
      console.log("Autenticación anónima exitosa");
      // Una vez autenticado, hacemos una prueba de conexión
      return db.collection("test").add({
        mensaje: "Prueba de conexión",
        timestamp: new Date().toISOString()
      });
    })
    .then((docRef) => {
      console.log("Prueba de conexión exitosa. ID del documento:", docRef.id);
      // Cargar equipos iniciales
      loadTeams();
    })
    .catch((error) => {
      console.error("Error en autenticación o prueba:", error);
      alert("Error al conectar con Firebase: " + error.message);
    });
  
  // Variables globales
  let teams = [];
  let editingTeamId = null;
  
  document.addEventListener("DOMContentLoaded", function () {
      console.log("DOM cargado completamente");
      
      const form = document.getElementById("team-form");
      const teamList = document.getElementById("teams-list");
      const bracketContainer = document.getElementById("bracket");
      const generateBracketBtn = document.getElementById("generate-bracket");
      const cancelEditBtn = document.getElementById("cancel-edit");
      const editMemberModal = document.getElementById("edit-member-modal");
      const closeModalBtn = document.querySelector(".close");
      const editMemberForm = document.getElementById("edit-member-form");
      
      // Manejo del formulario para registrar equipos
      form.addEventListener("submit", function (e) {
          e.preventDefault();
          console.log("Formulario enviado");
          
          const teamName = document.getElementById("team-name").value;
          const teamMembers = document.getElementById("team-members").value.split(",");
          
          if (teamName.trim() === "" || teamMembers.length === 0) {
              alert("Por favor, ingresa un nombre de equipo y sus miembros.");
              return;
          }
          
          console.log("Datos del equipo:", {
              name: teamName.trim(),
              members: teamMembers.map(member => member.trim())
          });
          
          if (editingTeamId) {
              // Actualizar equipo existente
              console.log("Actualizando equipo con ID:", editingTeamId);
              db.collection("equipos").doc(editingTeamId).update({
                  name: teamName.trim(),
                  members: teamMembers.map(member => member.trim()),
                  updatedAt: new Date().toISOString()
              })
              .then(function() {
                  console.log("Equipo actualizado correctamente");
                  alert("Equipo actualizado correctamente");
                  
                  // Resetear modo edición
                  editingTeamId = null;
                  document.getElementById("submit-button").textContent = "Registrar Equipo";
                  cancelEditBtn.style.display = "none";
                  
                  // Recargar equipos y resetear formulario
                  form.reset();
                  loadTeams();
              })
              .catch(function(error) {
                  console.error("Error al actualizar equipo:", error);
                  alert("Error al actualizar equipo: " + error.message);
              });
          } else {
              // Crear nuevo equipo
              const team = {
                  name: teamName.trim(),
                  members: teamMembers.map(member => member.trim()),
                  showMembers: false,
                  createdAt: new Date().toISOString()
              };
              
              console.log("Agregando nuevo equipo:", team);
              db.collection("equipos").add(team)
              .then(function(docRef) {
                  console.log("Equipo agregado con ID:", docRef.id);
                  alert("Equipo registrado correctamente");
                  
                  // Recargar equipos y resetear formulario
                  form.reset();
                  loadTeams();
              })
              .catch(function(error) {
                  console.error("Error al agregar equipo:", error);
                  alert("Error al registrar equipo: " + error.message);
              });
          }
      });
      
      // Cancelar edición
      cancelEditBtn.addEventListener("click", function() {
          editingTeamId = null;
          document.getElementById("submit-button").textContent = "Registrar Equipo";
          cancelEditBtn.style.display = "none";
          form.reset();
      });
      
      // Cerrar modal
      closeModalBtn.addEventListener("click", function() {
          editMemberModal.style.display = "none";
      });
      
      // Cerrar modal haciendo clic fuera de él
      window.addEventListener("click", function(event) {
          if (event.target === editMemberModal) {
              editMemberModal.style.display = "none";
          }
      });
      
      // Guardar cambios de miembro editado
      editMemberForm.addEventListener("submit", function(e) {
          e.preventDefault();
          
          const teamId = document.getElementById("edit-team-id").value;
          const memberIndex = parseInt(document.getElementById("edit-member-index").value);
          const newMemberName = document.getElementById("edit-member-name").value.trim();
          
          if (!newMemberName) {
              alert("El nombre del miembro no puede estar vacío.");
              return;
          }
          
          console.log("Actualizando miembro:", {
              teamId: teamId,
              memberIndex: memberIndex,
              newName: newMemberName
          });
          
          // Obtener equipo actual
          db.collection("equipos").doc(teamId).get()
          .then(function(doc) {
              if (doc.exists) {
                  const team = { id: doc.id, ...doc.data() };
                  
                  // Actualizar miembro
                  team.members[memberIndex] = newMemberName;
                  
                  // Guardar cambios
                  return db.collection("equipos").doc(teamId).update({ 
                      members: team.members,
                      updatedAt: new Date().toISOString() 
                  });
              } else {
                  throw new Error("El equipo no existe");
              }
          })
          .then(function() {
              console.log("Miembro actualizado correctamente");
              alert("Miembro actualizado correctamente");
              
              // Cerrar modal y recargar equipos
              editMemberModal.style.display = "none";
              loadTeams();
          })
          .catch(function(error) {
              console.error("Error al actualizar miembro:", error);
              alert("Error al actualizar miembro: " + error.message);
          });
      });
      
      // Evento para generar el bracket al hacer clic en el botón
      generateBracketBtn.addEventListener("click", generateBracket);
  });
  
  // Función para cargar equipos desde Firebase
  function loadTeams() {
      console.log("Cargando equipos desde Firestore...");
      db.collection("equipos").get()
      .then(function(snapshot) {
          console.log("Equipos obtenidos:", snapshot.size);
          teams = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
          }));
          updateTeamList();
      })
      .catch(function(error) {
          console.error("Error al cargar equipos:", error);
          alert("Error al cargar equipos: " + error.message);
      });
  }
  
  // Función para actualizar la lista de equipos
  function updateTeamList() {
      console.log("Actualizando lista de equipos en el DOM");
      const teamList = document.getElementById("teams-list");
      teamList.innerHTML = "";
      
      if (teams.length === 0) {
          teamList.innerHTML = "<p class='no-teams'>No hay equipos registrados aún.</p>";
          return;
      }
      
      teams.forEach((team) => {
          const teamCard = document.createElement("div");
          teamCard.classList.add("team-card");
          
          const membersDisplay = team.members.length > 0 
              ? team.members.join(", ") 
              : "No hay miembros";
          
          teamCard.innerHTML = `
              <h3>${team.name}</h3>
              <div class="team-actions">
                  <button class="show-members" data-id="${team.id}">
                      ${team.showMembers ? 'Ocultar Miembros' : 'Ver Miembros'}
                  </button>
                  <button class="edit-team" data-id="${team.id}">Editar</button>
                  <button class="delete-team" data-id="${team.id}">Eliminar</button>
              </div>
              <div id="members-${team.id}" class="members-list" style="display: ${team.showMembers ? 'block' : 'none'}">
                  <h4>Miembros:</h4>
                  <ul>
                      ${team.members.map((member, index) => `
                          <li>
                              ${member}
                              <div class="member-actions">
                                  <button class="edit-member" data-team-id="${team.id}" data-member-index="${index}">Editar</button>
                                  <button class="delete-member" data-team-id="${team.id}" data-member-index="${index}">Eliminar</button>
                              </div>
                          </li>
                      `).join('')}
                  </ul>
              </div>
          `;
          
          teamList.appendChild(teamCard);
      });
      
      // Agregar eventos a los botones
      addButtonEvents();
  }
  
  // Función para agregar eventos a los botones de los equipos
  function addButtonEvents() {
      // Botones "Ver Miembros"
      document.querySelectorAll(".show-members").forEach(button => {
          button.addEventListener("click", function () {
              const teamId = this.getAttribute("data-id");
              const teamIndex = teams.findIndex(t => t.id === teamId);
              
              if (teamIndex !== -1) {
                  teams[teamIndex].showMembers = !teams[teamIndex].showMembers;
                  
                  // Actualizar visualización
                  const membersDiv = document.getElementById(`members-${teamId}`);
                  membersDiv.style.display = teams[teamIndex].showMembers ? "block" : "none";
                  this.textContent = teams[teamIndex].showMembers ? "Ocultar Miembros" : "Ver Miembros";
              }
          });
      });
      
      // Botones "Editar" equipo
      document.querySelectorAll(".edit-team").forEach(button => {
          button.addEventListener("click", function () {
              const teamId = this.getAttribute("data-id");
              console.log("Editando equipo con ID:", teamId);
              
              db.collection("equipos").doc(teamId).get()
              .then(function(doc) {
                  if (doc.exists) {
                      const team = { id: doc.id, ...doc.data() };
                      
                      // Rellenar el formulario con los datos actuales
                      document.getElementById("team-name").value = team.name;
                      document.getElementById("team-members").value = team.members.join(", ");
                      
                      // Cambiar a modo edición
                      editingTeamId = teamId;
                      document.getElementById("submit-button").textContent = "Actualizar Equipo";
                      document.getElementById("cancel-edit").style.display = "inline";
                      
                      // Desplazarse hacia el formulario
                      document.getElementById("team-container").scrollIntoView({ behavior: "smooth" });
                  } else {
                      console.error("No existe el equipo con ID:", teamId);
                      alert("El equipo seleccionado ya no existe.");
                  }
              })
              .catch(function(error) {
                  console.error("Error al cargar equipo para editar:", error);
                  alert("Error al cargar datos del equipo: " + error.message);
              });
          });
      });
      
      // Botones "Eliminar" equipo
      document.querySelectorAll(".delete-team").forEach(button => {
          button.addEventListener("click", function () {
              if (confirm("¿Estás seguro de eliminar este equipo? Esta acción no se puede deshacer.")) {
                  const teamId = this.getAttribute("data-id");
                  console.log("Eliminando equipo con ID:", teamId);
                  
                  db.collection("equipos").doc(teamId).delete()
                  .then(function() {
                      console.log("Equipo eliminado correctamente");
                      alert("Equipo eliminado correctamente");
                      loadTeams();
                  })
                  .catch(function(error) {
                      console.error("Error al eliminar equipo:", error);
                      alert("Error al eliminar equipo: " + error.message);
                  });
              }
          });
      });
      
      // Botones "Editar" miembro
      document.querySelectorAll(".edit-member").forEach(button => {
          button.addEventListener("click", function () {
              const teamId = this.getAttribute("data-team-id");
              const memberIndex = this.getAttribute("data-member-index");
              const team = teams.find(t => t.id === teamId);
              
              if (team && team.members[memberIndex]) {
                  // Rellenar el formulario modal
                  document.getElementById("edit-team-id").value = teamId;
                  document.getElementById("edit-member-index").value = memberIndex;
                  document.getElementById("edit-member-name").value = team.members[memberIndex];
                  
                  // Mostrar modal
                  document.getElementById("edit-member-modal").style.display = "block";
              }
          });
      });
      
      // Botones "Eliminar" miembro
      document.querySelectorAll(".delete-member").forEach(button => {
          button.addEventListener("click", function () {
              if (confirm("¿Estás seguro de eliminar este miembro? Esta acción no se puede deshacer.")) {
                  const teamId = this.getAttribute("data-team-id");
                  const memberIndex = parseInt(this.getAttribute("data-member-index"));
                  
                  console.log("Eliminando miembro:", {
                      teamId: teamId,
                      memberIndex: memberIndex
                  });
                  
                  db.collection("equipos").doc(teamId).get()
                  .then(function(doc) {
                      if (doc.exists) {
                          const team = { id: doc.id, ...doc.data() };
                          
                          // Eliminar miembro
                          team.members.splice(memberIndex, 1);
                          
                          // Guardar cambios
                          return db.collection("equipos").doc(teamId).update({ 
                              members: team.members,
                              updatedAt: new Date().toISOString() 
                          });
                      } else {
                          throw new Error("El equipo no existe");
                      }
                  })
                  .then(function() {
                      console.log("Miembro eliminado correctamente");
                      alert("Miembro eliminado correctamente");
                      loadTeams();
                  })
                  .catch(function(error) {
                      console.error("Error al eliminar miembro:", error);
                      alert("Error al eliminar miembro: " + error.message);
                  });
              }
          });
      });
  }
  
  // Función para generar el bracket del torneo
  function generateBracket() {
      if (teams.length < 2) {
          alert("Se necesitan al menos 2 equipos para generar un bracket.");
          return;
      }
      
      let shuffledTeams = [...teams];
      shuffledTeams.sort(() => Math.random() - 0.5);
      
      if (shuffledTeams.length % 2 !== 0) {
          shuffledTeams.push({ name: "BYE", members: [] });
      }
      
      let bracketHTML = "<h3>Partidos Generados</h3>";
      for (let i = 0; i < shuffledTeams.length; i += 2) {
          bracketHTML += `<p>${shuffledTeams[i].name} vs ${shuffledTeams[i + 1].name}</p>`;
      }
      
      document.getElementById("bracket").innerHTML = bracketHTML;
  }