import { createStore } from 'vuex'
import router from '../router'
import { auth, db } from '../firebase'
import { createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut } from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc } from 'firebase/firestore'

export default createStore({
  state: {
    user: null,
    documents: [] as any[]
  },
  getters: {
    getDocuments: (state) => state.documents
  },
  mutations: {

    SET_USER (state, user) {
      state.user = user
    },

    CLEAR_USER (state) {
      state.user = null
    },

    SET_DOCUMENTS (state, documents) {
      state.documents = documents
    }

  },
  actions: {

    async createDocument (_context, data: object) {
      try {
        const docRef = await addDoc(collection(db, "Config List"), data)
        console.log("Document written with ID: ", docRef.id)
      } catch (error) {
        console.error("Error adding document: ", error)
      }
    },

    async fetchDocuments ({ commit }) {
      try {
        const querySnapshot = await getDocs(collection(db, "Config List"))
        const documents = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        commit('SET_DOCUMENTS', documents)
      } catch (error) {
        console.error("Error fetching documents: ", error)
      }
    },

    async updateDocument (_context, { id, data }: { id: string, data: object }) {
      try {
        const docRef = doc(db, "Config List", id)
        await updateDoc(docRef, data)
        console.log("Document updated: ", id)
      } catch (error) {
        console.error("Error updating document: ", error)
      }
    },

    async deleteDocument (_context, id: string) {
      try {
        const docRef = doc(db, "Config List", id)
        await deleteDoc(docRef)
        console.log("Document deleted: ", id)
      } catch (error) {
        console.error("Error deleting document: ", error)
      }
    },

    async login ({ commit }, details) {
      const { email, password } = details

      try {
        await signInWithEmailAndPassword(auth, email, password)
      } catch (error) {
        if (error instanceof FirebaseError) {
          switch(error.code) {
            case 'auth/user-not-found':
              alert("User not found")
              break
            case 'auth/wrong-password':
              alert("Wrong password")
              break
            default:
              alert("Something went wrong")
          }
        } else {
          alert("Something went wrong")
        }

        return 
      }

      commit('SET_USER', auth.currentUser)

      router.push('/')
    },

    async register ({ commit }, details) {
      const { email, password } = details

      try {
        await createUserWithEmailAndPassword(auth, email, password)
      } catch (error) {
        if (error instanceof FirebaseError) {
          switch(error.code) {
            case 'auth/email-already-in-use':
              alert("Email already in use")
              break
            case 'auth/invalid-email':
              alert("Invalid email")
              break
            case 'auth/operation-not-allowed':
              alert('Operation not allowed')
              break
            case 'auth/weak-password':
              alert("Weak password")
              break
            default:
              alert("Something went wrong")
          }
        } else {
          alert("Something went wrong")
        }

        return 
      }

      commit('SET_USER', auth.currentUser)

      router.push('/')
    },

    async logout ({ commit }) {
      await signOut(auth)

      commit('CLEAR_USER')

      router.push('/login')
    },

    fetchUser ({ commit }) {
      auth.onAuthStateChanged(async user => {
        if (user === null) {
          commit('CLEAR_USER')
        } else {
          commit('SET_USER', user)

          if (router.currentRoute.value.path === '/login') {
            router.push('/')
          }
        }
      })
    }
  }
})
