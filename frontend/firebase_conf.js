// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4Ggpdn5vhBGQlNT52r5Z9IEmCfOt2zis",
  authDomain: "torneor6-33014.firebaseapp.com",
  projectId: "torneor6-33014",
  storageBucket: "torneor6-33014.firebasestorage.app",
  messagingSenderId: "283944144295",
  appId: "1:283944144295:web:527ebdeaf9a60bf555fa82"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Funciones para manejar equipos
export async function agregarEquipo(equipo) {
  try {
    const docRef = await addDoc(collection(db, "equipos"), equipo);
    console.log("Equipo agregado con ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error al agregar equipo: ", error);
    throw error;
  }
}

export async function obtenerEquipos() {
  try {
    const equiposSnapshot = await getDocs(collection(db, "equipos"));
    const equiposList = equiposSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return equiposList;
  } catch (error) {
    console.error("Error al obtener equipos: ", error);
    throw error;
  }
}

export async function obtenerEquipo(equipoId) {
  try {
    const equipoRef = doc(db, "equipos", equipoId);
    const equipoDoc = await getDoc(equipoRef);
    
    if (equipoDoc.exists()) {
      return {
        id: equipoDoc.id,
        ...equipoDoc.data()
      };
    } else {
      throw new Error("El equipo no existe");
    }
  } catch (error) {
    console.error("Error al obtener equipo: ", error);
    throw error;
  }
}

export async function actualizarEquipo(equipoId, datosActualizados) {
  try {
    const equipoRef = doc(db, "equipos", equipoId);
    await updateDoc(equipoRef, datosActualizados);
    console.log("Equipo actualizado correctamente");
    return true;
  } catch (error) {
    console.error("Error al actualizar equipo: ", error);
    throw error;
  }
}

export async function eliminarEquipo(equipoId) {
  try {
    await deleteDoc(doc(db, "equipos", equipoId));
    console.log("Equipo eliminado correctamente");
    return true;
  } catch (error) {
    console.error("Error al eliminar equipo: ", error);
    throw error;
  }
}